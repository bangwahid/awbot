const fs = require('fs')

let timeout = 100000
let poin = 10000

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebakbola = conn.tebakbola ? conn.tebakbola : {}
    let id = m.chat

    if (id in conn.tebakbola) {
        return conn.reply(m.chat, '⚠️ Masih ada soal yang belum terjawab di chat ini!', conn.tebakbola[id][0])
    }

    // ambil data lokal
    let data
    try {
        let raw = fs.readFileSync('./lib/json/tebakpemainbola.json')
        data = JSON.parse(raw.toString())
    } catch (e) {
        console.error(e)
        throw '❌ Gagal membaca file tebakpemainbola.json'
    }

    if (!data || !data.length) {
        throw '❌ Data soal kosong!'
    }

    let json = data[Math.floor(Math.random() * data.length)]

    if (!json.soal || !json.jawaban) {
        throw '❌ Format JSON tidak valid!'
    }

    let caption = `
⚽ *TEBAK PEMAIN BOLA*

──────────────────
❓ ${json.soal}

⏱ Waktu: ${timeout / 1000} detik
💰 Bonus: ${poin} money

💡 Hint: ketik *${usedPrefix}tboa*
📩 Balas pesan ini untuk menjawab
──────────────────
`.trim()

    conn.tebakbola[id] = [
        await conn.reply(m.chat, caption, m),
        json,
        poin,
        setTimeout(() => {
            if (conn.tebakbola[id]) {
                conn.reply(
                    m.chat,
                    `⏰ WAKTU HABIS!\n\nJawaban yang benar adalah: *${json.jawaban}*`,
                    conn.tebakbola[id][0]
                )
                delete conn.tebakbola[id]
            }
        }, timeout)
    ]
}

handler.help = ['tebakbola']
handler.tags = ['game']
handler.command = /^tebakbola/i
handler.group = true
handler.register = false

module.exports = handler