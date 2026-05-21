const similarity = require('similarity')
const threshold = 0.72

let handler = m => m

handler.before = async function (m) {

    let id = m.chat

    if (!m.quoted) return true

    this.asahotak = this.asahotak ? this.asahotak : {}
    if (!(id in this.asahotak)) return true

    if (m.quoted.id !== this.asahotak[id][0].key.id) return true

    let json = this.asahotak[id][1]
    let jawaban = json.jawaban.toLowerCase().trim()
    let teksUser = (m.text || '').toLowerCase().trim()

    if (!teksUser) return true

    // =========================
    // ✔ BENAR (MODIF REWARD TEXT)
    // =========================
    if (teksUser === jawaban) {

        let reward = this.asahotak[id][2]
        global.db.data.users[m.sender].money += reward

        m.reply(`
🎉 *BENAR!*
━━━━━━━━━━━━━━
💰 Anda mendapatkan uang sebesar:
Rp ${reward.toLocaleString('id-ID')}
━━━━━━━━━━━━━━
        `.trim())

        clearTimeout(this.asahotak[id][3])
        delete this.asahotak[id]
    }

    // =========================
    // ⚡ HAMPIR BENAR
    // =========================
    else if (similarity(teksUser, jawaban) >= threshold) {

        m.reply(`
⚡ *DIKIT LAGI!*
━━━━━━━━━━━━━━
Coba pikir lebih dekat 😄
━━━━━━━━━━━━━━
        `.trim())
    }

    // =========================
    // ❌ SALAH
    // =========================
    else {

        m.reply(`
❌ *SALAH!*
━━━━━━━━━━━━━━
Coba lagi ya 😅
━━━━━━━━━━━━━━
        `.trim())
    }

    return true
}

handler.exp = 0
module.exports = handler