const fs = require('fs')

let timeout = 100000
let poin = 10000

let handler = async (m, { conn, usedPrefix }) => {
  conn.tebakdrakor = conn.tebakdrakor ? conn.tebakdrakor : {}
  let id = m.chat

  if (id in conn.tebakdrakor) {
    return conn.reply(m.chat, '⚠️ Masih ada soal yang belum terjawab di chat ini!', conn.tebakdrakor[id][0])
  }

  // ambil data lokal
  let data
  try {
    let raw = fs.readFileSync('./lib/json/tebakdrakor.json')
    data = JSON.parse(raw.toString())
  } catch (e) {
    console.error(e)
    throw '❌ Gagal membaca file tebakdrakor.json'
  }

  if (!data || !data.length) {
    throw '❌ Data soal kosong!'
  }

  let json = data[Math.floor(Math.random() * data.length)]

  if (!json.deskripsi || !json.jawaban) {
    throw '❌ Format JSON tidak valid!'
  }

  let caption = `
🎬 *TEBAK DRAKOR*

──────────────────
📺 ${json.deskripsi}

⏱ Waktu: ${timeout / 1000} detik
💰 Bonus: ${poin} money

💡 Hint: ketik *${usedPrefix}tdkt*
📩 Reply pesan ini untuk menjawab
──────────────────
  `.trim()

  conn.tebakdrakor[id] = [
    await conn.reply(m.chat, caption, m),
    json,
    poin,
    setTimeout(() => {
      if (conn.tebakdrakor[id]) {
        conn.reply(
          m.chat,
          `⏰ WAKTU HABIS!\n\nJawaban yang benar adalah: *${json.jawaban}*`,
          conn.tebakdrakor[id][0]
        )
        delete conn.tebakdrakor[id]
      }
    }, timeout)
  ]
}

handler.help = ['tebakdrakor']
handler.tags = ['game']
handler.command = /^tebakdrakor/i
handler.group = true
handler.limit = true

module.exports = handler