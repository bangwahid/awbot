let handler = async (m, { conn }) => {

    conn.fisika = conn.fisika ? conn.fisika : {}

    let id = m.chat

    if (!(id in conn.fisika)) throw false

    let json = conn.fisika[id][1]

    let ans = (json.jawaban || '').toLowerCase().trim()

    // =========================
    // 🎯 MODE PILIHAN GANDA (A/B/C/D)
    // =========================
    if (['a', 'b', 'c', 'd'].includes(ans)) {

        let hint = ['A', 'B', 'C', 'D'].map(v => {
            return v === ans.toUpperCase() ? `(${v}) ✔` : `(${v}) _`
        }).join('  ')

        return m.reply(`
💡 *HINT JAWABAN*
━━━━━━━━━━━━━━

${hint}

━━━━━━━━━━━━━━
        `.trim())
    }

    // =========================
    // 🧠 MODE TEKS (fallback)
    // =========================
    let clue = ans.split('').map((v, i) => {
        return i === 0 ? v : '_'
    }).join('')

    m.reply('💡 *HINT*\n```' + clue + '```')
}

handler.command = /^fska/i
handler.limit = true

module.exports = handler