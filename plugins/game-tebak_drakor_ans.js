const similarity = require('similarity')
const threshold = 0.72

let handler = m => m

handler.before = async function (m) {
    let id = m.chat

    if (!m.quoted) return !0

    this.tebakdrakor = this.tebakdrakor ? this.tebakdrakor : {}
    if (!(id in this.tebakdrakor)) return !0

    if (m.quoted.id !== this.tebakdrakor[id][0].key.id) return !0

    let json = this.tebakdrakor[id][1]
    let jawaban = json.jawaban.toLowerCase().trim()
    let teksUser = (m.text || '').toLowerCase().trim()

    if (!teksUser) return !0

    let reward = this.tebakdrakor[id][2]

    // ===================== BENAR =====================
    if (teksUser === jawaban) {
        global.db.data.users[m.sender].money += reward

        m.reply(`
🎉 *JAWABAN BENAR!*

──────────────────
💰 Selamat! kamu mendapatkan +${reward} money
🎬 Jawaban: *${json.jawaban}*
──────────────────
🔥 GG! kamu hebat
        `.trim())

        clearTimeout(this.tebakdrakor[id][3])
        delete this.tebakdrakor[id]
    }

    // ===================== DIIKIT LAGI =====================
    else if (similarity(teksUser, jawaban) >= threshold) {
        m.reply(`
⚡ *Hampir Benar!*

──────────────────
💡 Jawabanmu sudah dekat
🎯 Coba sedikit lagi
──────────────────
        `.trim())
    }

    // ===================== SALAH =====================
    else {
        m.reply(`
❌ *Jawaban Salah!*

──────────────────
📺 Coba perhatikan petunjuknya lagi
💬 Jangan menyerah!
──────────────────
        `.trim())
    }

    return !0
}

handler.exp = 0
module.exports = handler