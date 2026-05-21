let axios = require('axios')
let FormData = require('form-data')

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text)
        return conn.reply(
            m.chat,
            `
╭─〔 TERABOX DOWNLOADER 〕─⬣
│
├ ❌ Masukkan URL Terabox
│
├ Contoh:
├ ${usedPrefix + command} https://terabox.com/s/xxxx
│
├ ⚡ Powered by AW BOT
╰──────────────⬣
            `.trim(),
            m
        )

    const baseRes = {
        author_skrep: 'Wahid',
        powered: 'AW BOT'
    }

    const target = text.trim()

    const headers = {
        'Accept': '*/*',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
        'Origin': 'https://1024teradownloader.com',
        'Referer': 'https://1024teradownloader.com/fastdownload',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Mobile Safari'
    }

    const getCookie = (h) =>
        (h['set-cookie'] || [])
            .map(v => String(v).split(';')[0])
            .join('; ')

    const requestDownload = async (cookie = '') => {
        let form = new FormData()
        form.append('url', target)

        let res = await axios.post(
            'https://1024teradownloader.com/api/download',
            form,
            {
                headers: {
                    ...headers,
                    ...form.getHeaders(),
                    ...(cookie ? { cookie } : {})
                },
                timeout: 60000
            }
        )

        return res.data
    }

    try {

        await conn.reply(m.chat, '⏳ Sedang mengambil data Terabox...', m)

        let home = await axios.get(
            'https://1024teradownloader.com/fastdownload',
            { headers }
        )

        let cookie = getCookie(home.headers)

        let data = await requestDownload(cookie)

        const setToken = async (key) => {
            if (data?.error_detail?.match(/missing cookie/i) && data?.new_api_token) {
                cookie += `; ${key}=${data.new_api_token}`
                data = await requestDownload(cookie)
            }
        }

        await setToken('api_token')
        await setToken('token')

        if (!data || data.status !== 'success' || !data.list?.length) {
            return conn.reply(
                m.chat,
                '❌ Gagal mengambil data / link tidak valid.',
                m
            )
        }

        let hasil = data.list.map((v) => {
            return `
📦 File : ${v.name}
📏 Size : ${v.size_formatted}
⚙️ Type : ${v.type}

🔗 Fast 1 : ${v.zip_dlink || v.normal_dlink}
🔗 Fast 2 : ${v.normal_dlink}
`.trim()
        }).join('\n\n──────────────────\n\n')

        await conn.reply(
            m.chat,
            `
╭─〔 TERABOX RESULT 〕─⬣
│
├ 📦 Total File : ${data.total_files}
│
${hasil}
│
├ ⚡ Powered by AW BOT
╰──────────────⬣
            `.trim(),
            m
        )

    } catch (e) {

        conn.reply(
            m.chat,
            `
❌ Terjadi kesalahan

📌 ${e.message || e}

⚡ Powered by AW BOT
            `.trim(),
            m
        )
    }
}

handler.help = ['terabox', 'tera']
handler.tags = ['downloader']
handler.command = /^(terabox|tera)$/i

module.exports = handler