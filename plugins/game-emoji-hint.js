let handler = async (m, { conn }) => {

    conn.tebakemoji = conn.tebakemoji ? conn.tebakemoji : {}

    let id = m.chat
    if (!(id in conn.tebakemoji)) throw false

    let json = conn.tebakemoji[id][1]
    let jawaban = (json.jawaban || '').toString()

    // =========================
    // 💡 HINT MASK VOKAL
    // =========================
    let clue = jawaban.replace(/[AIUEOaiueo]/g, '_')

    conn.reply(m.chat, `
💡 *HINT TEBAK EMOJI*
━━━━━━━━━━━━━━

\`\`\`${clue}\`\`\`

━━━━━━━━━━━━━━
    `.trim(), m)

}

handler.command = /^hemo$/i
handler.limit = true

module.exports = handler