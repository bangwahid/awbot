let axios = require('axios')

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) {
        return conn.reply(
            m.chat,
            `❌ Masukkan judul lagu / link Apple Music

Contoh:
${usedPrefix + command} faded
${usedPrefix + command} https://music.apple.com/...`,
            m
        )
    }

    try {

        // =========================
        // SEARCH MODE
        // =========================
        if (!/^https?:\/\//i.test(text)) {

            let search =
                await axios.get(
`https://itunes.apple.com/search?term=${encodeURIComponent(text)}&entity=song&limit=10&country=id`
                )

            let results = search.data.results

            if (!results.length)
                return conn.reply(
                    m.chat,
                    '❌ Lagu tidak ditemukan',
                    m
                )

            let caption =
`╭──〔 🍎 APPLE MUSIC SEARCH 〕──⬣\n`

            for (let i = 0; i < results.length; i++) {

                let v = results[i]

                let slug =
                    v.trackViewUrl
                    ? (
                        v.trackViewUrl.match(/album\/([^/]+)/)?.[1]
                        || 'song'
                    )
                    : 'song'

                let clean =
                    v.trackId
                    ? `https://music.apple.com/id/song/${slug}/${v.trackId}`
                    : v.trackViewUrl

                caption += `
│ ${i + 1}. ${v.trackName}
│ 👤 ${v.artistName}
│ 💿 ${v.collectionName}
│ 🔗 ${clean}
│
`
            }

            caption += `╰────────────────────⬣`

            return conn.sendMessage(
                m.chat,
                {
                    image: {
                        url:
results[0].artworkUrl100
.replace('100x100bb', '1000x1000bb')
                    },
                    caption
                },
                { quoted: m }
            )
        }

        // =========================
        // DOWNLOAD MODE
        // =========================
        await conn.reply(
            m.chat,
            '⏳ Sedang mengambil audio Apple Music...',
            m
        )

        const headers = {
            'Accept':
'application/json, text/javascript, */*; q=0.01',
            'Origin':
'https://aaplmusicdownloader.com',
            'Referer':
'https://aaplmusicdownloader.com/',
            'User-Agent':
'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'X-Requested-With':
'XMLHttpRequest',
            'Content-Type':
'application/x-www-form-urlencoded; charset=UTF-8'
        }

        // =========================
        // GET COOKIE
        // =========================
        const home =
            await axios.get(
                'https://aaplmusicdownloader.com/',
                {
                    headers: {
                        ...headers,
                        Accept: 'text/html,*/*'
                    },
                    validateStatus: () => true
                }
            )

        const cookies =
            (home.headers['set-cookie'] || [])
            .map(v => v.split(';')[0])
            .join('; ')

        headers.Cookie =
`${cookies}; quality=320; rank=1; dcount=1`

        // =========================
        // GET META
        // =========================
        const metaReq =
            await axios.get(
`https://aaplmusicdownloader.com/api/song_url.php?url=${encodeURIComponent(text)}`,
                {
                    headers,
                    validateStatus: () => true
                }
            )

        let meta = metaReq.data

        if (typeof meta === 'string') {
            try {
                meta = JSON.parse(meta)
            } catch {}
        }

        let title =
            (meta.name || '')
            .replace(/&amp;/g, '&')
            .replace(/['"]/g, '')

        let artist =
            (meta.artist || '')
            .replace(/&amp;/g, '&')
            .replace(/['"]/g, '')

        let album = meta.albumname || '-'
        let thumb = meta.thumb || ''
        let token = meta.token || 'none'

        if (!title)
            return conn.reply(
                m.chat,
                '❌ Lagu tidak ditemukan',
                m
            )

        let dlink = null

        // =========================
        // SERVER 1
        // =========================
        try {

            const body =
                new URLSearchParams({
                    song_name: title,
                    artist_name: artist,
                    url: text,
                    token,
                    zip_download: 'false',
                    quality: '320'
                }).toString()

            const req =
                await axios.post(
                    'https://aaplmusicdownloader.com/api/composer/swd.php',
                    body,
                    {
                        headers,
                        timeout: 60000,
                        validateStatus: () => true
                    }
                )

            if (req.data?.dlink)
                dlink = req.data.dlink

        } catch {}

        // =========================
        // FALLBACK YOUTUBE
        // =========================
        if (!dlink) {

            try {

                const yt =
                    await axios.get(
`https://aaplmusicdownloader.com/api/composer/ytsearch/mytsearch.php?name=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&link=${encodeURIComponent(text)}`,
                        {
                            headers,
                            validateStatus: () => true
                        }
                    )

                const vid = yt.data?.videoid

                if (vid) {

                    for (let i = 0; i < 5; i++) {

                        const rapid =
                            await axios.get(
`https://aaplmusicdownloader.com/api/rapidmp3.php?q=${vid}&url=${encodeURIComponent(text)}&name=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}`,
                                {
                                    headers,
                                    timeout: 60000,
                                    validateStatus: () => true
                                }
                            )

                        if (rapid.data?.status === 'ok') {

                            const conv =
                                await axios.post(
                                    'https://aaplmusicdownloader.com/api/convertRapidAPI.php',
                                    `url=${encodeURIComponent(rapid.data.link)}`,
                                    {
                                        headers,
                                        timeout: 60000,
                                        validateStatus: () => true
                                    }
                                )

                            if (conv.data?.dlink) {
                                dlink = conv.data.dlink
                                break
                            }
                        }

                        if (rapid.data?.status === 'processing')
                            await new Promise(r => setTimeout(r, 3000))
                    }
                }

            } catch {}
        }

        if (!dlink)
            return conn.reply(
                m.chat,
`
❌ Audio gagal didapatkan

📌 Server Apple Music sedang limit / error

⚡ Powered by AW BOT
`.trim(),
                m
            )

        // =========================
        // SEND AUDIO
        // =========================
        await conn.sendMessage(
            m.chat,
            {
                audio: { url: dlink },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                ptt: false,
                contextInfo: {
                    externalAdReply: {
                        title,
                        body: artist,
                        thumbnailUrl: thumb,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        sourceUrl: text
                    }
                }
            },
            { quoted: m }
        )

    } catch (e) {

        console.log(e)

        conn.reply(
            m.chat,
`
❌ Error Apple Music

📌 ${e.message || e}

⚡ Powered by AW BOT
`.trim(),
            m
        )
    }
}

handler.help = ['applemusic']
handler.tags = ['downloader']
handler.command = /^(applemusic|apmus)$/i

module.exports = handler