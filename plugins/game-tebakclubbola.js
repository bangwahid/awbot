const fs = require('fs')

let timeout = 100000
let poin = 10000

let handler = async (m, { conn, usedPrefix }) => {
  conn.tebakclub = conn.tebakclub ? conn.tebakclub : {}
  let id = m.chat

  if (id in conn.tebakclub) {
    conn.reply(m.chat, '⚠️ Masih ada soal yang belum terjawab di chat ini!', conn.tebakclub[id][0])
    throw false
  }

  // ambil data lokal
  let data
  try {
    let raw = fs.readFileSync('./lib/json/tebakklub.json')
    data = JSON.parse(raw.toString())
  } catch (e) {
    console.error(e)
    throw '❌ Gagal membaca file tebakklub.json'
  }

  if (!data || !data.length) throw '❌ Data soal kosong!'

  let json = data[Math.floor(Math.random() * data.length)]

  if (!json.deskripsi || !json.jawaban)
    throw '❌ Format JSON tidak valid!'

  let caption = `
🎮 *TEBAK CLUB BOLA*

──────────────────
📌 Petunjuk:
${json.deskripsi}

⏱ Waktu: ${timeout / 1000} detik
💰 Bonus: ${poin} money

💡 Ketik: *${usedPrefix}tbcl* untuk clue
📩 Reply pesan ini untuk menjawab
──────────────────
  `.trim()

  conn.tebakclub[id] = [
    await conn.sendMessage(m.chat, {
      text: caption
    }, { quoted: m }),
    json,
    poin,
    setTimeout(() => {
      if (conn.tebakclub[id]) {
        conn.reply(
          m.chat,
          `⏰ WAKTU HABIS!\n\nJawaban yang benar adalah: *${json.jawaban}*`,
          conn.tebakclub[id][0]
        )
        delete conn.tebakclub[id]
      }
    }, timeout)
  ]
}

handler.help = ['tebakclub']
handler.tags = ['game']
handler.command = /^tebakclub$/i
handler.group = true
handler.limit = false

module.exports = handler