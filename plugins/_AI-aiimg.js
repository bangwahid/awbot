const axios = require('axios')
const fs = require('fs')
const path = require('path')

async function generateImage(prompt) {
  try {
    const encodedPrompt =
      encodeURIComponent(prompt)

    const url =
      'https://image.pollinations.ai/prompt/' +
      encodedPrompt +
      '?width=1024&height=1024&seed=42&nologo=true'

    const fileName =
      'hasil_' + Date.now() + '.jpg'

    const filePath = path.join(
      process.cwd(),
      'tmp',
      fileName
    )

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })

    await new Promise((resolve, reject) => {
      const writer =
        fs.createWriteStream(filePath)

      response.data.pipe(writer)

      writer.on('finish', resolve)
      writer.on('error', reject)
    })

    return {
      status: true,
      prompt,
      file: fileName,
      path: filePath,
      url
    }

  } catch (e) {
    return {
      status: false,
      error: e.message
    }
  }
}

let handler = async (
  m,
  { conn, text, usedPrefix, command }
) => {

  if (!text) {
    throw `
Contoh:
${usedPrefix + command} anime girl cyberpunk
`
  }

  try {
    m.reply('🎨 Sedang membuat gambar...')

    const res = await generateImage(text)

    if (!res.status) {
      throw res.error
    }

    let caption = `
╭━━━〔 AI IMAGE GENERATOR 〕━━━⬣
│
│ ✨ Prompt :
│ ${text}
│
│ ✅ Status :
│ Success Generate
│
╰━━━━━━━━━━━━━━━━━━⬣
`.trim()

    await conn.sendMessage(
      m.chat,
      {
        image: fs.readFileSync(res.path),
        caption
      },
      { quoted: m }
    )

    // hapus file setelah dikirim
    fs.unlinkSync(res.path)

  } catch (e) {
    console.log(e)

    m.reply('❌ Gagal membuat gambar.')
  }
}

handler.help = ['aiimg']
handler.tags = ['ai']
handler.command = /^(aiimg|imgai|text2img)$/i

module.exports = handler