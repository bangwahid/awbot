const similarity = require('similarity')
const threshold = 0.72

let poin = 10000

let handler = m => m

handler.before = async function (m) {

    let id = m.chat

    if (!m.quoted) return !0

    this.tebaklirik = this.tebaklirik ? this.tebaklirik : {}

    if (!(id in this.tebaklirik)) return !0

    if (m.quoted.id !== this.tebaklirik[id][0].key.id) return !0

    let json = this.tebaklirik[id][1]
    let jawaban = json.answer.toLowerCase().trim()
    let teksUser = (m.text || '').toLowerCase().trim()

    let users = global.db.data.users[m.sender]

    if (!teksUser) return !0

    let reward = this.tebaklirik[id][2]

    // ======================
    // BENAR
    // ======================
    if (teksUser === jawaban) {

        users.exp += reward
        users.money += poin

        m.reply(`
🎉 *BENAR!*
━━━━━━━━━━━━━━
💰 +Rp ${poin.toLocaleString('id-ID')}
⭐ +EXP ${reward}
🎵 Jawaban: ${json.answer}
━━━━━━━━━━━━━━
🔥 Mantap!
        `.trim())

        clearTimeout(this.tebaklirik[id][3])
        delete this.tebaklirik[id]
    }

    // ======================
    // HAMPIR BENAR
    // ======================
    else if (similarity(teksUser, jawaban) >= threshold) {

        m.reply(`
💡 *Dikit Lagi!*
Coba perhatikan liriknya 🎧
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