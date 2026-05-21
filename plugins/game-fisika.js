const fs = require('fs')

let timeout = 100000
let poin = 10000

let handler = async (m, { conn, usedPrefix }) => {

    conn.fisika = conn.fisika ? conn.fisika : {}

    let id = m.chat

    if (id in conn.fisika) {
        return conn.reply(m.chat, `
⚠️ *MASIH ADA SOAL AKTIF*
━━━━━━━━━━━━━━
Selesaikan dulu soal sebelumnya
━━━━━━━━━━━━━━
        `.trim(), conn.fisika[id][0])
    }

    // =========================
    // 📁 AMBIL DATA JSON
    // =========================
    let data = JSON.parse(fs.readFileSync('./lib/json/fisika.json'))

    let json = data[Math.floor(Math.random() * data.length)]

    let options = json.pilihan
        .map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`)
        .join('\n')

    // =========================
    // 💬 CAPTION UI
    // =========================
    let caption = `
🧠 *FISIKA QUIZ*
━━━━━━━━━━━━━━

📘 ${json.soal}

${options}

━━━━━━━━━━━━━━
📊 Level : ${json.level}
⏳ Timeout : ${(timeout / 1000).toFixed(0)} detik
💰 Bonus : ${poin} money

📩 Balas dengan A / B / C / D
━━━━━━━━━━━━━━
`.trim()

    let msg = await conn.reply(m.chat, caption, m)

    conn.fisika[id] = [
        msg,
        json,
        poin,
        setTimeout(() => {

            if (conn.fisika[id]) {
                conn.reply(m.chat, `
⏰ *WAKTU HABIS*
━━━━━━━━━━━━━━
❌ Jawaban: *${json.jawaban}*
━━━━━━━━━━━━━━
                `.trim(), conn.fisika[id][0])

                delete conn.fisika[id]
            }

        }, timeout)
    ]

}

handler.help = ['fisika']
handler.tags = ['game']
handler.command = /^fisika/i
handler.group = true
handler.register = false

module.exports = handler