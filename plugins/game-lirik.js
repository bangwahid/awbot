let fs = require("fs")

let timeout = 100000
let poin = 10000

let handler = async (m, { conn, usedPrefix }) => {

    conn.tebaklirik = conn.tebaklirik ? conn.tebaklirik : {}

    let id = m.chat

    if (id in conn.tebaklirik) {
        return conn.reply(
            m.chat,
            "⚠️ Masih ada soal tebak lirik yang belum dijawab!",
            conn.tebaklirik[id][0]
        )
    }

    // =========================
    // 📦 LOCAL JSON SOURCE
    // =========================
    let data = JSON.parse(
        fs.readFileSync("./lib/json/tebaklirik.json")
    )

    let json = data[Math.floor(Math.random() * data.length)]

    // =========================
    // 🎧 UI BARU
    // =========================
    let caption = `
🎵 *TEBAK LIRIK*
━━━━━━━━━━━━━━

📝 Petunjuk:
${json.question}

💡 Cara main:
• Reply pesan ini
• atau kirim jawaban langsung

🆘 Hint: ${usedPrefix}liga
💰 Reward: Rp ${poin.toLocaleString('id-ID')}
⏳ Timeout: ${timeout / 1000} detik

━━━━━━━━━━━━━━
🔥 Tebak lagu sekarang!
    `.trim()

    let msg = await conn.reply(m.chat, caption, m)

    conn.tebaklirik[id] = [
        msg,
        json,
        poin,
        setTimeout(() => {
            if (conn.tebaklirik[id]) {
                conn.reply(
                    m.chat,
                    `⏰ Waktu habis!\n\n🎯 Jawaban: *${json.answer}*`,
                    conn.tebaklirik[id][0]
                )
                delete conn.tebaklirik[id]
            }
        }, timeout)
    ]
}

handler.help = ["tebaklirik"]
handler.tags = ["game"]
handler.command = /^tebaklirik$/i
handler.group = true
handler.register = false

module.exports = handler