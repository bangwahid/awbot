const axios = require("axios");
const cheerio = require("cheerio");

/**
 * 🎬 MOVIES COUNTDOWN COMMAND (.msc)
 * ⚡ Powered by AW BOT
 * 👤 Base: JH a.k.a Dhika - Fiony Bot
 */

function formatTime(secStr) {
    if (!secStr) return "Tinggal rilis / cek web";
    const sec = parseInt(secStr, 10);
    if (sec < 0) return "✔ Released";

    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);

    return `${d} Hari ${h} Jam ${m} Menit`;
}

function fixUrl(u) {
    if (!u) return "-";
    if (u.startsWith("//")) return "https:" + u;
    if (u.startsWith("/")) return "https://moviescountdown.com" + u;
    return u;
}

// =========================
// SCRAPER HOME
// =========================
async function getHome(limit = 10) {

    const { data } = await axios.get("https://moviescountdown.com/");
    const $ = cheerio.load(data);

    const result = [];

    $("a.countdown-content-main-columns-column-items-item").each((i, el) => {

        const title = $(el).find("img").attr("alt");
        const link = $(el).attr("href");
        const thumb = $(el).find("img").attr("src");
        const time = $(el).find(".countdown").attr("data-time");
        const hot = $(el).attr("data-hot-percentage") || "0";

        if (title && link) {
            result.push({
                title,
                url: fixUrl(link),
                thumb: fixUrl(thumb),
                hot: hot + "%",
                countdown: formatTime(time)
            });
        }
    });

    return result.slice(0, limit);
}

// =========================
// MAIN HANDLER
// =========================
let handler = async (m, { conn, text, usedPrefix, command }) => {

    try {

        const query = text?.trim();

        // =========================
        // HOME MODE
        // =========================
        if (!query) {

            const movies = await getHome(10);

            let caption =
`🎬 *MOVIES COUNTDOWN*

📌 Command: ${usedPrefix + command} <nama film>

`;

            movies.forEach((v, i) => {
                caption +=
`──────────────────
${i + 1}. ${v.title}
🔥 Hot: ${v.hot}
⏳ ${v.countdown}
🔗 ${v.url}

`;
            });

            caption += `⚡ Powered by AW BOT`;

            return m.reply(caption);
        }

        // =========================
        // SEARCH MODE
        // =========================
        const url = `https://moviescountdown.com/search?q=${encodeURIComponent(query)}`;

        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const results = [];

        $("a.countdown-content-trending-item").each((i, el) => {

            const title = $(el).find("img").attr("alt");
            const link = $(el).attr("href");
            const thumb = $(el).attr("data-poster");
            const time = $(el).find(".countdown").attr("data-time");

            if (title && link) {
                results.push({
                    title,
                    url: fixUrl(link),
                    thumb: fixUrl(thumb),
                    countdown: formatTime(time)
                });
            }
        });

        if (!results.length) {
            return m.reply("❌ Film tidak ditemukan");
        }

        let caption =
`🔎 *MOVIES SEARCH*

📌 Query: ${query}

`;

        results.slice(0, 10).forEach((v, i) => {
            caption +=
`──────────────────
${i + 1}. ${v.title}
⏳ ${v.countdown}
🔗 ${v.url}

`;
        });

        caption += `⚡ Powered by AW BOT`;

        return m.reply(caption);

    } catch (e) {
        console.log(e);
        return m.reply(
`❌ Error MSC

📌 ${e.message}

⚡ Powered by AW BOT`
        );
    }
};

handler.help = ["msc <query>"];
handler.tags = ["internet"];
handler.command = /^msc$/i;

module.exports = handler;