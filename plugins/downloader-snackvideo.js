/**
 * Plugin SnackVideo Downloader
 * Credit: AW BOT
 */

const axios = require("axios")
const cheerio = require("cheerio")

const handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) {
        return conn.reply(
            m.chat,
            `Masukkan link SnackVideo.\n\nContoh:\n${usedPrefix + command} https://www.snackvideo.com/...`,
            m
        )
    }

    try {

        await conn.reply(
            m.chat,
            "⏳ Sedang mengambil video SnackVideo...",
            m
        )

        const { data } = await axios({
            method: "POST",
            url: "https://snackvideodownloader.id/snack-downloader.php",

            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36",

                "Referer":
                    "https://getsnackvideo.org/",

                "Content-Type":
                    "application/x-www-form-urlencoded; charset=UTF-8",

                "X-Requested-With":
                    "XMLHttpRequest"
            },

            data: new URLSearchParams({
                video_url: text
            })
        })

        let video

        // Jika response HTML
        if (typeof data === "string") {

            const $ = cheerio.load(data)

            video =
                $("a[href$='.mp4']").attr("href") ||
                $("video source").attr("src") ||
                $("video").attr("src")
        }

        // Jika response JSON
        if (!video && typeof data === "object") {

            video =
                data?.data?.withoutWatermark ||
                data?.data?.video_url ||
                data?.video ||
                data?.url
        }

        if (!video) {
            return conn.reply(
                m.chat,
                "❌ Video tidak ditemukan.\nMungkin link tidak support atau website berubah.",
                m
            )
        }

        await conn.sendFile(
            m.chat,
            video,
            "snackvideo.mp4",
            "✅ Success Download SnackVideo\n\n© Credit: AW BOT",
            m
        )

    } catch (err) {

        console.log(err)

        conn.reply(
            m.chat,
            `❌ Terjadi kesalahan.\n\n${err.response?.data || err.message}`,
            m
        )
    }
}

handler.help = ["snack <url>"]
handler.tags = ["downloader"]
handler.command = /^(snack|snackvideo)$/i

module.exports = handler