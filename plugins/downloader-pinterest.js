const fetch = require('node-fetch')

async function pinterestDownloader(targetUrl) {

  const headers = {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'accept-language': 'en-US,en;q=0.9',
    referer: 'https://www.pinterest.com/'
  }

  const getUrl = async (u) => {
    const res = await fetch(u, {
      method: 'GET',
      headers,
      redirect: 'follow'
    })

    return res.url || u
  }

  const clean = (s = '') =>
    String(s)
      .replace(/\\u002F|\\\//g, '/')
      .replace(/\\u0026/g, '&')
      .replace(/\\u003D/g, '=')
      .replace(/\\u00253A/g, ':')
      .replace(/\\u00252F/g, '/')
      .replace(/\\"/g, '"')
      .replace(/\s+/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .trim()

  try {

    const pageUrl = await getUrl(targetUrl)

    const html = await (
      await fetch(pageUrl.split('#')[0], {
        headers
      })
    ).text()

    const doc = clean(html)

    // title
    const tMatch =
      doc.match(
        /<meta[^>]+(?:property|name)=["'](?:og:title|twitter:title)["'][^>]+content=["']([^"']+)["']/i
      ) ||
      doc.match(/"title"\s*:\s*"([^"]+)"/i)

    const title = tMatch
      ? clean(tMatch[1])
      : 'Pinterest Media'

    // video
    const vids = [
      ...new Set(
        doc.match(
          /https:\/\/v\d+\.pinimg\.com\/videos\/(?:iht\/|mc\/)?[^"'\\\s<]+\.mp4/gi
        ) || []
      )
    ].map(v =>
      new URL(
        clean(v).split('.mp4')[0] + '.mp4'
      ).toString()
    )

    if (vids.length) {

      const bestVid =
        vids.find(u =>
          /\/(1080|720)[pP]?\//.test(u)
        ) || vids[0]

      const qMatch =
        bestVid.match(
          /\/(1080|720|540|480)p?\//i
        )

      return {
        status: true,
        type: 'video',
        title,
        video: bestVid,
        quality: qMatch
          ? qMatch[1] + 'p'
          : 'auto',
        images: [],
        pageUrl
      }
    }

    // image
    const imgs = [
      ...new Set(
        doc.match(
          /https:\/\/i\.pinimg\.com\/(?:originals|736x|564x|474x)\/[^"'\\\s<>()]+?\.(?:jpg|jpeg|png|webp)/gi
        ) || []
      )
    ]
      .map(u =>
        new URL(
          clean(u).match(
            /^(.+?\.(?:jpg|jpeg|png|webp))/i
          )[1]
        ).toString()
      )
      .filter(
        u =>
          !/logo|favicon|default|75x75/i.test(u)
      )
      .sort(
        (a, b) =>
          (b.includes('originals') ? 1 : 0) -
          (a.includes('originals') ? 1 : 0)
      )

    return {
      status: true,
      type: imgs.length ? 'image' : null,
      title,
      video: null,
      quality: null,
      images: imgs,
      pageUrl
    }

  } catch (e) {
    return {
      status: false,
      error: e.message
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
${usedPrefix + command} https://pin.it/xxxxx
`
  }

  try {

    m.reply('⏳ Sedang mengambil media Pinterest...')

    const res = await pinterestDownloader(text)

    if (!res.status) {
      throw res.error
    }

    let caption = `
╭━━━〔 PINTEREST DOWNLOADER 〕━━━⬣
│
│ 📝 Title :
│ ${res.title}
│
│ 📦 Type :
│ ${res.type}
│
${res.quality ? `│ 🎥 Quality :
│ ${res.quality}
│
` : ''}╰━━━━━━━━━━━━━━━━━━⬣
`.trim()

    // VIDEO
    if (res.type === 'video') {

      await conn.sendMessage(
        m.chat,
        {
          video: {
            url: res.video
          },
          mimetype: 'video/mp4',
          caption
        },
        { quoted: m }
      )

    }

    // IMAGE
    else if (res.type === 'image') {

      for (let i = 0; i < res.images.length; i++) {

        await conn.sendMessage(
          m.chat,
          {
            image: {
              url: res.images[i]
            },
            caption: i === 0 ? caption : ''
          },
          { quoted: m }
        )
      }

    } else {
      m.reply('❌ Media tidak ditemukan.')
    }

  } catch (e) {
    console.log(e)

    m.reply('❌ Gagal mengambil media Pinterest.')
  }
}

handler.help = ['pindl']
handler.tags = ['downloader']
handler.command = /^(pindl|pinterestdl|pinterestdownloader)$/i

module.exports = handler