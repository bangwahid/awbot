const fs = require('fs')

let handler = async (m, { conn }) => {

    // =========================
    // 📁 AMBIL DATA DARI JSON
    // =========================
    let data = JSON.parse(fs.readFileSync('./lib/json/dare.json'))
    let dare = data[Math.floor(Math.random() * data.length)]

    // =========================
    // 💬 REPLY TANPA GAMBAR
    // =========================
    conn.reply(m.chat, `
🔥 *DARE*
━━━━━━━━━━━━━━

“${dare.result}”

━━━━━━━━━━━━━━
    `.trim(), m)
}

handler.help = ['dare']
handler.tags = ['fun']
handler.command = /^(dare|berani|tantangan)$/i
handler.limit = true

module.exports = handler