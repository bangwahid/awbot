const yts = require('yt-search')

let handler = async (
  m,
  { conn, text, usedPrefix, command }
) => {

  if (!text) {
    throw `
Contoh:
${usedPrefix + command} awmedia
`
  }

  try {

    const r = await yts(text)

    const videos = r.videos.slice(0, 5)

    if (!videos.length) {
      return m.reply('❌ Video tidak ditemukan.')
    }

    let hasil = `🔎 Hasil pencarian YouTube : ${text}\n`

    for (let i = 0; i < videos.length; i++) {

      let v = videos[i]

      hasil += `

${i + 1}. ${v.title}
⏱️ ${v.timestamp}
👁️ ${v.views.toLocaleString()} views
📅 ${v.ago}
👤 ${v.author.name}
🔗 ${v.url}
`
    }

    conn.sendMessage(
      m.chat,
      { text: hasil },
      { quoted: m }
    )

  } catch (e) {

    console.log(e)

    m.reply('❌ Terjadi kesalahan saat mencari video.')

  }
}

handler.help = ['yts']
handler.tags = ['internet']
handler.command = /^(yts|ytsearch)$/i

module.exports = handler