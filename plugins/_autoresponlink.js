let fs = require('fs')
let handler = m => m

handler.all = async function (m, { isBlocked }) {
    if (isBlocked) return
    if ((m.mtype === 'groupInviteMessage' || m.text.startsWith('Undangan untuk bergabung') || m.text.startsWith('Invitation to join') || m.text.startsWith('Buka tautan ini')) && !m.isBaileys && !m.isGroup) {
    let teks = `
╭━━━〔 🔗 INVITE GROUP 〕━━━⬣

│ ⬡ 7 Hari   → 5.000
│ ⬡ 14 Hari → 10.000
│ ⬡ 30 Hari → 20.000

╰━━━〔 📩 ORDER 〕━━━⬣
Hubungi: @${global.owner[0]}
Untuk melakukan Sewa AW Bot ✨
`
    this.reply(m.chat, teks, m)
    const data = global.owner.filter(([id, isCreator]) => id && isCreator)
    this.sendContact(m.chat, data.map(([id, name]) => [id, name]), m)
    }
}

module.exports = handler