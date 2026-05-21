const similarity = require('similarity')
const threshold = 0.72

let handler = m => m

handler.before = async function (m) {
    let id = m.chat

    if (!m.quoted) return !0

    this.tebakbola = this.tebakbola ? this.tebakbola : {}
    if (!(id in this.tebakbola)) return !0

    if (m.quoted.id !== this.tebakbola[id][0].key.id) return !0

    let json = this.tebakbola[id][1]
    let jawaban = json.jawaban.toLowerCase().trim()
    let teksUser = (m.text || '').toLowerCase().trim()

    if (!teksUser) return !0

    let reward = this.tebakbola[id][2]

    // ===================== BENAR =====================
    if (teksUser === jawaban) {
        global.db.data.users[m.sender].money += reward

        m.reply(`
🎉 *JAWABAN BENAR!*

──────────────────
💰 Kamu mendapatkan +${reward} money
⚽ Jawaban: *${json.jawaban}*
──────────────────
🔥 GG! kamu hebat
        `.trim())

        clearTimeout(this.tebakbola[id][3])
        delete this.tebakbola[id]
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
📌 Coba pikir lebih teliti
⚽ Petunjuk ada di soal
──────────────────
        `.trim())
    }

    return !0
}

handler.exp = 0
module.exports = handler