let handler = async (m, { conn, usedPrefix }) => {

    conn.merdeka = conn.merdeka ? conn.merdeka : {}

    let id = m.chat

    if (!(id in conn.merdeka)) throw false

    let json = conn.merdeka[id][1]

    let ans = (json.jawaban || '').toLowerCase().trim()

    if (!ans) return m.reply("⚠️ Jawaban tidak ditemukan!")

    // =========================
    // 🎯 SMART HINT SYSTEM
    // =========================

    let clue = ans.split('').map((v, i) => {

        // huruf pertama & terakhir tetap muncul
        if (i === 0 || i === ans.length - 1) return v

        // spasi tetap spasi
        if (v === ' ') return ' '

        // huruf lain disembunyikan
        return '_'
    }).join('')

    // =========================
    // 📌 INFO TAMBAHAN
    // =========================
    let teks = `
💡 *HINT KUIS MERDEKA*
━━━━━━━━━━━━━━

🧩 ${clue}

📏 Panjang jawaban: ${ans.length} karakter
🔤 Huruf awal: ${ans[0].toUpperCase()}

━━━━━━━━━━━━━━
    `.trim()

    m.reply(teks)
}

handler.command = /^mka$/i
handler.limit = true

module.exports = handler