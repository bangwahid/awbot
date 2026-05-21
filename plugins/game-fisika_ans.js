let poin = 10000

let handler = m => m

handler.before = async function (m) {

    if (!m.quoted) return true

    this.fisika = this.fisika ? this.fisika : {}

    let id = m.chat
    if (!(id in this.fisika)) return true

    let room = this.fisika[id]

    if (!room || !room[0] || !room[1]) return true

    if (m.quoted.id !== room[0].key.id) return true

    let users = global.db.data.users[m.sender]

    let json = room[1]

    let input = (m.text || '').toLowerCase().trim()

    let index = ['a', 'b', 'c', 'd'].indexOf(input)

    if (index === -1) return true

    let pilihanUser = json.pilihan[index]
    let jawabanIndex = json.jawaban.toLowerCase()

    if (!pilihanUser) return true

    // =========================
    // ✅ BENAR
    // =========================
    if (input === jawabanIndex) {

        users.money += poin

        if (!users.exp) users.exp = 0
        users.exp += room[2] || 0

        m.reply(`
🎉 *BENAR!*
━━━━━━━━━━━━━━
💰 +${poin} Money
📊 +${room[2] || 0} Exp

📖 ${json.deskripsi || '-'}
        `.trim())

        clearTimeout(room[3])
        delete this.fisika[id]

    } else {

        // =========================
        // ❌ SALAH
        // =========================
        m.reply(`
❌ *SALAH!*
━━━━━━━━━━━━━━
Coba lagi ya
        `.trim())

    }

    return true
}

handler.exp = 0

module.exports = handler