const delay = time => new Promise(res => setTimeout(res, time))

let handler = async (m, { conn }) => {
    let msg = await conn.sendContact(m.chat, global.owner, m)

    await delay(1000)

    await conn.sendMessage(
        m.chat,
        {
            text: `Hallo Kak @${m.sender.split('@')[0]}, Itu Nomor Ownerku, Silahkan hubungi jika ada keperluan tentang Bot`,
            mentions: [m.sender]
        },
        { quoted: msg }
    )
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = /^(owner|creator)$/i

module.exports = handler