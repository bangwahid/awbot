let handler = async (m, { conn }) => {
    conn.tebakbola = conn.tebakbola ? conn.tebakbola : {}
    let id = m.chat

    if (!(id in conn.tebakbola)) throw false

    let json = conn.tebakbola[id][1]

    // bikin clue + spasi tiap karakter
    let clue = json.jawaban
        .replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_')
        .split('')
        .join(' ')

    m.reply(`
💡 *CLUE JAWABAN*

──────────────────
🔎 ${clue}

──────────────────
⚠️ Balas *soal utama*, bukan pesan ini!
    `.trim())
}

handler.command = /^tboa$/i
handler.limit = true

module.exports = handler