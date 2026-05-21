const fetch = require('node-fetch')

async function pinterestSearch(text) {

  const parts = text.trim().split(/\s+/)

  const limit = /^\d+$/.test(parts[parts.length - 1])
    ? Math.min(10, Math.max(1, parseInt(parts.pop())))
    : 5

  const query = parts.join(' ').trim()

  const headers = {
    'screen-dpr': '4',
    'x-pinterest-pws-handler': 'www/search/[scope].js',
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'accept-language': 'en-US,en;q=0.9',
    referer: 'https://www.pinterest.com/'
  }

  try {

    const url =
      `https://www.pinterest.com/resource/BaseSearchResource/get/?data=` +
      encodeURIComponent(
        JSON.stringify({
          options: { query }
        })
      )

    const res = await fetch(url, {
      method: 'HEAD',
      headers
    })

    const link = res.headers.get('link') || ''

    const results = [
      ...new Set(
        [
          ...link.matchAll(
            /<\s*(https:\/\/i\.pinimg\.com\/[^>]+)\s*>\s*;\s*rel=preload;\s*as=image/gi
          )
        ].map(v => v[1])
      )
    ].slice(0, limit)

    return {
      status: true,
      query,
      limit,
      total: results.length,
      results
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
${usedPrefix + command} anime girl
${usedPrefix + command} wallpaper mobile 7
`
  }

  try {

    m.reply('🔍 Sedang mencari gambar Pinterest...')

    const res = await pinterestSearch(text)

    if (!res.status) {
      throw res.error
    }

    if (!res.results.length) {
      return m.reply('❌ Gambar tidak ditemukan.')
    }

    let caption = `
╭━━━〔 PINTEREST SEARCH 〕━━━⬣
│
│ 🔎 Query :
│ ${res.query}
│
│ 🖼️ Total :
│ ${res.total} Result
│
╰━━━━━━━━━━━━━━━━━━⬣
`.trim()

    // kirim gambar satu per satu
    for (let i = 0; i < res.results.length; i++) {

      await conn.sendMessage(
        m.chat,
        {
          image: {
            url: res.results[i]
          },
          caption: i === 0 ? caption : ''
        },
        { quoted: m }
      )
    }

  } catch (e) {
    console.log(e)

    m.reply('❌ Gagal mencari gambar Pinterest.')
  }
}

handler.help = ['pin']
handler.tags = ['internet']
handler.command = /^(pin|pinterest|pinsearch)$/i

module.exports = handler