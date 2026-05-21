const fs = require('fs')

let timeout = 100000
let poin = 1000

let handler = async (m, { conn, usedPrefix }) => {

    conn.tebakemoji = conn.tebakemoji ? conn.tebakemoji : {}

    let id = m.chat

    if (id in conn.tebakemoji) {
        return conn.reply(m.chat, `
⚠️ *MASIH ADA SOAL AKTIF*
━━━━━━━━━━━━━━
Selesaikan dulu soal sebelumnya
        `.trim(), conn.tebakemoji[id][0])
    }

    // =========================
    // 📁 AMBIL DATA JSON
    // =========================
    let data = JSON.parse(fs.readFileSync('./lib/json/emoji.json'))

    let json = data[Math.floor(Math.random() * data.length)]

    // =========================
    // 💬 CAPTION
    // =========================
    let caption = `
🎮 *TEBAK EMOJI*
━━━━━━━━━━━━━━

❓ ${json.soal}

━━━━━━━━━━━━━━
⏳ Timeout : ${(timeout / 1000).toFixed(0)} detik
💰 Bonus : ${poin} money

💡 Ketik *${usedPrefix}hemo* untuk hint
📩 Balas pesan ini untuk menjawab
━━━━━━━━━━━━━━
`.trim()

    let msg = await conn.reply(m.chat, caption, m)

    conn.tebakemoji[id] = [
        msg,
        json,
        poin,
        setTimeout(() => {

            if (conn.tebakemoji[id]) {
                conn.reply(m.chat, `
⏰ *WAKTU HABIS*
━━━━━━━━━━━━━━
❌ Jawaban: *${json.jawaban}*
📖 ${json.deskripsi || '-'}
━━━━━━━━━━━━━━
                `.trim(), conn.tebakemoji[id][0])
            }

            delete conn.tebakemoji[id]

        }, timeout)
    ]

}

handler.help = ['tebakemoji']
handler.tags = ['game']
handler.command = /^tebakemoji/i
handler.register = false
handler.group = true

module.exports = handler