let handler = async (m, { conn, text, args, groupMetadata }) => {
    //await conn.sendPresenceUpdate('composing', m.chat)

    const lama = 86400000 * 7
    const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
    const milliseconds = new Date(now).getTime()

    let member = groupMetadata.participants.map(v => v.id)
    let total = 0
    const sider = []

    for (let i = 0; i < member.length; i++) {
        let users = groupMetadata.participants.find(u => u.id === member[i])
        if ((typeof global.db.data.users[member[i]] === 'undefined' || milliseconds - global.db.data.users[member[i]].lastseen > lama) && !users.isAdmin && !users.isSuperAdmin) {
            if (typeof global.db.data.users[member[i]] !== 'undefined') {
                if (global.db.data.users[member[i]].banned === true) {
                    total++
                    sider.push(member[i])
                }
            } else {
                total++
                sider.push(member[i])
            }
        }
    }

    if (!args[0]) {
        return conn.reply(m.chat, `🚩 Gunakan perintah dengan opsi.:\n1. \`gcsider list\` untuk menampilkan daftar anggota yang tidak aktif\n2. \`gcsider kick\` untuk mengeluarkan anggota yang tidak aktif`, m)
    }

    if (args[0] === 'list') {
        if (total === 0) return conn.reply(m.chat, `🚩 *Tidak ada member yang terlist dalam group ini..*`, m)
        
        const groupName = await conn.getName(m.chat)
        const message = `*${total}/${member.length}* anggota grup *${groupName}* adalah sider:\n${sider.map(v => '  ○ @' + v.replace(/@.+/, '')).join('\n')}`

        return conn.reply(m.chat, message, m, {
            contextInfo: {
                mentionedJid: sider
            }
        })
    }

    if (args[0] === 'kick') {
        if (total === 0) return conn.reply(m.chat, `🚩 *Tidak ada member yang bisa dikeluarkan dalam group ini..*`, m)

        for (const user of sider) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
            } catch (e) {
                throw e 
            }
        }

        return conn.reply(m.chat, `🚩 Berhasil dikeluarkan *${total}* anggota tidak aktif dari grup.`, m)
    }

    return conn.reply(m.chat, `🚩Opsi tidak valid. Gunakan \`--list\` untuk melihat anggota yang tidak aktif atau \`--kick\` untuk mengeluarkan dari Group.`, m)
}

handler.help = ['sider']
handler.tags = ['group']
handler.command = /^(sider|gcsider)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

module.exports = handler
