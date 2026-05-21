const axios = require('axios')

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 13)',
  Referer: 'https://media.ytmp3.gg/'
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const resolusi = {
  '144': '144p',
  '144p': '144p',
  '360': '360p',
  '360p': '360p',
  '480': '480p',
  '480p': '480p',
  '720': '720p',
  '720p': '720p',
  '1080': '1080p',
  '1080p': '1080p'
}

function ambilId(link) {
  try {
    const u = new URL(link)

    if (u.hostname.includes('youtu.be')) {
      return u.pathname.split('/').filter(Boolean)[0]
    }

    if (u.pathname.includes('/shorts/')) {
      return u.pathname.split('/shorts/')[1]?.split('/')[0]
    }

    return u.searchParams.get('v')
  } catch {
    return null
  }
}

async function tungguSelesai(statusUrl) {
  for (let i = 0; i < 120; i++) {
    const { data } = await axios.get(statusUrl, {
      headers
    })

    if (data.status === 'completed' && data.downloadUrl) {
      return data
    }

    if (data.status === 'failed' || data.status === 'error') {
      throw data
    }

    await delay(5000)
  }

  throw {
    status: 'timeout',
    message: 'Proses terlalu lama.'
  }
}

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) {
    throw `
Contoh:
${usedPrefix + command} https://youtu.be/xxxxx 720p

Pilihan Resolusi 
144p
360p
480p
720p
1080p
`
  }

  let url = args[0]
  let pilihResolusi = args[1] || '720p'

  let quality = resolusi[pilihResolusi] || '720p'
  let videoId = ambilId(url)

  if (!videoId) {
    throw 'Link YouTube tidak valid.'
  }

  try {
    m.reply('⏳ Sedang memproses video...')

    const cleanUrl = `https://youtube.com/watch?v=${videoId}`
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`

    const [dmca, oembed] = await Promise.all([
      axios.get('https://dmca.ytmp3.gg/api/check', {
        params: {
          url: cleanUrl
        },
        headers
      }),

      axios.get('https://www.youtube.com/oembed', {
        params: {
          url: watchUrl,
          format: 'json'
        },
        headers
      })
    ])

    const download = await axios.post(
      'https://ytdl.y2mp3.co/api/v2/download',
      {
        url: cleanUrl,
        output: {
          type: 'video',
          format: 'mp4',
          quality
        }
      },
      {
        headers
      }
    )

    const status = await tungguSelesai(download.data.statusUrl)

    let caption = `
╭━━━〔 YOUTUBE MP4 〕━━━⬣
│
│ 🎬 Title :
│ ${oembed.data.title}
│
│ 📺 Channel :
│ ${oembed.data.author_name}
│
│ 📹 Quality :
│ ${quality}
│
│ 🔗 Link :
│ ${cleanUrl}
│
╰━━━━━━━━━━━━━━━━⬣
`.trim()

    await conn.sendMessage(m.chat, {
      video: {
        url: status.downloadUrl
      },
      mimetype: 'video/mp4',
      fileName: `${oembed.data.title}.mp4`,
      caption
    }, {
      quoted: m
    })

  } catch (e) {
    console.log(e)

    m.reply('❌ Gagal mendownload video.')
  }
}

handler.help = ['ytmp4']
handler.tags = ['downloader']
handler.command = /^(ytmp4|mp4)$/i

module.exports = handler