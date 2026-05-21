const axios = require('axios')

let handler = async (m, { conn }) => {
  await m.reply('⏳ Sedang mengambil data gempa terbaru...')

  try {
    const { data } = await axios.get('https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json')

    const g = data.Infogempa.gempa

    let caption = `
🌍 *GEMPA TERBARU BMKG*

📅 Tanggal : ${g.Tanggal}
🕒 Jam : ${g.Jam}
📍 Wilayah : ${g.Wilayah}

📌 Koordinat : ${g.Coordinates}
🧭 Lintang : ${g.Lintang}
🧭 Bujur : ${g.Bujur}

📊 Magnitude : ${g.Magnitude}
🌊 Kedalaman : ${g.Kedalaman}

⚠️ Potensi : ${g.Potensi}
🏠 Dirasakan : ${g.Dirasakan || '-'}

> Powered By AW BOT
`.trim()

    const shakemap = `https://data.bmkg.go.id/DataMKG/TEWS/${g.Shakemap}`

    await conn.sendMessage(m.chat, {
      image: { url: shakemap },
      caption
    }, { quoted: m })

  } catch (e) {
    console.log(e)
    m.reply('Gagal mengambil data gempa BMKG')
  }
}

handler.help = ['gempa']
handler.tags = ['tools']
handler.command = /^(bmkg|gempa|infogempa)$/i

module.exports = handler