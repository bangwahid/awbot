const similarity = require('similarity')
const threshold = 0.72

let handler = m => m

handler.before = async function (m) {
    let id = m.chat

    if (!m.quoted) return !0

    this.tebakml = this.tebakml ? this.tebakml : {}
    if (!(id in this.tebakml)) return !0

    if (m.quoted.id !== this.tebakml[id][0].key.id) return !0

    let json = this.tebakml[id][1]
    let jawaban = json.jawaban.toLowerCase().trim()
    let teksUser = (m.text || '').toLowerCase().trim()

    if (!teksUser) return !0

    let reward = this.tebakml[id][2]

    // ===================== BENAR =====================
    if (teksUser === jawaban) {
        global.db.data.users[m.sender].money += reward

        m.reply(`
🎉 *JAWABAN BENAR!*

──────────────────
💰 Selamat! kamu mendapatkan +${reward} money
🎮 Hero: *${json.jawaban}*
──────────────────
🔥 GG! kamu benar
        `.trim())

        clearTimeout(this.tebakml[id][3])
        delete this.tebakml[id]
    }

    // ===================== DIIKIT LAGI =====================
    else if (similarity(teksUser, jawaban) >= threshold) {
        m.reply(`
⚡ *Hampir Benar!*

──────────────────
💡 Jawabanmu sudah dekat
🔎 Coba sedikit lagi
──────────────────
        `.trim())
    }

    // ===================== SALAH =====================
    else {
        m.reply(`
❌ *Jawaban Salah!*

──────────────────
📌 Coba perhatikan deskripsinya lagi
🎮 Jangan menyerah!
──────────────────
        `.trim())
    }

    return !0
}

handler.exp = 0
module.exports = handler