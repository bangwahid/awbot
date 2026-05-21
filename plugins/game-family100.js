let fs = require('fs')

let winScore = 500
let rewardAmount = 10000

let handler = async (m, { conn }) => {

    conn.family = conn.family ? conn.family : {}

    let id = m.chat

    if (id in conn.family) {
        return conn.reply(m.chat, `
⚠️ *GAME MASIH BERJALAN*
━━━━━━━━━━━━━━
Selesaikan dulu game sebelumnya
━━━━━━━━━━━━━━
        `.trim(), conn.family[id].msg)
    }

    // =========================
    // 📁 AMBIL DATA JSON
    // =========================
    let data = JSON.parse(fs.readFileSync('./lib/json/family100.json'))

    let json = data[Math.floor(Math.random() * data.length)]

    // =========================
    // 💬 UI CAPTION
    // =========================
    let caption = `
👨‍👩‍👧‍👦 *FAMILY 100*
━━━━━━━━━━━━━━

❓ ${json.soal}

🎯 Tebak semua jawaban yang benar!
💰 +${rewardAmount} per jawaban benar

🏳️ Ketik *nyerah* untuk menyerah
━━━━━━━━━━━━━━
    `.trim()

    conn.family[id] = {
        id,
        msg: await m.reply(caption),
        ...json,
        terjawab: Array(json.jawaban.length).fill(false),
        winScore,
        rewardAmount,
        timeout: setTimeout(() => {

            if (conn.family[id]) {
                conn.reply(m.chat, `
⏰ *WAKTU HABIS*
━━━━━━━━━━━━━━
Game selesai!
━━━━━━━━━━━━━━
                `.trim(), conn.family[id].msg)
            }

            delete conn.family[id]

        }, 180000)
    }
}

// =========================
// 🏳️ NYERAH
// =========================
handler.nyerah = async function (m) {

    let id = m.chat

    if (id in conn.family) {

        conn.reply(m.chat, `
🏳️ *MENYERAH*
━━━━━━━━━━━━━━
Game dihentikan
━━━━━━━━━━━━━━
        `.trim(), conn.family[id].msg)

        clearTimeout(conn.family[id].timeout)
        delete conn.family[id]

    } else {
        conn.reply(m.chat, 'Tidak ada game aktif.', m)
    }
}

handler.help = ['family100']
handler.tags = ['game']
handler.group = true
handler.command = /^family100$/i

module.exports = handler