let handler = async (m, { conn }) => {
    conn.tebakdrakor = conn.tebakdrakor ? conn.tebakdrakor : {}
    let id = m.chat

    if (!(id in conn.tebakdrakor)) throw false

    let json = conn.tebakdrakor[id][1]

    // bikin clue + spasi tiap huruf
    let clue = json.jawaban
        .replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_')
        .split('')
        .join(' ')

    m.reply(`
💡 *CLUE TEBAK DRAKOR*

──────────────────
🔎 ${clue}

──────────────────
⚠️ Balas *soal utama*, bukan pesan ini!
    `.trim())
}

handler.command = /^tdkt$/i
handler.limit = true

module.exports = handler