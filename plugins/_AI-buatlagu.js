let axios = require('axios')

let handler = async (m, { conn, text }) => {

    if (!text)
        return conn.reply(
            m.chat,
            `
❌ Masukkan prompt lagu

Contoh:
.hdmusic lo-fi hujan malam santai
            `.trim(),
            m
        )

    try {

        await conn.reply(
            m.chat,
            '⏳ Sedang membuat musik AI...',
            m
        )

        // API relay/community
        let { data } = await axios.get(
            `https://api.agatz.xyz/api/riffusion?prompt=${encodeURIComponent(text)}`
        )

        let result = data.data

        if (!result?.audio)
            throw 'Audio tidak ditemukan'

        await conn.sendMessage(m.chat, {
            audio: { url: result.audio },
            mimetype: 'audio/mpeg',
            fileName: 'awbot-music.mp3',
            ptt: false
        }, { quoted: m })

        if (result.image) {
            await conn.sendMessage(m.chat, {
                image: { url: result.image },
                caption: `
╭─〔 AI MUSIC GENERATOR 〕─⬣
│
├ 🎵 Prompt:
│ ${text}
│
├ ⚡ Powered by AW BOT
╰──────────────⬣
                `.trim()
            }, { quoted: m })
        }

    } catch (e) {

        conn.reply(
            m.chat,
            `
❌ Error AI Music

📌 ${e.message || e}

⚡ Powered by AW BOT
            `.trim(),
            m
        )
    }
}

handler.help = ['hdmusic']
handler.tags = ['ai']
handler.command = /^(hdmusic|musicai)$/i

module.exports = handler