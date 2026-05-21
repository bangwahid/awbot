const fs = require('fs')

let timeout = 100000
let poin = 1000

let handler = async (m, { conn, usedPrefix }) => {
  conn.tebakml = conn.tebakml ? conn.tebakml : {}
  let id = m.chat

  if (id in conn.tebakml) {
    return conn.reply(m.chat, '⚠️ Masih ada soal yang belum terjawab di chat ini!', conn.tebakml[id][0])
  }

  // ambil data lokal
  let data
  try {
    let raw = fs.readFileSync('./lib/json/tebakheroml.json')
    data = JSON.parse(raw.toString())
  } catch (e) {
    console.error(e)
    throw '❌ Gagal membaca file tebakheroml.json'
  }

  if (!data || !data.length) {
    throw '❌ Data soal kosong!'
  }

  let json = data[Math.floor(Math.random() * data.length)]

  if (!json.deskripsi || !json.jawaban) {
    throw '❌ Format JSON tidak valid!'
  }

  let caption = `
🎮 *TEBAK HERO MOBILE LEGENDS*

──────────────────
🧠 Deskripsi:
${json.deskripsi}

⏱ Waktu: ${timeout / 1000} detik
💰 Bonus: ${poin} money

💡 Hint: ketik *${usedPrefix}tml*
📩 Reply pesan ini untuk menjawab
──────────────────
  `.trim()

  conn.tebakml[id] = [
    await conn.reply(m.chat, caption, m),
    json,
    poin,
    setTimeout(() => {
      if (conn.tebakml[id]) {
        conn.reply(
          m.chat,
          `⏰ WAKTU HABIS!\n\nJawaban yang benar adalah: *${json.jawaban}*`,
          conn.tebakml[id][0]
        )
        delete conn.tebakml[id]
      }
    }, timeout)
  ]
}

handler.help = ['tebakml']
handler.tags = ['game']
handler.command = /^tebakml/i
handler.group = true
handler.limit = false

module.exports = handler