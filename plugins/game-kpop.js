let fs = require("fs")

let timeout = 100000
let poin = 10000

let handler = async (m, { conn, usedPrefix }) => {

  conn.tebakkpop = conn.tebakkpop ? conn.tebakkpop : {}

  let id = m.chat

  if (id in conn.tebakkpop) {
    return conn.reply(
      m.chat,
      "⚠️ Masih ada soal KPOP yang belum dijawab!",
      conn.tebakkpop[id][0]
    )
  }

  // =========================
  // 📦 SOURCE LOCAL JSON
  // =========================
  let data = JSON.parse(
    fs.readFileSync("./lib/json/tebakkpop.json")
  )

  let json = data[Math.floor(Math.random() * data.length)]

  // =========================
  // 🎮 UI CAPTION BARU
  // =========================
  let caption = `
🎧 *TEBAK KPOP*
━━━━━━━━━━━━━━

📌 Deskripsi:
${json.deskripsi}

💡 Cara main:
• Reply pesan ini dengan jawaban
• atau ketik langsung jawaban

⌛ Timeout: ${timeout / 1000} detik
💰 Reward: ${poin} Money

🆘 Hint: ${usedPrefix}kpp

━━━━━━━━━━━━━━
🔥 Tebak sekarang!
  `.trim()

  let msg = await conn.sendMessage(
    m.chat,
    {
      text: caption
    },
    { quoted: m }
  )

  conn.tebakkpop[id] = [
    msg,
    json,
    poin,
    setTimeout(() => {
      if (conn.tebakkpop[id]) {
        conn.reply(
          m.chat,
          `⏰ Waktu habis!\n\n🎯 Jawaban: *${json.jawaban}*`,
          conn.tebakkpop[id][0]
        )
        delete conn.tebakkpop[id]
      }
    }, timeout)
  ]
}

handler.help = ["tebakkpop"]
handler.tags = ["game"]
handler.command = /^tebakkpop$/i
handler.group = true
handler.limit = false

module.exports = handler