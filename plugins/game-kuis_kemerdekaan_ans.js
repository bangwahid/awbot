const similarity = require('similarity')
const threshold = 0.72

let handler = m => m

handler.before = async function (m) {

    let id = m.chat

    if (!m.quoted) return !0

    this.merdeka = this.merdeka ? this.merdeka : {}

    if (!(id in this.merdeka)) return !0

    if (m.quoted.id !== this.merdeka[id][0].key.id) return !0

    let json = this.merdeka[id][1]
    let jawaban = json.jawaban.toLowerCase().trim()
    let teksUser = (m.text || '').toLowerCase().trim()

    if (!teksUser) return !0

    let reward = this.merdeka[id][2]

    // ======================
    // BENAR
    // ======================
    if (teksUser === jawaban) {

        global.db.data.users[m.sender].money += reward

        m.reply(`
🇮🇩 *JAWABAN BENAR!*
━━━━━━━━━━━━━━
💰 +Rp ${reward.toLocaleString('id-ID')}
🎯 Jawaban: ${json.jawaban}
━━━━━━━━━━━━━━
🔥 Merdeka!
        `.trim())

        clearTimeout(this.merdeka[id][3])
        delete this.merdeka[id]
    }

    // ======================
    // HAMPIR BENAR
    // ======================
    else if (similarity(teksUser, jawaban) >= threshold) {

        m.reply(`
💡 *Dikit Lagi!*
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