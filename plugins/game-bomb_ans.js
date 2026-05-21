const util = require('util')

let handler = m => m

handler.before = async function (m) {

try {

let id = m.chat
let text = (m.text || '').trim()

conn.bomb = conn.bomb ? conn.bomb : {}

// =========================
// ❌ JIKA TIDAK ADA GAME
// =========================
if (!(id in conn.bomb)) return true

// =========================
// 🚩 SURRENDER
// =========================
if (/^(suren)$/i.test(text)) {

    await conn.reply(m.chat, `
🏳️ *MENYERAH*
━━━━━━━━━━━━━━
Kamu keluar dari permainan
━━━━━━━━━━━━━━
    `.trim(), m)

    clearTimeout(conn.bomb[id][2])
    delete conn.bomb[id]

    return true
}

// =========================
// 🎯 VALID INPUT (HARUS 1-9)
// =========================
if (!/^[1-9]$/.test(text)) return true

let json = conn.bomb[id][1].find(v => v.position == text)
if (!json) return true

let users = global.db.data.users[m.sender]
let reward = randomInt(100, 800)
let timeout = 180000

// =========================
// 💥 KENA BOM
// =========================
if (json.emot == '💥') {

json.state = true
let bomb = conn.bomb[id][1]

let teks = `
💣 *B O M B - GAME OVER*
━━━━━━━━━━━━━━
`

teks += bomb.slice(0, 3).map(v => v.state ? v.emot : v.number).join('') + '\n'
teks += bomb.slice(3, 6).map(v => v.state ? v.emot : v.number).join('') + '\n'
teks += bomb.slice(6).map(v => v.state ? v.emot : v.number).join('') + '\n'

teks += `
━━━━━━━━━━━━━━
❌ KAMU KENA BOM!
💸 -${formatNumber(reward)} EXP
━━━━━━━━━━━━━━
`

conn.reply(m.chat, teks, m).then(() => {

    users.exp = users.exp < reward ? 0 : users.exp - reward

    clearTimeout(conn.bomb[id][2])
    delete conn.bomb[id]

})

// =========================
// ❌ SUDAH DIBUKA
// =========================
} else if (json.state) {

return conn.reply(m.chat, `
⚠️ Kotak *${json.number}* sudah dibuka
Pilih kotak lain
`.trim(), m)

// =========================
// ✅ AMAN / LANJUT
// =========================
} else {

json.state = true
let changes = conn.bomb[id][1]
let open = changes.filter(v => v.state && v.emot != '💥').length

// =========================
// 🏆 MENANG
// =========================
if (open >= 8) {

let teks = `
💣 *B O M B - WIN*
━━━━━━━━━━━━━━
`

teks += changes.slice(0, 3).map(v => v.state ? v.emot : v.number).join('') + '\n'
teks += changes.slice(3, 6).map(v => v.state ? v.emot : v.number).join('') + '\n'
teks += changes.slice(6).map(v => v.state ? v.emot : v.number).join('') + '\n'

teks += `
━━━━━━━━━━━━━━
🎉 KAMU MENANG!
💰 +${formatNumber(reward)} EXP
━━━━━━━━━━━━━━
`

conn.reply(m.chat, teks, m).then(() => {

    users.exp += reward

    clearTimeout(conn.bomb[id][2])
    delete conn.bomb[id]

})

// =========================
// 🔄 LANJUT GAME
// =========================
} else {

let teks = `
💣 *B O M B*
━━━━━━━━━━━━━━
`

teks += changes.slice(0, 3).map(v => v.state ? v.emot : v.number).join('') + '\n'
teks += changes.slice(3, 6).map(v => v.state ? v.emot : v.number).join('') + '\n'
teks += changes.slice(6).map(v => v.state ? v.emot : v.number).join('') + '\n'

teks += `
━━━━━━━━━━━━━━
⏳ Sisa waktu : ${(timeout / 60000)} menit
🎯 Lanjutkan permainan...
`

conn.reply(m.chat, teks, m).then(() => {
    users.exp += reward
})

}

}

} catch (e) {
return conn.reply(m.chat, util.format(e), m)
}

return true
}

// =========================
// UTIL
// =========================
handler.exp = 0

function randomInt(min, max) {
return Math.floor(Math.random() * (max - min + 1)) + min
}

function formatNumber(number) {
return number.toLocaleString()
}

module.exports = handler