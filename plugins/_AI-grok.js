const axios = require('axios')

const API_KEY = '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'
const API = 'https://api.groq.com/openai/v1/chat/completions'

let handler = async (m, { text, conn }) => {
    if (!text) return m.reply('❌ Contoh: .ai halo')

    await m.reply('⏳ Sedang berpikir...')

    try {
        const { data } = await axios.post(API, {
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'user', content: text }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            timeout: 60000
        })

        let result = data.choices[0].message.content

        await conn.reply(m.chat, result, m)

    } catch (e) {
        console.log(e)
        m.reply('❌ Error saat request AI')
    }
}

handler.help = ['ai <teks>']
handler.tags = ['ai']
handler.command = /^grok$/i

module.exports = handler