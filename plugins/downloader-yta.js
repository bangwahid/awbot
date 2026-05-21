const axios = require('axios')

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Masukkan link YouTube\n\nContoh:\n${usedPrefix + command} https://youtu.be/xxxx`)
  }

  try {
    m.reply('⏳ Sedang memproses audio...')

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      Referer: 'https://media.ytmp3.gg/'
    }

    const kualitas = {
      '64': '64kbps',
      '128': '128kbps',
      '192': '192kbps',
      '320': '320kbps'
    }

    const quality = kualitas['320'] || '320kbps'

    const ambilId = link => {
      const u = new URL(link)

      if (u.hostname.includes('youtu.be')) {
        return u.pathname.split('/').filter(Boolean)[0]
      }

      if (u.pathname.includes('/shorts/')) {
        return u.pathname.split('/shorts/')[1]?.split('/')[0]
      }

      return u.searchParams.get('v')
    }

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

    const videoId = ambilId(text)

    if (!videoId) {
      return m.reply('❌ Link YouTube tidak valid')
    }

    const cleanUrl = `https://youtube.com/watch?v=${videoId}`
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`

    // ambil info video
    const { data: info } = await axios.get(
      'https://www.youtube.com/oembed',
      {
        params: {
          url: watchUrl,
          format: 'json'
        },
        headers
      }
    )

    // request download
    const { data: download } = await axios.post(
      'https://ytdl.y2mp3.co/api/v2/download',
      {
        url: cleanUrl,
        output: {
          type: 'audio',
          format: 'mp3',
          quality
        }
      },
      { headers }
    )

    // cek proses
    let result = null

    for (let i = 0; i < 120; i++) {
      const { data } = await axios.get(download.statusUrl, {
        headers
      })

      if (data.status === 'completed' && data.downloadUrl) {
        result = data
        break
      }

      if (data.status === 'failed' || data.status === 'error') {
        throw data
      }

      await delay(5000)
    }

    if (!result) {
      return m.reply('❌ Timeout, server terlalu sibuk')
    }

    let caption = `
🎵 *YTMP3 DOWNLOADER*

📌 Title: ${info.title}
🎧 Quality: ${quality}
📥 Status: Success

⏳ Sedang mengirim audio...
`.trim()

    await conn.sendMessage(m.chat, {
      image: { url: info.thumbnail_url },
      caption
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      audio: { url: result.downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${info.title}.mp3`
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    m.reply('❌ Gagal mengunduh audio')
  }
}

handler.help = ['ytmp3']
handler.tags = ['downloader']
handler.command = /^(ytmp3|yta)$/i

module.exports = handler