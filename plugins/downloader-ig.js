let axios = require('axios')
let cheerio = require('cheerio')

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:\n${usedPrefix + command} https://www.instagram.com/reel/xxxx`)
  }

  await m.reply('⏳ Sedang mengambil media Instagram...')

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Origin': 'https://reelsvideo.io',
      'Referer': 'https://reelsvideo.io/en'
    }

    const { data: mainHtml, headers: resHeaders } = await axios.get('https://reelsvideo.io/en', {
      headers
    })

    headers['Cookie'] = resHeaders['set-cookie']
      ?.map(v => v.split(';')[0])
      .join('; ') || ''

    headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    headers['Hx-Request'] = 'true'
    headers['Hx-Target'] = 'target'
    headers['Hx-Trigger'] = 'main-form'

    const $ = cheerio.load(mainHtml)

    const formPost =
      $('form').attr('hx-post') ||
      $('form').attr('data-hx-post') ||
      '/'

    let tt = $('input[name="tt"]').attr('value') || ''
    let ts = $('input[name="ts"]').attr('value') || ''

    if (!tt) {
      const vals = $('form').attr('data-include-vals') || ''

      const mTt = vals.match(/tt:\s*'([^']+)'/)
      const mTs = vals.match(/ts:\s*(\d+)/)

      if (mTt) tt = mTt[1]
      if (mTs) ts = mTs[1]
    }

    const payload = new URLSearchParams({
      id: text,
      locale: 'en',
      tt
    })

    if (ts) payload.append('ts', ts)

    const { data: postHtml } = await axios.post(
      `https://reelsvideo.io${formPost}`,
      payload.toString(),
      { headers }
    )

    const $$ = cheerio.load(postHtml)

    let media = []

    $$('.bg-white.relative.rounded-3xl').each((_, el) => {
      const dlNode = $$(el).find('a.download_link')
      const href = dlNode.attr('href')
      const isVid = dlNode.hasClass('type_videos')

      if (href && href !== '#') {
        media.push({
          type: isVid ? 'video' : 'image',
          url: href
        })
      }
    })

    if (media.length === 0) {
      $$('a.download_link').each((_, el) => {
        const href = $$(el).attr('href')

        if (href && href !== '#') {
          media.push({
            type: $$(el).hasClass('type_videos') ? 'video' : 'image',
            url: href
          })
        }
      })
    }

    if (!media.length) throw 'Media tidak ditemukan'

    for (let item of media) {
      if (item.type === 'video') {
        await conn.sendMessage(m.chat, {
          video: { url: item.url },
          caption: '✅ Instagram Downloader\n\nAW BOT'
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          image: { url: item.url },
          caption: '✅ Instagram Downloader\n\nAW BOT'
        }, { quoted: m })
      }
    }

  } catch (e) {
    console.log(e)
    m.reply('❌ Gagal mengambil media Instagram')
  }
}

handler.help = ['igdl']
handler.tags = ['downloader']
handler.command = /^(igdl|instagram|ig)$/i

module.exports = handler