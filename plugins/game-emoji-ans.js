const similarity = require('similarity')
const threshold = 0.72

let handler = m => m

handler.before = async function (m) {

    let id = m.chat

    if (!m.quoted) return true

    this.tebakemoji = this.tebakemoji ? this.tebakemoji : {}

    if (!(id in this.tebakemoji)) return true

    if (!m.quoted.id) return true
    if (m.quoted.id !== this.tebakemoji[id][0].key.id) return true

    let json = this.tebakemoji[id][1]
    let jawaban = (json.jawaban || '').toLowerCase().trim()
    let teksUser = (m.text || '').toLowerCase().trim()

    if (!teksUser) return true

    let reward = this.tebakemoji[id][2]

    // =========================
    // ✅ JAWABAN BENAR
    // =========================
    if (teksUser === jawaban) {

        global.db.data.users[m.sender].money += reward

        m.reply(`
🎉 *BENAR!*
━━━━━━━━━━━━━━
💰 +${reward} money
━━━━━━━━━━━━━━
        `.trim())

        clearTimeout(this.tebakemoji[id][3])
        delete this.tebakemoji[id]

    }

    // =========================
    // 💡 HAMPIR BENAR
    // =========================
    else if (similarity(teksUser, jawaban) >= threshold) {

        m.reply(`
💡 *DIKIT LAGI!*
Jawaban kamu hampir benar
        `.trim())

    }

    // =========================
    // ❌ SALAH
    // =========================
    else {

        m.reply(`
❌ *SALAH!*
Coba lagi ya
        `.trim())

    }

    return true
}

handler.exp = 0

module.exports = handler