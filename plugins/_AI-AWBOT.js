const crypto = require('node:crypto')
const fetch = require('node-fetch')

const API = 'https://api.overchat.ai/v1/chat/completions'

let handler = async (m, { conn, text, usedPrefix, command }) => {

    try {

        let q = text

        // =========================
        // IMAGE
        // =========================
        let imageBase64 = null

        let quoted = m.quoted ? m.quoted : m

        let mime = (quoted.msg || quoted).mimetype || ''

        if (/image\/(png|jpe?g|webp)/i.test(mime)) {

            await conn.reply(
                m.chat,
                '🖼️ Sedang menganalisis gambar...',
                m
            )

            let media = await quoted.download()

            imageBase64 =
                `data:${mime};base64,${media.toString('base64')}`

        }

        // =========================
        // VALIDASI
        // =========================
        if (!q && !imageBase64) {

            return conn.reply(
                m.chat,
                `
Masukkan pertanyaan atau reply gambar

Contoh:
${usedPrefix + command} siapa presiden indonesia

Atau reply gambar:
${usedPrefix + command} jelaskan gambar ini
                `.trim(),
                m
            )

        }

        await conn.reply(
            m.chat,
            '⏳ AW BOT sedang berpikir...',
            m
        )

        // =========================
        // DATABASE
        // =========================
        global.db.data.users =
            global.db.data.users || {}

        let user =
            global.db.data.users[m.sender]

        if (!user) {

            global.db.data.users[m.sender] = {}

            user =
                global.db.data.users[m.sender]

        }

        // =========================
        // SESSION
        // =========================
        if (!user.awbotSession) {

            user.awbotSession = {
                chatId: crypto.randomUUID(),
                deviceId: crypto.randomUUID(),
                messages: []
            }

        }

        const session = user.awbotSession

        // =========================
        // RESET MEMORY IDENTITAS
        // =========================
        const resetPattern =
            /siapa kamu|siapa pembuatmu|developer kamu|owner kamu|apakah kamu claude|bot apa ini/i

        if (resetPattern.test(q || '')) {
            session.messages = []
        }

        // =========================
        // USER CONTENT
        // =========================
        let userContent = q

        if (imageBase64) {

            userContent = [
                {
                    type: 'text',
                    text: q || 'Tolong jelaskan gambar ini.'
                },
                {
                    type: 'image_url',
                    image_url: {
                        url: imageBase64
                    }
                }
            ]

        }

        // =========================
        // MESSAGE
        // =========================
        const userMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: userContent
        }

        // =========================
        // SYSTEM MESSAGE
        // =========================
        const systemMessage = {
            id: crypto.randomUUID(),
            role: 'system',
            content: `
Kamu adalah AW BOT buatan Wahid.

Kamu BUKAN Claude.
Kamu BUKAN AI Anthropic.
Jangan pernah mengaku sebagai Claude.

Jika ada yang bertanya:
- siapa kamu
- siapa pembuatmu
- siapa developer kamu
- siapa owner kamu
- bot apa ini
- apakah kamu claude
- apakah kamu chatgpt

Jawab:
"Saya adalah AW BOT yang dibuat oleh Wahid."

Jawab dengan gaya santai, natural, singkat, jelas, dan mengikuti bahasa user.
Jika ada gambar, analisis dengan detail.
            `.trim()
        }

        // =========================
        // LIMIT HISTORY
        // =========================
        if (session.messages.length > 6) {

            session.messages =
                session.messages.slice(
                    session.messages.length - 6
                )

        }

        // =========================
        // BODY
        // =========================
        const body = {
            chatId: session.chatId,
            model: 'claude-haiku-4-5-20251001',
            messages: [
                systemMessage,
                ...session.messages,
                userMessage
            ],
            personaId: 'claude-haiku-4-5-landing',
            frequency_penalty: 0,
            max_tokens: 4000,
            presence_penalty: 0,
            stream: true,
            temperature: 0.5,
            top_p: 0.95
        }

        // =========================
        // HEADERS
        // =========================
        const headers = {
            'sec-ch-ua-platform': `"Android"`,
            'x-device-uuid': session.deviceId,
            'sec-ch-ua':
                `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
            'sec-ch-ua-mobile': '?1',
            'x-device-language': 'id-ID',
            'x-device-platform': 'web',
            'x-device-version': '1.0.44',
            'user-agent':
                'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36',
            accept: '*/*',
            'content-type': 'application/json',
            origin: 'https://overchat.ai',
            referer: 'https://overchat.ai/',
            'accept-language': 'id-ID,id;q=0.9'
        }

        // =========================
        // FETCH API
        // =========================
        const response = await fetch(API, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        })

        if (!response.ok) {

            const err = await response.text()

            throw new Error(
                err || `HTTP Error ${response.status}`
            )

        }

        // =========================
        // STREAM
        // =========================
        let answer = ''
        let buffer = ''

        for await (const chunk of response.body) {

            buffer += chunk.toString()

            let parts = buffer.split('\n')

            buffer = parts.pop() || ''

            for (let part of parts) {

                part = part.trim()

                if (!part.startsWith('data:')) continue

                const data =
                    part.replace(/^data:\s*/, '')

                if (!data || data === '[DONE]')
                    continue

                try {

                    const json = JSON.parse(data)

                    const content =
                        json.choices?.[0]?.delta?.content

                    if (typeof content === 'string') {
                        answer += content
                    }

                } catch {}

            }

        }

        // =========================
        // FORCE REPLACE IDENTITAS
        // =========================
        answer = answer
            .replace(/claude/gi, 'AW BOT')
            .replace(/anthropic/gi, 'Wahid')

        // =========================
        // FALLBACK
        // =========================
        if (!answer.trim()) {
            answer = 'Tidak ada respon dari AW BOT.'
        }

        // =========================
        // SAVE HISTORY
        // =========================
        session.messages.push({
            id: userMessage.id,
            role: 'user',
            content:
                typeof userContent === 'string'
                    ? userContent
                    : q
        })

        session.messages.push({
            id: crypto.randomUUID(),
            role: 'assistant',
            content: answer
        })

        // =========================
        // OUTPUT
        // =========================
        await conn.reply(
            m.chat,
            `
╭─〔 AW BOT AI 〕─⬣
│
${answer}
│
├ ⚡ Powered by AW BOT
╰──────────────⬣
            `.trim(),
            m
        )

    } catch (e) {

        console.log(e)

        conn.reply(
            m.chat,
            `
❌ Terjadi kesalahan

📌 ${e.message || e}

⚡ Powered by AW BOT
            `.trim(),
            m
        )

    }

}

handler.help = ['aw', 'awbot']
handler.tags = ['ai']
handler.command = /^(aw|awbot)$/i

handler.limit = true
handler.register = false

module.exports = handler

/*
Script by AW BOT - Wahid
*/