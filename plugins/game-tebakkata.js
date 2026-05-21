const fs = require('fs')

let timeout = 100000
let poin = 10000

let handler = async (m, { conn, usedPrefix }) => {

    conn.tbkata = conn.tbkata ? conn.tbkata : {}

    let id = m.chat

    if (id in conn.tbkata) {
        conn.reply(
            m.chat,
            '⚠️ Masih ada soal yang belum terjawab di chat ini',
            conn.tbkata[id][0]
        )
        throw false
    }

    // ambil data dari lib/json
    let src = JSON.parse(fs.readFileSync('./lib/json/tebakkata.json'))

    // random soal
    let json = src[Math.floor(Math.random() * src.length)]

    // tampilan caption dimodif
    let caption = `
╭─〔 🎮 TEBAK KATA 〕─⬣
│
├ 📝 Soal :
│ ${json.soal}
│
├ ⏳ Waktu : ${(timeout / 1000).toFixed(0)} detik
├ 💰 Bonus : ${poin} money
│
├ 💡 Bantuan :
│ Ketik *${usedPrefix}tkaa*
│
├ 📌 Petunjuk :
│ Reply pesan ini untuk menjawab
│
╰──────────────⬣
`.trim()

    conn.tbkata[id] = [
        await conn.reply(m.chat, caption, m),
        json,
        poin,
        setTimeout(() => {

            if (conn.tbkata[id]) {

                conn.reply(
                    m.chat,
                    `
⏰ *WAKTU HABIS*

╭──────────────⬣
├ 🎯 Jawaban :
│ ${json.jawaban}
╰──────────────⬣
                    `.trim(),
                    conn.tbkata[id][0]
                )

            }

            delete conn.tbkata[id]

        }, timeout)
    ]
}

handler.help = ['tebakkata']
handler.tags = ['game']
handler.command = /^tebakkata/i
handler.register = false
handler.group = true

module.exports = handler

// tested di baileys 6.5.0
// dana_putra13