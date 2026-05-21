const similarity = require('similarity')
const threshold = 0.72

let handler = m => m

handler.before = async function (m) {

    let id = m.chat

    if (!m.quoted) return !0

    this.tebakkpop = this.tebakkpop ? this.tebakkpop : {}

    if (!(id in this.tebakkpop)) return !0

    if (m.quoted.id !== this.tebakkpop[id][0].key.id) return !0

    let json = this.tebakkpop[id][1]
    let jawaban = json.jawaban.toLowerCase().trim()
    let teksUser = (m.text || '').toLowerCase().trim()

    if (!teksUser) return !0

    let reward = this.tebakkpop[id][2]

    // ======================
    // BENAR
    // ======================
    if (teksUser === jawaban) {

        global.db.data.users[m.sender].money += reward

        m.reply(`
🎉 *JAWABAN BENAR!*
━━━━━━━━━━━━━━
💰 +Rp ${reward.toLocaleString('id-ID')}
🎤 Jawaban: ${json.jawaban}
━━━━━━━━━━━━━━
🔥 Mantap!
        `.trim())

        clearTimeout(this.tebakkpop[id][3])
        delete this.tebakkpop[id]

    }

    // ======================
    // HAMPIR BENAR
    // ======================
    else if (similarity(teksUser, jawaban) >= threshold) {

        m.reply(`
💡 *Dikit Lagi!*
Coba perhatikan lagi jawabanmu 🔍
        `.trim())

    }

    // ======================
    // SALAH
    // ======================
    else {

        m.reply(`
❌ *SALAH!*
━━━━━━━━━━━━━━
        `.trim())
    }

    return !0
}

handler.exp = 0
module.exports = handler