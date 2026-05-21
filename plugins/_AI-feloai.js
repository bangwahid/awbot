const axios = require('axios')

let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Masukkan pertanyaan\n\nContoh:\n${usedPrefix + command} siapa presiden indonesia`)
  }

  await m.reply('⏳ Sedang berpikir...')

  try {
    const gStr = n => Array.from({ length: n }, () =>
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      .charAt(Math.floor(Math.random() * 62))
    ).join('')

    const gHex = n => Array.from({ length: n }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')

    const searchUuid = gStr(21)
    const deviceId = gHex(32)

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Origin': 'https://felo.ai',
      'Referer': 'https://felo.ai/'
    }

    const { data: threadRes } = await axios.post(
      'https://felo.ai/api/search/threads',
      {
        query: text,
        search_uuid: searchUuid,
        lang: "",
        agent_lang: "id",
        search_options: {
          langcode: "id-ID"
        },
        search_video: true,
        query_from: "default",
        category: "social",
        model: "",
        auto_routing: true,
        mode: "concise",
        device_id: deviceId,
        source_message_rid: "",
        documents: [],
        thread_type: 1,
        document_action: "",
        slides_source: {
          type: "ask_question",
          files: {}
        },
        slide_template_uid: "",
        selected_resource_ids: [],
        process_id: searchUuid,
        stream_protocol: "message_center_v1",
        enable_task_state: true
      },
      { headers }
    )

    const streamKey = threadRes.stream_key

    if (!streamKey) {
      throw 'Gagal mendapatkan stream key'
    }

    const { data: streamText } = await axios.get(
      `https://felo.ai/api/message/v1/stream/${streamKey}?offset=0`,
      {
        headers: {
          ...headers,
          'Accept': 'text/event-stream'
        }
      }
    )

    let finalAnswer = ""

    const lines = streamText.split('\n')

    for (const line of lines) {
      if (line.startsWith('data:')) {
        try {
          const rawData = JSON.parse(line.substring(5).trim())

          if (rawData.content) {
            const contentData = JSON.parse(rawData.content)

            if (
              contentData.data &&
              contentData.data.type === 'answer'
            ) {
              finalAnswer += contentData.data.data.text
            }
          }
        } catch {}
      }
    }

    if (!finalAnswer) {
      throw 'Gagal parsing jawaban AI'
    }

    m.reply(`${finalAnswer.trim()}

> Powered By AW BOT`)

  } catch (e) {
    console.log(e)
    m.reply('Gagal mendapatkan jawaban AI')
  }
}

handler.help = ['felo']
handler.tags = ['ai']
handler.command = /^(felo|feloai|aifelo)$/i

module.exports = handler