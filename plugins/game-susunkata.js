const fs = require('fs')

let timeout = 100000
let poin = 10000

let handler = async (m, { conn, usedPrefix }) => {

    conn.susun = conn.susun ? conn.susun : {}

    let id = m.chat

    if (id in conn.susun) {
        conn.reply(
            m.chat,
            '⚠️ Masih ada soal yang belum terjawab di chat ini',
            conn.susun[id][0]
        )
        throw false
    }

    // ambil data dari lib/json
    let src = JSON.parse(fs.readFileSync('./lib/json/susunkata.json'))

    // random soal
    let json = src[Math.floor(Math.random() * src.length)]

    // tampilan caption dimodif
    let caption = `
╭─〔 🎮 SUSUN KATA 〕─⬣
│
├ 📝 Soal :
│ ${json.soal}
│
├ 🎯 Tipe : ${json.tipe}
├ ⏳ Waktu : ${(timeout / 1000).toFixed(0)} detik
├ 💰 Bonus : ${poin} money
│
├ 💡 Bantuan :
│ Ketik *${usedPrefix}susn*
│
├ 📌 Petunjuk :
│ Reply pesan ini untuk menjawab
│
╰──────────────⬣
`.trim()

    conn.susun[id] = [
        await conn.reply(m.chat, caption, m),
        json,
        poin,
        setTimeout(() => {

            if (conn.susun[id]) {

                conn.reply(
                    m.chat,
                    `
⏰ *WAKTU HABIS*

╭──────────────⬣
├ 🎯 Jawaban :
│ ${json.jawaban}
╰──────────────⬣
                    `.trim(),
                    conn.susun[id][0]
                )

            }

            delete conn.susun[id]

        }, timeout)
    ]
}

handler.help = ['susunkata']
handler.tags = ['game']
handler.command = /^susunkata/i
handler.register = false
handler.group = false

module.exports = handler

// tested di baileys 6.5.0
// dana_putra13