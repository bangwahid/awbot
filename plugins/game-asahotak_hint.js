let handler = async (m, { conn }) => {

    conn.asahotak = conn.asahotak ? conn.asahotak : {}
    let id = m.chat
    if (!(id in conn.asahotak)) throw false

    let json = conn.asahotak[id][1]
    let ans = json.jawaban

    let clue = ans.replace(/[bcdfghjklmnpqrstvwxyz]/g, '_')

    // =========================
    // 🔥 HANYA MODIF TAMPILAN REPLY
    // =========================
    m.reply(`
💡 *HINT ASAH OTAK*

🔎 ${clue}

━━━━━━━━━━━━━━
`.trim())
}

handler.command = /^toka$/i
handler.limit = true
module.exports = handler

//gh: dana_putra13