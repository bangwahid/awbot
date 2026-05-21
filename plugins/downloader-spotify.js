const axios = require('axios');

/**
 * ======>> AW BOT SPOTIFY DOWNLOADER <<======
 * Scrape By: Bobby Ajah
 * UI by: AW BOT
 */

async function getTrackData(url) {
  try {
    const res = await axios.get('https://spotmate.online/en1', {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36'
      }
    });

    const csrf = res.data.match(/csrf-token"\s+content="([^"]+)"/)?.[1];
    const cookies = res.headers['set-cookie']
      ?.map(v => v.split(';')[0])
      .join('; ');

    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrf,
      Cookie: cookies,
      Referer: 'https://spotmate.online/en1',
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36'
    };

    const { data } = await axios.post(
      'https://spotmate.online/getTrackData',
      { spotify_url: url },
      { headers }
    );

    const response_dl = await axios.post(
      'https://spotmate.online/convert',
      { urls: data.external_urls.spotify },
      { headers }
    );

    data.url_data = response_dl.data;

    return data;
  } catch (err) {
    return {
      status: false,
      message: err.response?.data || err.message
    };
  }
}

// ===== HANDLER =====
let handler = async (m, { conn, text, command }) => {
  const cmd = command.toLowerCase();

  if (!['spotify', 'spotifydl', 'dlspotify'].includes(cmd)) return;

  if (!text) {
    return m.reply(
`🎧 *AW BOT SPOTIFY DOWNLOADER*

Kirim link Spotify track!

Contoh:
.spotify https://open.spotify.com/track/...`
    );
  }

  if (!text.includes('open.spotify.com')) {
    return m.reply('❌ URL tidak valid! gunakan link Spotify track.');
  }

  m.reply('⏳ AW BOT sedang memproses Spotify...');

  const result = await getTrackData(text);

  if (!result || result.status === false) {
    return m.reply('❌ Gagal mengambil data dari Spotify.');
  }

  // ===== CAPTION BARU (AW BOT STYLE) =====
  let caption =
`╭━━━〔 🎧 AW BOT SPOTIFY 〕━━━⬣\n` +
`┃\n` +
`┃ 🎵 Title  : ${result.name || '-'}\n` +
`┃ 🎤 Artist : ${result.artists?.map(a => a.name).join(', ') || '-'}\n` +
`┃ 💽 Album  : ${result.album?.name || '-'}\n` +
`┃ 🔗 Link   : ${result.external_urls?.spotify || '-'}\n` +
`┃\n` +
`┣━━━〔 STATUS 〕━━━⬣\n` +
`┃ ⚡ Processed by AW BOT\n` +
`┃ 🎶 Spotify Downloader\n` +
`┃\n` +
`╰━━━━━━━━━━━━━━━━━━⬣`;

  await m.reply(caption);

  const audioUrl =
    result?.url_data?.download_url ||
    result?.url_data?.url ||
    null;

  if (!audioUrl) {
    return m.reply('❌ Link download tidak ditemukan.');
  }

  await conn.sendMessage(
    m.chat,
    {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${result.name || 'spotify'}.mp3`
    },
    { quoted: m }
  );
};

// ===== META =====
handler.help = ['spotify', 'spotifydl', 'dlspotify'];
handler.tags = ['downloader'];
handler.command = /^(spotify|spotifydl|dlspotify)$/i;

module.exports = handler;
module.exports.getTrackData = getTrackData;