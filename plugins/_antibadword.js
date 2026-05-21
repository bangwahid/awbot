let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat]
    let args = text.trim().split(/ +/)

    if (!chat.badword) chat.badword = false
    if (!chat.badwordlist) chat.badwordlist = []

    const defaultBadword = ['anjing', 'babi', 'kontol', 'memek', 'bangsat']

    switch (command) {
        case 'antibadword':
            if (!args[0]) {
                return conn.sendMessage(m.chat, {
                    text: `Status antibadword: ${chat.badword ? 'Aktif ✅' : 'Nonaktif ❌'}`
                })
            }

            if (args[0] === 'on') {
                chat.badword = true
                conn.sendMessage(m.chat, { text: '✅ Anti badword diaktifkan' })
            } else if (args[0] === 'off') {
                chat.badword = false
                conn.sendMessage(m.chat, { text: '❌ Anti badword dimatikan' })
            }
        break

        case 'addbadword':
            if (!text) return conn.sendMessage(m.chat, { text: 'Masukkan kata!' })

            if (!chat.badwordlist.includes(text.toLowerCase())) {
                chat.badwordlist.push(text.toLowerCase())
                conn.sendMessage(m.chat, { text: `✅ Ditambahkan: ${text}` })
            } else {
                conn.sendMessage(m.chat, { text: 'Sudah ada di list' })
            }
        break

        case 'delbadword':
            if (!text) return conn.sendMessage(m.chat, { text: 'Masukkan nomor!' })

            let index = parseInt(text) - 1

            let list = [...defaultBadword, ...chat.badwordlist]

            if (isNaN(index) || index < 0 || index >= list.length) {
                return conn.sendMessage(m.chat, { text: '❌ Nomor tidak valid!' })
            }

            let removed = list[index]

            // hanya boleh hapus dari custom list (biar default aman)
            if (index < defaultBadword.length) {
                return conn.sendMessage(m.chat, {
                    text: '❌ Tidak bisa menghapus badword default!'
                })
            }

            chat.badwordlist = chat.badwordlist.filter(v => v !== removed)

            conn.sendMessage(m.chat, {
                text: `✅ Berhasil menghapus: ${removed}`
            })
        break

        case 'listbadword':
            let all = [...defaultBadword, ...chat.badwordlist]

            conn.sendMessage(m.chat, {
                text: `📛 List Badword:\n\n${all.map((v, i) => `${i + 1}. ${v}`).join('\n')}`
            })
        break
    }
}

// DETECTOR
handler.before = async (m, { conn }) => {
    if (!m.isGroup) return
    if (m.fromMe) return
    if (!m.text) return

    let chat = global.db.data.chats[m.chat]
    if (!chat.badword) return

    const defaultBadword = ['anjing', 'babi', 'kontol', 'memek', 'bangsat']
    let custom = chat.badwordlist || []

    let allBadword = [...defaultBadword, ...custom]
    let text = m.text.toLowerCase()

    for (let word of allBadword) {
        if (text.includes(word)) {

            try {
                await conn.sendMessage(m.chat, { delete: m.key })
            } catch {}

            await conn.sendMessage(m.chat, {
                text: `🚫 @${m.sender.split('@')[0]} jaga bicara ya ⚠️`,
                mentions: [m.sender]
            })

            break
        }
    }
}

handler.help = ['antibadword', 'addbadword', 'delbadword', 'listbadword']
handler.tags = ['group']
handler.command = /^(antibadword|addbadword|delbadword|listbadword)$/i

handler.group = true
handler.admin = true

module.exports = handler