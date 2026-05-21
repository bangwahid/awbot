const axios = require("axios");
const cheerio = require("cheerio");

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) {
        return m.reply(
`❌ Masukkan link TikTok

Contoh:
${usedPrefix + command} https://vt.tiktok.com/xxx`
        );
    }

    const url = text.trim();

    try {

        await conn.reply(m.chat,
`╭━━〔 TIKTOK V2 DOWNLOADER 〕━⬣
┃ ⏳ Sedang diproses...
┃ 📥 Mengambil data
╰━━━━━━━━━━━━━━⬣`, m);

        const baseRes = {
            author_skrep: "Wahid",
            kesayangan: "AW BOT"
        };

        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Origin": "https://ssstik.io",
            "Referer": "https://ssstik.io/en"
        };

        const { data: mainHtml, headers: resHeaders } = await axios.get("https://ssstik.io/en", { headers });

        headers.Cookie = resHeaders["set-cookie"]?.map(c => c.split(";")[0]).join("; ") || "";
        headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
        headers["Hx-Request"] = "true";
        headers["Hx-Target"] = "target";
        headers["Hx-Trigger"] = "_gcaptcha_pt";

        const $ = cheerio.load(mainHtml);

        const formPost = $("form").attr("hx-post") || "/abc?url=dl";
        const tt = $('input[name="tt"]').attr("value") || "";
        const ts = $('input[name="ts"]').attr("value") || "";

        const payload = new URLSearchParams({
            id: url,
            locale: "en",
            tt
        });

        if (ts) payload.append("ts", ts);

        const { data: postHtml } = await axios.post(
            `https://ssstik.io${formPost}`,
            payload.toString(),
            { headers }
        );

        const $$ = cheerio.load(postHtml);

        const title = $$("p.maintext").text().trim() || "-";
        const author = $$("h2").text().trim() || "-";
        const avatar = $$("img.result_author").attr("src") || "";

        let audio = $$("a.download_link.music").attr("href") || "";

        const isSlide = $$("ul.splide__list").length > 0;

        let caption =
`╭━━〔 TIKTOK V2 〕━⬣
┃ 👤 ${author}
┃ 📝 ${title}
╰━━━━━━━━━━━━━━⬣
⚡ Powered by AW BOT`;

        if (isSlide) {

            const images = $$(".splide__slide a.download_link")
                .map((_, el) => $$(el).attr("href"))
                .get()
                .filter(Boolean);

            if (!images.length) throw new Error("Slide tidak ditemukan");

            for (let i = 0; i < images.length; i++) {

                await conn.sendMessage(m.chat, {
                    image: { url: images[i] },
                    caption: i === 0 ? caption : ""
                }, { quoted: m });
            }

            if (audio) {
                await conn.sendMessage(m.chat, {
                    audio: { url: audio },
                    mimetype: "audio/mp4"
                }, { quoted: m });
            }

            return;
        }

        let video = $$("a.download_link.without_watermark").attr("href") || "";

        if (!video) {
            $$("a.download_link").each((_, el) => {
                const href = $$(el).attr("href");
                if (href && href.includes("http") && !video) {
                    video = href;
                }
            });
        }

        if (!video) throw new Error("Video tidak ditemukan");

        await conn.sendMessage(m.chat, {
            video: { url: video },
            caption
        }, { quoted: m });

        if (audio) {
            await conn.sendMessage(m.chat, {
                audio: { url: audio },
                mimetype: "audio/mp4"
            }, { quoted: m });
        }

    } catch (e) {
        console.log(e);

        m.reply(
`╭━━〔 ERROR TIKTOK V2 〕━⬣
┃ ❌ Gagal mengambil media
┃ 📌 ${e.message}
╰━━━━━━━━━━━━━━⬣`
        );
    }
};

handler.command = /^tiktokv2|tt2|ttv2$/i;
handler.help = ["tiktokv2 <url>"];
handler.tags = ["downloader"];

module.exports = handler;