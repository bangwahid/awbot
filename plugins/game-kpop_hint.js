let handler = async (m, { conn }) => {

    conn.tebakkpop = conn.tebakkpop ? conn.tebakkpop : {}

    let id = m.chat

    if (!(id in conn.tebakkpop)) throw false

    let json = conn.tebakkpop[id][1]

    let ans = (json.jawaban || '').toLowerCase().trim()

    if (!ans) return m.reply("⚠️ Tidak ada jawaban!")

    // =========================
    // 🎯 SMART HINT SYSTEM
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
    // 🔥 BONUS INFO
    // =========================
    let info = `
💡 *HINT KPOP*
━━━━━━━━━━━━━━

🧩 ${clue}

📌 Panjang jawaban: ${ans.length} karakter
🔤 Awalan: ${ans[0].toUpperCase()}

━━━━━━━━━━━━━━
⚠️ BALAS SOALNYA, BUKAN PESAN INI!
    `.trim()

    m.reply(info)
}

handler.command = /^kpp$/i
handler.limit = true

module.exports = handler