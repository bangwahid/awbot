const fs = require('fs')

let timeout = 100000
let poin = 10000

let handler = async (m, { conn, usedPrefix }) => {

    conn.asahotak = conn.asahotak ? conn.asahotak : {}
    let id = m.chat

    if (id in conn.asahotak) {
        return conn.reply(m.chat, '⚠️ Masih ada soal belum terjawab di chat ini!', conn.asahotak[id][0])
    }

    let data = JSON.parse(fs.readFileSync('./lib/json/asahotak.json'))
    let json = data[Math.floor(Math.random() * data.length)]

    // =========================
    // 🎮 CAPTION MODIF (HELP DIPINDAH KE BAWAH)
    // =========================
    let caption = `
🧠 *ASAH OTAK*
━━━━━━━━━━━━━━
❓ ${json.soal}

⏳ Timeout : ${timeout / 1000} detik
💰 Bonus   : ${poin} money

📩 Cara main:
Balas pesan ini dengan jawaban

💡 Butuh bantuan?
Ketik: *${usedPrefix}toka*
━━━━━━━━━━━━━━
`.trim()

    conn.asahotak[id] = [
        await conn.reply(m.chat, caption, m),
        json,
        poin,
        setTimeout(() => {
            if (conn.asahotak[id]) {
                conn.reply(
                    m.chat,
                    `⏰ Waktu habis!\nJawaban: *${json.jawaban}*`,
                    conn.asahotak[id][0]
                )
                delete conn.asahotak[id]
            }
        }, timeout)
    ]
}

handler.help = ['asahotak']
handler.tags = ['game']
handler.command = /^asahotak/i
handler.group = true

module.exports = handler