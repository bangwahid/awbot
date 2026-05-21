const fetch = require("node-fetch");
const fs = require("fs");
const { exec } = require("child_process");

//========================
// CONFIG
//========================
const BASE = "https://hentaigifz.com";
const CDN = "https://cdn.hentaigifz.com";  // optional

//========================
// UTIL
//========================
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

//========================
// FETCH HTML
//========================
async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Android 10; Mobile)",
      "Accept": "text/html"
    }
  });

  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.text();
}

//========================
// EXTRACT SLUGS
//========================
function extractSlugs(html) {
  const slugs = [];
  const regex = /<a[^>]*href="https?:\/\/[^/]+\/([^/]+)\/"/gi;

  let m;
  while ((m = regex.exec(html)) !== null) {
    slugs.push(m[1]);
  }

  return [...new Set(slugs)];
}

//========================
// CLEAN MEDIA
//========================
function cleanMedia(url) {
  if (!url) return null;

  const bad = ["logo", "icon", "thumb", "placeholder"];
  if (bad.some(v => url.includes(v))) return null;

  return url;
}

//========================
// GET POST
//========================
async function getPost(slug) {
  try {
    const html = await fetchHTML(`${BASE}/${slug}/`);

    const title =
      html.match(/<meta property="og:title" content="([^"]+)"/i)?.[1] ||
      slug;

    let media =
      html.match(/https?:\/\/[^"']+\.gif/gi)?.[0] ||
      html.match(/https?:\/\/[^"']+\.mp4/gi)?.[0] ||
      html.match(/data-src="([^"]+)"/i)?.[1] ||
      html.match(/<img[^>]*src="([^"]+)"/i)?.[1] ||
      null;

    media = cleanMedia(media);

    if (!media && CDN) {
      media = `${CDN}/${slug}.gif`;
    }

    return { title, slug, media, url: `${BASE}/${slug}/` };

  } catch {
    return null;
  }
}

//========================
// SCRAPER
//========================
async function scrape(query, page = 1, limit = 5) {
  const url = `${BASE}/page/${page}/?s=${encodeURIComponent(query)}`;

  const html = await fetchHTML(url);
  const slugs = extractSlugs(html).slice(0, limit);

  const results = [];

  for (let s of slugs) {
    const data = await getPost(s);
    if (data) results.push(data);
    await sleep(500);
  }

  return results;
}

//========================
// DOWNLOAD FILE
//========================
async function download(url, path) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(path, Buffer.from(buffer));
}

//========================
// 🔥 STABLE GIF → STICKER (NO CRASH VERSION)
//========================
function toSticker(input, output) {
  return new Promise((resolve, reject) => {
    const cmd = `
ffmpeg -y -i "${input}" \
-vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2" \
-t 6 -r 15 -an -vcodec libwebp -lossless 0 -qscale 50 "${output}"
`.trim();

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.log("FFMPEG ERROR:", stderr || err.message);
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

//========================
// SEND STICKER
//========================
async function sendSticker(conn, m, url) {
  const input = "./temp.gif";
  const output = "./temp.webp";

  try {
    await download(url, input);
    await toSticker(input, output);

    await conn.sendMessage(m.chat, {
      sticker: fs.readFileSync(output)
    }, { quoted: m });

  } catch (e) {
    console.log(e);
    m.reply("❌ Gagal convert sticker");
  } finally {
    try { fs.unlinkSync(input); } catch {}
    try { fs.unlinkSync(output); } catch {}
  }
}

//========================
// HANDLER
//========================
let handler = async (m, { conn, text, usedPrefix }) => {

  if (!text) {
    return m.reply(
`❌ Masukkan query
Contoh:
${usedPrefix}scrape anime`
    );
  }

  try {

    m.reply("🔎 Mengambil data...");

    const data = await scrape(text, 1, 5);

    if (!data.length) {
      return m.reply("❌ Tidak ditemukan");
    }

    // LIST
    let msg = `📦 HASIL PENCARIAN\n\n`;

    data.forEach((v, i) => {
      msg += `🔹 ${i + 1}. ${v.title}\n`;
      msg += `🔗 ${v.url}\n\n`;
    });

    await m.reply(msg);

    // STICKER SEND
    for (let d of data) {
      if (d.media) {
        await sendSticker(conn, m, d.media);
        await sleep(1200);
      }
    }

  } catch (e) {
    console.log(e);
    m.reply("❌ Error scraping / convert gagal");
  }
};

handler.help = ["hentai <query>"];
handler.tags = ["internet"];
handler.command = ["hentai", "hentaigifz"];

module.exports = handler;