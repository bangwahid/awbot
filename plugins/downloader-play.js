let axios = require('axios')
let yts = require('yt-search')
let crypto = require('crypto')
let fs = require('fs')
let path = require('path')
let { exec } = require('child_process')
let { promisify } = require('util')

const run = promisify(exec)

const YOUTUBE_ID_REGEX =
/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/

function extractVideoId(url) {
    return String(url || "").match(YOUTUBE_ID_REGEX)?.[1] || null
}

// ==============================
// FALLBACK MP3 BUFFER
// ==============================
async function fallbackToMp3Buffer(url) {

    const tempDir = path.join(process.cwd(), "temp")

    if (!fs.existsSync(tempDir))
        fs.mkdirSync(tempDir, { recursive: true })

    const id = crypto.randomBytes(6).toString("hex")

    const inputPath = path.join(tempDir, `ytfb_${id}.bin`)
    const outputPath = path.join(tempDir, `ytfb_${id}.mp3`)

    try {

        const { data } = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: 60000
        })

        const buffer = Buffer.from(data)

        if (!buffer.length)
            throw new Error("Audio kosong")

        fs.writeFileSync(inputPath, buffer)

        await run(
            `ffmpeg -y -i "${inputPath}" -vn -map_metadata -1 -ac 2 -ar 44100 -c:a libmp3lame -b:a 192k "${outputPath}"`,
            { timeout: 120000 }
        )

        const mp3Buffer = fs.readFileSync(outputPath)

        if (!mp3Buffer.length)
            throw new Error("Konversi MP3 gagal")

        return mp3Buffer

    } finally {

        try {
            if (fs.existsSync(inputPath))
                fs.unlinkSync(inputPath)
        } catch {}

        try {
            if (fs.existsSync(outputPath))
                fs.unlinkSync(outputPath)
        } catch {}
    }
}

// ==============================
// SCRAPER
// ==============================
async function ytdl(url, format = "mp3") {

    try {

        const videoId = extractVideoId(url)

        if (!videoId) {
            return {
                status: false,
                mess: "URL YouTube tidak valid"
            }
        }

        const client = axios.create({
            timeout: 60000,
            headers: {
                "User-Agent":
                "Mozilla/5.0 (Linux; Android 16)",
                Referer: "https://id.ytmp3.mobi/"
            }
        })

        const { data: init } = await client.get(
            "https://d.ymcdn.org/api/v1/init",
            {
                params: {
                    p: "y",
                    23: "1llum1n471",
                    _: Math.random()
                }
            }
        )

        if (!init?.convertURL) {
            return {
                status: false,
                mess: "Init server gagal"
            }
        }

        const { data: convert } = await client.get(
            init.convertURL,
            {
                params: {
                    v: videoId,
                    f: format,
                    _: Math.random()
                }
            }
        )

        if (!convert?.progressURL || !convert?.downloadURL) {
            return {
                status: false,
                mess: "Convert gagal"
            }
        }

        let progress = 0
        let title = convert.title || ""

        for (let i = 0; i < 20; i++) {

            const { data } = await client.get(convert.progressURL)

            progress = Number(data?.progress || 0)

            title = data?.title || title

            if (progress >= 3)
                break

            await new Promise(resolve =>
                setTimeout(resolve, 250)
            )
        }

        return {
            status: true,
            title,
            dl: convert.downloadURL
        }

    } catch (e) {

        return {
            status: false,
            mess: e.message
        }
    }
}

// ==============================
// HANDLER
// ==============================
let handler = async (m, { conn, text }) => {

    if (!text)
        return conn.reply(
            m.chat,
`
❌ Masukkan judul lagu

Contoh:
.play alan walker
.play dj remix viral
`.trim(),
            m
        )

    try {

        await conn.reply(
            m.chat,
            '🔎 Sedang mencari lagu...',
            m
        )

        // ======================
        // SEARCH
        // ======================
        let search = await yts(text)

        if (!search.videos.length)
            throw 'Lagu tidak ditemukan'

        let video = search.videos[0]

        // ======================
        // SCRAPE
        // ======================
        let res = await ytdl(video.url, 'mp3')

        if (!res.status)
            throw res.mess

        // ======================
        // CAPTION
        // ======================
        let caption = `
╭──〔 🎵 PLAY MUSIC 〕──⬣
│
├ 📌 Judul:
│ ${video.title}
│
├ ⏱️ Durasi:
│ ${video.timestamp}
│
├ 👀 Views:
│ ${video.views.toLocaleString()}
│
├ 📺 Channel:
│ ${video.author.name}
│
├ ⚡ Powered by AW BOT
╰────────────────⬣
        `.trim()

        // ======================
        // SEND THUMB
        // ======================
        await conn.sendMessage(m.chat, {
            image: { url: video.thumbnail },
            caption
        }, { quoted: m })

        // ======================
        // BUFFER AUDIO
        // ======================
        let audioBuffer = await fallbackToMp3Buffer(res.dl)

        // ======================
        // SEND AUDIO
        // ======================
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            ptt: false
        }, { quoted: m })

    } catch (e) {

        console.log(e)

        conn.reply(
            m.chat,
`
❌ Error Play Music

📌 ${e.message || e}

⚡ Powered by AW BOT
`.trim(),
            m
        )
    }
}

handler.help = ['play']
handler.tags = ['downloader']
handler.command = /^(play|music)$/i

module.exports = handler