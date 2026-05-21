let handler = async (m, { conn, text, isAdmin, isOwner, isBotAdmin }) => {

    // =========================
    // GROUP ONLY
    // =========================
    if (!m.isGroup)
        return conn.reply(m.chat, '❌ Fitur ini hanya untuk grup.', m)

    // =========================
    // ONLY ADMIN
    // =========================
    if (!isAdmin && !isOwner)
        return conn.reply(m.chat, '❌ Hanya admin yang bisa mengatur antiscam.', m)

    // =========================
    // DB CHAT
    // =========================
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
    let chat = global.db.data.chats[m.chat]

    chat.antiscam = chat.antiscam || false

    // =========================
    // MENU
    // =========================
    if (!text) {
        return conn.reply(
            m.chat,
            `
╭─〔 ANTISCAM 〕─⬣
│
├ Status : ${chat.antiscam ? 'ON ✅' : 'OFF ❌'}
│
├ Command:
├ • .antiscam on
├ • .antiscam off
│
├ ⚡ Powered by AW BOT
╰──────────────⬣
            `.trim(),
            m
        )
    }

    // =========================
    // ON
    // =========================
    if (text.toLowerCase() === 'on') {

        chat.antiscam = true

        return conn.reply(
            m.chat,
            `
╭─〔 ANTISCAM 〕─⬣
│
├ ✅ Antiscam diaktifkan
│
├ ⚡ Powered by AW BOT
╰──────────────⬣
            `.trim(),
            m
        )
    }

    // =========================
    // OFF
    // =========================
    if (text.toLowerCase() === 'off') {

        chat.antiscam = false

        return conn.reply(
            m.chat,
            `
╭─〔 ANTISCAM 〕─⬣
│
├ ❌ Antiscam dimatikan
│
├ ⚡ Powered by AW BOT
╰──────────────⬣
            `.trim(),
            m
        )
    }
}

// ==================================================
// DETECTOR
// ==================================================
handler.before = async function (m, { conn, isAdmin, isOwner, isBotAdmin }) {

    if (!m.isGroup) return
    if (!isBotAdmin) return

    let chat = global.db.data.chats[m.chat]
    if (!chat?.antiscam) return

    if (isAdmin || isOwner) return

    let text = (m.text || '').toLowerCase()

    // =========================
    // SCAM PATTERN
    // =========================
    let scamRegex =
        /(jual|ready|beli|wts|jb|gb|ready|akun|promo|diskon|murah|gratis|giveaway|cuan|profit|investasi|penghasilan|phishing|login|akun|verify|otp|slot|judi|casino|maxwin|jackpot|deposit|wd|withdraw|t\.me|join channel|join grup|18\+|bokep|porn|xxx|dewasa|alfagift|indomaretgift|indomaret-gift|alfamartgift|giftcard|reward|claim|voucher|hadiah|saldo|dana\s?kaget|pm)/i

    // =========================
    // SCAM LINKS
    // =========================
    let scamLink =
        /(grabify|iplogger|freegift|giftcard|claim|reward|voucher|alfagift|indomaretgift|promo)/i

    let detected =
        scamRegex.test(text) || scamLink.test(text)

    if (!detected) return

    // =========================
    // DELETE MESSAGE
    // =========================
    await conn.sendMessage(m.chat, {
        delete: m.key
    })

    return !0
}

handler.help = ['antiscam on/off']
handler.tags = ['group']
handler.command = /^antiscam$/i
handler.admin = true

module.exports = handler

/*
Script by AW BOT - Wahid
*/