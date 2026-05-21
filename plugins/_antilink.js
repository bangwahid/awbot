let handler = m => m

let linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i

handler.before = async function (m, { conn, isBotAdmin, isAdmin, isOwner }) {

    // =========================
    // SKIP
    // =========================
    if (
        (m.isBaileys && m.fromMe) ||
        m.fromMe ||
        !m.isGroup
    ) return true

    // =========================
    // DATABASE
    // =========================
    let chat = global.db.data.chats[m.chat]

    if (!chat?.antiLink) return true

    // =========================
    // ADMIN BYPASS
    // =========================
    if (isAdmin || isOwner) return true

    // =========================
    // BOT ADMIN CHECK
    // =========================
    if (!isBotAdmin) return true

    // =========================
    // GET TEXT
    // =========================
    let teks = m.text || ''

    if (m.message?.extendedTextMessage?.text)
        teks = m.message.extendedTextMessage.text

    if (m.message?.conversation)
        teks = m.message.conversation

    if (m.message?.imageMessage?.caption)
        teks += m.message.imageMessage.caption

    if (m.message?.videoMessage?.caption)
        teks += m.message.videoMessage.caption

    // =========================
    // DETECT LINK
    // =========================
    let isGroupLink = linkRegex.exec(teks)

    if (!isGroupLink) return true

    // =========================
    // IGNORE OWN GROUP LINK
    // =========================
    let linkGC =
        'https://chat.whatsapp.com/' +
        await conn.groupInviteCode(m.chat)

    let isLinkThisGroup =
        new RegExp(linkGC, 'i').test(teks)

    if (isLinkThisGroup) return true

    // =========================
    // DELETE MESSAGE
    // =========================
    await conn.sendMessage(
        m.chat,
        {
            delete: m.key
        }
    )

    return true
}

module.exports = handler

/*
Script by AW BOT - Wahid
*/