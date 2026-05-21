const axios = require('axios')
const cheerio = require('cheerio')

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) {
        return conn.reply(
            m.chat,
            `Masukkan link Twitter/X\n\nContoh:\n${usedPrefix + command} https://x.com/xxxxx/status/xxxx`,
            m
        )
    }

    await conn.reply(m.chat, '⏳ Sedang mengambil media Twitter...', m)

    try {

        const payload = `q=${encodeURIComponent(text)}&lang=id&cftoken=`

        const { data } = await axios.post(
            'https://savetwitter.net/api/ajaxSearch',
            payload,
            {
                headers: {
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'x-requested-with': 'XMLHttpRequest',
                    'user-agent': 'Mozilla/5.0'
                }
            }
        )

        if (!data || data.status !== 'ok' || !data.data) {
            throw 'Gagal mengambil data'
        }

        const $ = cheerio.load(data.data)

        // caption
        let caption = $('h3').first().text().trim()
        if (!caption) caption = 'Tidak ada caption'

        let media = []

        // =========================
        // PARSER MEDIA
        // =========================
        $('a').each((i, el) => {

            let link = $(el).attr('href')
            let quality = $(el).text().trim()

            if (!link) return

            if (
                link.includes('dl.snapcdn.app') ||
                link.includes('.mp4') ||
                link.includes('.jpg') ||
                link.includes('.png')
            ) {

                let type = 'image'

                if (
                    quality.includes('MP4') ||
                    quality.includes('mp4') ||
                    quality.includes('HD') ||
                    link.includes('.mp4')
                ) {
                    type = 'video'
                }

                media.push({
                    type,
                    quality,
                    url: link
                })

            }

        })

        // hapus duplicate
        media = media.filter(
            (item, index, self) =>
                index === self.findIndex(v => v.url === item.url)
        )

        // =========================
        // AUTO PILIH KUALITAS VIDEO
        // PRIORITAS HD
        // =========================
        let videos = media.filter(v => v.type === 'video')
        let images = media.filter(v => v.type === 'image')

        let selectedVideo = null

        if (videos.length) {

            // cari HD dulu
            selectedVideo =
                videos.find(v =>
                    v.quality.toLowerCase().includes('hd')
                )

            // kalau tidak ada HD ambil pertama
            if (!selectedVideo) {
                selectedVideo = videos[0]
            }

        }

        let teks = `
╭─〔 TWITTER DOWNLOADER 〕─⬣
│
├ 📝 Caption :
│ ${caption}
│
├ 🎬 Video :
│ ${selectedVideo ? selectedVideo.quality : 'Tidak ada'}
│
├ 🖼️ Total Image :
│ ${images.length}
│
├ ⚡ Powered by AW BOT
│
╰──────────────⬣
`.trim()

        await conn.reply(m.chat, teks, m)

        // =========================
        // KIRIM VIDEO TERPILIH
        // =========================
        if (selectedVideo) {

            await conn.sendMessage(
                m.chat,
                {
                    video: { url: selectedVideo.url },
                    mimetype: 'video/mp4',
                    caption:
                        `🎬 ${selectedVideo.quality}\n⚡ Powered by AW BOT`
                },
                { quoted: m }
            )

        }

        // =========================
        // KIRIM IMAGE
        // =========================
        for (let img of images) {

            await conn.sendMessage(
                m.chat,
                {
                    image: { url: img.url },
                    caption: `🖼️ Image\n⚡ Powered by AW BOT`
                },
                { quoted: m }
            )

        }

        if (!selectedVideo && !images.length) {
            return conn.reply(
                m.chat,
                '❌ Media tidak ditemukan',
                m
            )
        }

    } catch (e) {

        console.log(e)

        conn.reply(
            m.chat,
            `
❌ Gagal mengambil media Twitter

📌 Kemungkinan:
- Link tidak valid
- Tweet private
- Server SaveTwitter berubah

⚡ Powered by AW BOT
            `.trim(),
            m
        )

    }

}

handler.help = ['twitter', 'tw']
handler.tags = ['downloader']
handler.command = /^(twitter|tw)$/i

handler.limit = true
handler.register = false

module.exports = handler

/*
Script by AW BOT - Wahid
*/