let handler = async (m, { conn }) => {

    conn.tbkata = conn.tbkata ? conn.tbkata : {}

    let id = m.chat

    if (!(id in conn.tbkata)) throw false

    let json = conn.tbkata[id][1]
    let ans = json.jawaban

    // clue
    let clue = ans.replace(/[BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz]/g, '_')

    // tampilan reply dimodif
    m.reply(`
╭─〔 💡 PETUNJUK TEBAK KATA 〕─⬣
│
├ 🔎 Clue Jawaban :
│
│ \`\`\`
│ ${clue}
│ \`\`\`
│
├ 📌 Huruf konsonan disamarkan
├ 🎮 Gunakan clue untuk membantu
│
╰──────────────⬣
`.trim())

}

handler.command = /^tkaa/i
handler.limit = true

module.exports = handler

// gh: dana_putra13