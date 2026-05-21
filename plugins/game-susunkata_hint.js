let handler = async (m, { conn }) => {

    conn.susun = conn.susun ? conn.susun : {}

    let id = m.chat
    if (!(id in conn.susun)) throw false

    let json = conn.susun[id][1]
    let ans = json.jawaban

    // clue
    let clue = ans.replace(/[AIUEOaiueo]/g, '_')

    // tampilan reply dimodif
    m.reply(`
╭─〔 💡 PETUNJUK 〕─⬣
│
├ 🔎 Clue Jawaban :
│
│ \`\`\`
│ ${clue}
│ \`\`\`
│
├ 📌 Huruf vokal disamarkan
├ 🎮 Gunakan clue untuk membantu
│
╰──────────────⬣
`.trim())

}

handler.command = /^susn/i
handler.limit = true

module.exports = handler

// gh: dana_putra13