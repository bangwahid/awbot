let handler = async (m, { conn, text, isAdmin, isOwner }) => {

    // =========================
    // GROUP ONLY
    // =========================
    if (!m.isGroup) {
        return conn.reply(
            m.chat,
            '❌ Command ini hanya untuk grup.',
            m
        )
    }

    // =========================
    // ADMIN ONLY
    // =========================
    if (!isAdmin && !isOwner) {
        return conn.reply(
            m.chat,
            '❌ Hanya admin yang bisa menggunakan command ini.',
            m
        )
    }

    // =========================
    // DATABASE
    // =========================
    global.db.data.chats[m.chat] =
        global.db.data.chats[m.chat] || {}

    let chat = global.db.data.chats[m.chat]

    // =========================
    // STATUS
    // =========================
    if (!text) {

        return conn.reply(
            m.chat,
            `
╭─〔 ANTILINK V2 〕─⬣
│
├ Status : ${chat.antilinkv2 ? 'ON ✅' : 'OFF ❌'}
│
├ Gunakan:
├ • .antilinkv2 on
├ • .antilinkv2 off
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

        chat.antilinkv2 = true

        return conn.reply(
            m.chat,
            `
╭─〔 ANTILINK V2 〕─⬣
│
├ ✅ Antilink berhasil diaktifkan
│
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

        chat.antilinkv2 = false

        return conn.reply(
            m.chat,
            `
╭─〔 ANTILINK V2 〕─⬣
│
├ ❌ Antilink berhasil dimatikan
│
├ ⚡ Powered by AW BOT
╰──────────────⬣
            `.trim(),
            m
        )

    }

}

// =================================================
// ANTILINK DETECTOR
// =================================================
handler.before = async function (
    m,
    { isAdmin, isBotAdmin, isOwner }
) {

    // =========================
    // GROUP ONLY
    // =========================
    if (!m.isGroup) return

    // =========================
    // DATABASE
    // =========================
    let chat = global.db.data.chats[m.chat]

    if (!chat) return
    if (!chat.antilinkv2) return

    // =========================
    // BYPASS
    // =========================
    if (isAdmin || isOwner) return

    // =========================
    // BOT ADMIN
    // =========================
    if (!isBotAdmin) return

    // =========================
    // TEXT
    // =========================
    let text = m.text || ''

    // =========================
    // REGEX
    // =========================

    // WhatsApp Channel
    let waChannel =
        /https?:\/\/whatsapp\.com\/channel\/\S+/i

    // WA
    let wa =
        /https?:\/\/([a-z]+\.)?whatsapp\.[a-z.]+\/\S+/i

    // Shopee
    let shopee =
        /https?:\/\/([a-z]+\.)?shopee\.[a-z.]+\/\S+/i
    let shopee2 =
        /https?:\/\/([a-z]+\.)?shp\.[a-z.]+\/\S+/i

    // Tokopedia
    let tokopedia =
        /https?:\/\/(www\.)?tokopedia\.com\/\S+/i

    // Lazada
    let lazada =
        /https?:\/\/([a-z]+\.)?lazada\.[a-z.]+\/\S+/i

    // YouTube Live ONLY
    let youtubeLive =
        /https?:\/\/(www\.)?(youtube\.com\/live\/|youtube\.com\/watch\?.*live|youtu\.be\/live)/i
    let youtubeLive2 =
        /https?:\/\/(www\.)?(youtu\.com\/live\/|youtu\.be\/watch\?.*live|youtu\.be\/live)/i

    let detected =
        waChannel.test(text) ||
        wa.test(text) ||
        shopee.test(text) ||
        shopee2.test(text) ||
        tokopedia.test(text) ||
        lazada.test(text) ||
        youtubeLive.test(text) ||
        youtubeLive2.test(text)

    if (!detected) return

    // =========================
    // DELETE MESSAGE
    // =========================
    await this.sendMessage(
        m.chat,
        {
            delete: m.key
        }
    )

}

handler.help = ['antilinkv2 on/off']
handler.tags = ['group']
handler.command = /^(antilinkv2)$/i
handler.admin = true

module.exports = handler

/*
Script by AW BOT - Wahid
*/