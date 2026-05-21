let axios = require('axios')

const API_KEY = '5853f60abcde67ec5609fd932f7a7768'

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) {
        return conn.reply(
            m.chat,
`❌ Masukkan judul film / series

Contoh:
${usedPrefix + command} avengers
${usedPrefix + command} squid game`,
            m
        )
    }

    try {

        // =========================
        // SEARCH
        // =========================
        const searchUrl =
`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(text)}&language=id-ID`

        const search =
            await axios.get(searchUrl)

        const results =
            search.data.results
            .filter(v =>
                v.media_type === 'movie' ||
                v.media_type === 'tv'
            )
            .slice(0, 10)

        if (!results.length) {
            return conn.reply(
                m.chat,
                '❌ Film / Series tidak ditemukan',
                m
            )
        }

        let caption =
`╭──〔 🎬 TMDB SEARCH 〕
│ 🔎 Query : ${text}
╰────────────────────⬣
`

        // =========================
        // LOOP RESULTS
        // =========================
        for (let i = 0; i < results.length; i++) {

            const item = results[i]

            const mediaType = item.media_type
            const id = item.id

            // =========================
            // DETAIL
            // =========================
            const detailUrl =
`https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${API_KEY}&language=id-ID&append_to_response=credits`

            const detail =
                await axios.get(detailUrl)

            const data = detail.data

            const title =
                data.title || data.name || '-'

            const release =
                data.release_date ||
                data.first_air_date ||
                '-'

            const rating =
                data.vote_average
                ? data.vote_average.toFixed(1)
                : '0'

            const status =
                data.status || '-'

            const genres =
                data.genres?.map(v => v.name)
                .slice(0, 3)
                .join(', ')
                || '-'

            const cast =
                data.credits?.cast
                ?.slice(0, 3)
                .map(v => v.name)
                .join(', ')
                || '-'

            const overview =
                data.overview
                ? data.overview.slice(0, 250)
                : 'Tidak ada sinopsis.'

            let duration = '-'

            if (
                mediaType === 'movie' &&
                data.runtime
            ) {
                duration = `${data.runtime} menit`
            }

            if (
                mediaType === 'tv' &&
                data.episode_run_time?.length
            ) {
                duration =
`${data.episode_run_time[0]} menit/episode`
            }

            const poster =
                data.poster_path
                ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
                : '-'

            const tmdbLink =
                `https://www.themoviedb.org/${mediaType}/${id}`

            caption += `
╭─❍ ${i + 1}. ${title}
│ 🎞️ Tipe : ${mediaType.toUpperCase()}
│ 📅 Rilis : ${release}
│ ⭐ Rating : ${rating}
│ 📡 Status : ${status}
│ ⏳ Durasi : ${duration}
│ 🎭 Genre : ${genres}
│ 👥 Cast : ${cast}
`

            // =========================
            // TV INFO
            // =========================
            if (mediaType === 'tv') {

                caption +=
`│ 📺 Season : ${data.number_of_seasons || 0}
│ 🎬 Episode : ${data.number_of_episodes || 0}
`
            }

            caption +=
`│ 📝 Sinopsis :
│ ${overview}
│
│ 🔗 TMDB :
│ ${tmdbLink}
│
│ 🖼️ Poster :
│ ${poster}
╰────────────────────⬣
`
        }

        // =========================
        // SEND
        // =========================
        await conn.reply(
            m.chat,
            caption.trim(),
            m
        )

    } catch (e) {

        console.log(e)

        conn.reply(
            m.chat,
`
❌ Error TMDB

📌 ${e.message || e}

⚡ Powered by AW BOT
`.trim(),
            m
        )
    }
}

handler.help = ['tmdb']
handler.tags = ['internet']
handler.command = /^(tmdb)$/i

module.exports = handler