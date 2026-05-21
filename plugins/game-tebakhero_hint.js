let handler = async (m, { conn }) => {
    conn.tebakml = conn.tebakml ? conn.tebakml : {}
    let id = m.chat

    if (!(id in conn.tebakml)) throw false

    let json = conn.tebakml[id][1]

    // bikin clue + spasi tiap huruf
    let clue = json.jawaban
        .replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_')
        .split('')
        .join(' ')

    m.reply(`
💡 *CLUE HERO MOBILE LEGENDS*

──────────────────
🔎 ${clue}

──────────────────

⚠️ Balas *soal utama*, bukan pesan ini!
    `.trim())
}

handler.command = /^tml$/i
handler.limit = true

module.exports = handler