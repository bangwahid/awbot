let handler = async (m, { conn }) => {

conn.bomb = conn.bomb ? conn.bomb : {}

let id = m.chat
let timeout = 180000

if (id in conn.bomb) {
    return conn.reply(m.chat, `
⚠️ *GAME MASIH BERJALAN*
━━━━━━━━━━━━━━
Selesaikan permainan yang sedang aktif dulu
━━━━━━━━━━━━━━
    `.trim(), conn.bomb[id][0])
}

// =========================
// 🎮 BOM SETUP
// =========================
const bom = ['💥','✅','✅','✅','✅','✅','✅','✅','✅']
    .sort(() => Math.random() - 0.5)

const number = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣']

const array = bom.map((v, i) => ({
    emot: v,
    number: number[i],
    position: i + 1,
    state: false
}))

// =========================
// 🎮 UI CAPTION
// =========================
let teks = `
💣 *B O M B GAME*
━━━━━━━━━━━━━━
🎯 Pilih kotak 1 - 9
💥 Hindari bom!

📩 Ketik angka untuk membuka kotak
━━━━━━━━━━━━━━
`

for (let i = 0; i < array.length; i += 3) {
    teks += array.slice(i, i + 3)
        .map(v => v.state ? v.emot : v.number)
        .join('') + '\n'
}

teks += `
━━━━━━━━━━━━━━
⏳ Timeout : ${timeout / 60000} menit
🏳️ Ketik *suren* untuk menyerah
`

// =========================
// SEND MESSAGE
// =========================
let msg = await conn.sendMessage(m.chat, {
    image: { url: 'https://telegra.ph/file/b3138928493e78b55526f.jpg' },
    caption: teks,
    mentions: [m.sender]
}, { quoted: m })

// =========================
// SESSION SAVE
// =========================
conn.bomb[id] = [
    msg,
    array,
    setTimeout(() => {

        let v = array.find(v => v.emot == '💥')

        if (conn.bomb[id]) {
            conn.reply(m.chat, `
⏰ *WAKTU HABIS*
━━━━━━━━━━━━━━
💥 Bom berada di kotak: ${v.number}
━━━━━━━━━━━━━━
            `.trim(), conn.bomb[id][0])
        }

        delete conn.bomb[id]

    }, timeout)
]

}

handler.help = ["bomb"]
handler.tags = ["game"]
handler.command = /^(bomb)$/i

module.exports = handler