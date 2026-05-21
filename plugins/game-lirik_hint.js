let handler = async (m, { conn }) => {

    conn.tebaklirik = conn.tebaklirik ? conn.tebaklirik : {}

    let id = m.chat

    if (!(id in conn.tebaklirik)) throw false

    let json = conn.tebaklirik[id][1]

    let ans = (json.answer || '').toLowerCase().trim()

    if (!ans) return m.reply("⚠️ Jawaban tidak ditemukan!")

    // =========================
    // 🎯 SMART CLUE SYSTEM
    // =========================

    let clue = ans.split('').map((v, i) => {

        // huruf pertama & terakhir tetap muncul
        if (i === 0 || i === ans.length - 1) return v

        // spasi tetap
        if (v === ' ') return ' '

        // huruf lain disembunyikan
        return '_'
    }).join('')

    // =========================
    // 📌 OUTPUT
    // =========================
    m.reply(`
💡 *HINT LIRIK*
━━━━━━━━━━━━━━

🧩 ${clue}

📏 Panjang: ${ans.length} karakter
🔤 Awalan: ${ans[0].toUpperCase()}

━━━━━━━━━━━━━━
🎧 Tebak liriknya!
    `.trim())
}

handler.command = /^liga$/i
handler.limit = true

module.exports = handler