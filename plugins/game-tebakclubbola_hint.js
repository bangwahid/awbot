let handler = async (m, { conn }) => {
    conn.tebakclub = conn.tebakclub ? conn.tebakclub : {}
    let id = m.chat

    if (!(id in conn.tebakclub)) throw false

    let json = conn.tebakclub[id][1]

    let clue = json.jawaban.replace(/[bcdfghjklmnpqrstvwxyz]/gi, '_')

    m.reply(`
💡 *CLUE JAWABAN*

──────────────────
🔎 ${clue}


──────────────────
⚠️ Balas *soal utama*, bukan pesan ini!
`.trim())
}

handler.command = /^tbcl$/i
handler.limit = true

module.exports = handler