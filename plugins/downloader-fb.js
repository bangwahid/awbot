const axios = require('axios')
const cheerio = require('cheerio')

const headers = {
  Accept: '*/*',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  Origin: 'https://fsaver.net',
  Referer: 'https://fsaver.net/',
  'Sec-Ch-Ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
  'Sec-Ch-Ua-Mobile': '?1',
  'Sec-Ch-Ua-Platform': '"Android"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10)'
}

async function fbDownloader(url) {
  try {
    // ambil token challenge
    const { data: cData, headers: cHeaders } = await axios.post(
      'https://fsaver.net/api/challenge',
      { url },
      {
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      }
    )

    const token =
      typeof cData === 'string'
        ? cData
        : (cData?.token || '')

    if (!token) {
      throw new Error('Token tidak ditemukan.')
    }

    // cookie
    const cookie =
      cHeaders['set-cookie']
        ?.map(c => c.split(';')[0])
        .join('; ') || ''

    // payload
    const payload = new URLSearchParams({
      url,
      token
    }).toString()

    // request html hasil
    const { data: html } = await axios.post(
      'https://fsaver.net/en/download',
      payload,
      {
        headers: {
          ...headers,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Content-Type':
            'application/x-www-form-urlencoded',
          ...(cookie && {
            Cookie: cookie
          })
        }
      }
    )

    const $ = cheerio.load(html)

    const video_url =
      $('a.download__item__info__actions__button')
        .attr('href') || ''

    if (!video_url) {
      throw new Error('Video tidak ditemukan.')
    }

    const title =
      $('.download__item__profile_pic div')
        .text()
        .replace(/\s+/g, ' ')
        .replace(
          'Facebook Video @Facebook Video',
          ''
        )
        .trim() || 'Facebook Video'

    return {
      status: true,
      data: {
        title,
        video_url
      }
    }

  } catch (e) {
    return {
      status: false,
      error:
        e.response?.data ||
        e.message ||
        e.toString()
    }
  }
}

let handler = async (
  m,
  { conn, text, usedPrefix, command }
) => {

  if (!text) {
    throw `
Contoh:
${usedPrefix + command} https://facebook.com/x
`
  }

  try {
    m.reply('⏳ Sedang mengambil video Facebook...')

    const res = await fbDownloader(text)

    if (!res.status) {
      throw res.error
    }

    const { title, video_url } = res.data

    let caption = `
╭━━━〔 FACEBOOK DOWNLOADER 〕━━━⬣
│
│ 🎬 Title :
│ ${title}
│
│ ✅ Status :
│ Success Download
│
╰━━━━━━━━━━━━━━━━━━⬣
`.trim()

    await conn.sendMessage(
      m.chat,
      {
        video: {
          url: video_url
        },
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`,
        caption
      },
      { quoted: m }
    )

  } catch (e) {
    console.log(e)

    m.reply('❌ Gagal mengambil video Facebook.')
  }
}

handler.help = ['fb']
handler.tags = ['downloader']
handler.command = /^(fb|facebook|fbdl)$/i

module.exports = handler