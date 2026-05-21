/**
 * ╔═══════════════════════╗
 *        AUTO AI — AW BOT
 * ╚═══════════════════════╝
 *
 * • Type    : Plugin CJS
 * • Command : .autoai on/off
 * • Creator : Wahid
 * • Credit  : AW BOT
 */

const axios = require("axios")

const API_URL =
    "https://api.theresav.biz.id/ai/feelbetter"

const API_KEY = "SurGG"

const AI_PROMPT = `
Nama kamu adalah AW BOT.

AW BOT adalah asisten virtual pintar,
ramah, santai, modern, dan suka membantu pengguna.

AW BOT dibuat oleh Wahid
khusus untuk WhatsApp Bot
dengan gaya ngobrol yang natural,
tidak terlalu formal,
sering memakai emoji seperlunya,
dan memberikan jawaban yang jelas.

Jika ada yang bertanya:
- siapa pembuatmu
- siapa developer kamu
- siapa owner kamu

Jawab:
"Saya adalah AW BOT yang dibuat oleh Wahid."

AW BOT bisa diajak:
- ngobrol santai
- membantu coding
- mencari ide
- membantu tugas
- hiburan
- dan menjawab pertanyaan pengguna

Gunakan bahasa Indonesia yang nyaman dibaca.
Jawaban jangan terlalu panjang kecuali diminta.
`

const getSenderKey = (m) => {
    return `${m.chat}:${
        m.sender ||
        m.key?.participant ||
        m.key?.remoteJid ||
        ""
    }`
}

const getMessageText = (m) => {

    return (
        m.text ||
        m.message?.conversation ||
        m.message?.extendedTextMessage?.text ||
        m.message?.imageMessage?.caption ||
        m.message?.videoMessage?.caption ||
        m.message?.buttonsResponseMessage?.selectedButtonId ||
        m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        m.message?.templateButtonReplyMessage?.selectedId ||
        ""
    ).trim()
}

const isCommandText = (text) => {

    const prefix = global.prefix

    if (typeof prefix === "function") {
        return prefix({ text })
    }

    if (prefix instanceof RegExp) {
        return prefix.test(text)
    }

    if (typeof prefix === "string") {
        return text.startsWith(prefix)
    }

    return /^[!./#%$^&*~|-]/.test(text)
}

async function fetchAutoAI(text, sessionId) {

    try {

        const { data } = await axios.get(API_URL, {
            params: {
                text,
                prompt: AI_PROMPT,
                apikey: API_KEY,
                chatId: sessionId
            }
        })

        if (!data?.status || !data?.result) {
            throw "Respon API tidak valid."
        }

        return data.result

    } catch (e) {

        throw (
            e?.response?.data?.message ||
            e?.message ||
            e
        )
    }
}

const handler = async (
    m,
    {
        conn,
        usedPrefix,
        command,
        args
    }
) => {

    conn.autoai = conn.autoai || {}

    const chatKey =
        getSenderKey(m)

    const state =
        conn.autoai[chatKey]

    if (!args[0]) {

        return conn.reply(
            m.chat,

`╭━━〔 AW BOT AUTO AI 〕━⬣
┃ ✦ ${usedPrefix + command} on
┃ ✦ ${usedPrefix + command} off
╰━━━━━━━━━━━━⬣

Aktifkan fitur AutoAI agar
AW BOT membalas chat otomatis.`,
            m
        )
    }

    try {

        if (
            args[0].toLowerCase() === "on"
        ) {

            if (
                state?.active
            ) {

                return conn.reply(
                    m.chat,

`╭━━〔 AW BOT AUTO AI 〕━⬣
┃ ⚠️ Status : Sudah Aktif
┃ 🧠 Session :
┃ ${state.sessionid}
╰━━━━━━━━━━━━⬣`,
                    m
                )
            }

            conn.autoai[chatKey] = {
                active: true,
                sessionid:
                    Date.now().toString()
            }

            return conn.reply(
                m.chat,

`╭━━〔 AW BOT AUTO AI 〕━⬣
┃ ✅ AutoAI Diaktifkan
┃ 💬 Chat tanpa command
┃ 🤖 AW BOT siap membalas
╰━━━━━━━━━━━━⬣`,
                m
            )
        }

        if (
            args[0].toLowerCase() === "off"
        ) {

            if (
                !state?.active
            ) {

                return conn.reply(
                    m.chat,

`╭━━〔 AW BOT AUTO AI 〕━⬣
┃ ⚠️ AutoAI sudah off
╰━━━━━━━━━━━━⬣`,
                    m
                )
            }

            delete conn.autoai[chatKey]

            return conn.reply(
                m.chat,

`╭━━〔 AW BOT AUTO AI 〕━⬣
┃ ❌ AutoAI Dimatikan
┃ 🗑️ Session dihapus
╰━━━━━━━━━━━━⬣`,
                m
            )
        }

        return conn.reply(
            m.chat,

`╭━━〔 AW BOT AUTO AI 〕━⬣
┃ Gunakan:
┃ ${usedPrefix + command} on
┃ ${usedPrefix + command} off
╰━━━━━━━━━━━━⬣`,
            m
        )

    } catch (e) {

        console.log(e)

        return conn.reply(
            m.chat,

`╭━━〔 AW BOT ERROR 〕━⬣
┃ ${e}
╰━━━━━━━━━━━━━━━⬣`,
            m
        )
    }
}

handler.before = async function (m) {

    const conn = this

    conn.autoai =
        conn.autoai || {}

    try {

        if (
            !m ||
            m.isBaileys ||
            m.fromMe ||
            m.key?.fromMe
        ) return

        const text =
            getMessageText(m)

        if (!text) return

        if (
            isCommandText(text)
        ) return

        if (
            /^\.autoai(\s|$)/i.test(text)
        ) return

        const chatKey =
            getSenderKey(m)

        const state =
            conn.autoai[chatKey]

        if (
            !state?.active
        ) return

        await conn.sendPresenceUpdate(
            "composing",
            m.chat
        )

        const result =
            await fetchAutoAI(
                text,
                state.sessionid
            )

        await conn.sendPresenceUpdate(
            "paused",
            m.chat
        )

        await conn.reply(
            m.chat,

`${result}

> © AW BOT`,
            m
        )

    } catch (e) {

        console.log(e)

        await conn.sendPresenceUpdate(
            "paused",
            m.chat
        ).catch(() => {})

        return conn.reply(
            m.chat,

`╭━━〔 AW BOT ERROR 〕━⬣
┃ AI sedang bermasalah
╰━━━━━━━━━━━━━━━⬣`,
            m
        )
    }
}

handler.help = ["autoai on/off"]
handler.tags = ["ai"]
handler.command = /^(autoai)$/i

handler.limit = false
handler.register = false

module.exports = handler