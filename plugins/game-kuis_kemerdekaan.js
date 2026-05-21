let fs = require("fs")

let timeout = 100000
let poin = 10000

let handler = async (m, { conn, usedPrefix }) => {

    conn.merdeka = conn.merdeka ? conn.merdeka : {}

    let id = m.chat

    if (id in conn.merdeka) {
        return conn.reply(
            m.chat,
            "⚠️ Masih ada soal yang belum dijawab di chat ini!",
            conn.merdeka[id][0]
        )
    }

    // =========================
    // 📦 LOCAL JSON SOURCE
    // =========================
    let data = JSON.parse(
        fs.readFileSync("./lib/json/kuismerdeka.json")
    )

    let json = data[Math.floor(Math.random() * data.length)]

    // =========================
    // 🎮 UI BARU
    // =========================
    let caption = `
🇮🇩 *KUIS MERDEKA*
━━━━━━━━━━━━━━

📌 Soal:
${json.soal}

💡 Cara jawab:
• Reply pesan ini
• atau kirim jawaban langsung

🆘 Hint: ${usedPrefix}mka
💰 Bonus: Rp ${poin.toLocaleString('id-ID')}

⏳ Timeout: ${timeout / 1000} detik

━━━━━━━━━━━━━━
🔥 Semangat!
    `.trim()

    let msg = await conn.reply(m.chat, caption, m)

    conn.merdeka[id] = [
        msg,
        json,
        poin,
        setTimeout(() => {
            if (conn.merdeka[id]) {
                conn.reply(
                    m.chat,
                    `⏰ Waktu habis!\n\n🎯 Jawaban: *${json.jawaban}*`,
                    conn.merdeka[id][0]
                )
                delete conn.merdeka[id]
            }
        }, timeout)
    ]
}

handler.help = ["kuismerdeka"]
handler.tags = ["game"]
handler.command = /^kuismerdeka$/i
handler.group = true
handler.register = false

module.exports = handler