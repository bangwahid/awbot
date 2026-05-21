const axios = require("axios")
const cheerio = require("cheerio")

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text)
        return conn.reply(
            m.chat,
`❌ Masukkan judul anime

Contoh:
${usedPrefix + command} one piece`,
            m
        )

    try {

        await conn.reply(
            m.chat,
            `🔎 Sedang mencari anime *${text}*...`,
            m
        )

        let { result } = await seriesSearch(text)

        // =========================
        // NO RESULT
        // =========================
        if (!result || result.length < 1) {

            return conn.reply(
                m.chat,
`
╭──〔 ❌ ANIME TIDAK DITEMUKAN 〕
│ Series belum tersedia di web
│
│ 📩 Silahkan request ke admin
╰────────────────────⬣
`.trim(),
                m
            )
        }

        // =========================
        // HEADER
        // =========================
        let caption =
`
╭──〔 📺 ANIME SEARCH 〕
│ 🔎 Query : ${text}
╰────────────────────⬣
`.trim()

        // =========================
        // RESULT
        // =========================
        for (let i = 0; i < result.length; i++) {

            let v = result[i]

            caption += `

╭─❍ ${i + 1}. ${v.title}
│ 🎭 Genre : ${v.genre}
│ 📺 Episode : ${v.episode}
│ 🌍 Country : ${v.country}
│ 👥 Cast : ${v.actor}
│ 📡 Network : ${v.network}
│ 🔗 Link :
│ ${v.link}
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
❌ Error Anime Search

📌 ${e.message || e}

⚡ Powered by AW BOT
`.trim(),
            m
        )
    }
}

handler.help = ['anime']
handler.tags = ['internet']
handler.command = /^(anime)$/i

module.exports = handler

// =========================
// SCRAPER
// =========================
async function seriesSearch(query) {

    try {

        let { data } = await axios.get(
            'https://anime.ruangmoviez.my.id/?s=' +
            encodeURIComponent(query)
        )

        let $ = cheerio.load(data)

        let series = []

        let items =
            $('article.item-infinite')
            .slice(0, 10)

        for (let el of items) {

            // =========================
            // BASIC
            // =========================
            let title =
                $(el)
                .find('h2.entry-title a')
                .text()
                .trim()

            let link =
                $(el)
                .find('a[itemprop="url"]')
                .attr('href')

            let genre =
                $(el)
                .find('a[rel="category tag"]')
                .map((i, e) => $(e).text())
                .get()
                .join(', ') || '-'

            // =========================
            // DEFAULT DETAIL
            // =========================
            let episode = '-'
            let country = '-'
            let actor = '-'
            let network = '-'

            // =========================
            // DETAIL SCRAPE
            // =========================
            try {

                let detail =
                    await axios.get(link)

                let $$ =
                    cheerio.load(detail.data)

                // EPISODE
                episode =
                    $$('div.gmr-moviedata')
                    .filter((i, el) =>
                        $$(el)
                        .find('strong')
                        .text()
                        .includes('Number Of Episode')
                    )
                    .text()
                    .replace('Number Of Episode:', '')
                    .trim() || '-'

                // COUNTRY
                country =
                    $$('span[itemprop="contentLocation"] a')
                    .first()
                    .text()
                    .trim() || '-'

                // ACTOR
                actor =
                    $$('span[itemprop="actors"] a')
                    .slice(0, 3)
                    .map((i, e) =>
                        $$(e).text().trim()
                    )
                    .get()
                    .join(', ') || '-'

                // NETWORK
                network =
                    $$('div.gmr-moviedata')
                    .filter((i, el) =>
                        $$(el)
                        .find('strong')
                        .text()
                        .includes('Network')
                    )
                    .find('a')
                    .first()
                    .text()
                    .trim() || '-'

            } catch (e) {
                console.log(
                    'Detail scrape error:',
                    e.message
                )
            }

            series.push({
                title,
                link,
                genre,
                episode,
                country,
                actor,
                network
            })
        }

        return {
            status: 200,
            result: series
        }

    } catch (e) {

        return {
            status: 404,
            msg: e.message,
            result: []
        }
    }
}