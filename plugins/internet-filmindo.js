const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '../lib/json/filmindo.json')

// =========================
// CREATE FILE
// =========================
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2))
}

// =========================
// LOAD DATA
// =========================
const loadFilm = () => {
    return JSON.parse(fs.readFileSync(filePath))
}

// =========================
// SAVE DATA
// =========================
const saveFilm = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn, command, text, isOwner }) => {

    let films = loadFilm()

    // ==================================================
    // ADD FILM
    // ==================================================
    if (command === 'addfilmindo') {

        if (!isOwner)
            return conn.reply(
                m.chat,
                '❌',
                m
            )

        if (!text)
            return conn.reply(
                m.chat,
                `
Masukkan judul film

Contoh:
.addfilmindo Judul
                `.trim(),
                m
            )

        let title = text.trim()

        let exists = films.find(v =>
            v.toLowerCase() === title.toLowerCase()
        )

        if (exists)
            return conn.reply(
                m.chat,
                '⚠️ Film sudah ada di database.',
                m
            )

        films.push(title)

        saveFilm(films)

        return conn.reply(
            m.chat,
            `
╭─〔 ADD FILM INDO 〕─⬣
│
├ 🎬 Film berhasil ditambahkan
├ 📌 ${title}
│
├ 📦 Total Film : ${films.length}
├ ⚡ Powered by AW BOT
╰──────────────⬣
            `.trim(),
            m
        )
    }

    // ==================================================
    // DELETE FILM
    // ==================================================
    if (command === 'delfilmindo') {

        if (!isOwner)
            return conn.reply(
                m.chat,
                '❌',
                m
            )

        if (!text)
            return conn.reply(
                m.chat,
                `
Masukkan nomor film

Contoh:
.delfilmindo Nomor
                `.trim(),
                m
            )

        let number = parseInt(text)

        if (isNaN(number))
            return conn.reply(
                m.chat,
                '❌ Nomor film tidak valid.',
                m
            )

        let index = number - 1

        if (!films[index])
            return conn.reply(
                m.chat,
                '❌ Film tidak ditemukan.',
                m
            )

        let deleted = films[index]

        films.splice(index, 1)

        saveFilm(films)

        return conn.reply(
            m.chat,
            `
╭─〔 DELETE FILM INDO 〕─⬣
│
├ 🗑️ Film berhasil dihapus
├ 📌 ${deleted}
│
├ 📦 Sisa Film : ${films.length}
├ ⚡ Powered by AW BOT
╰──────────────⬣
            `.trim(),
            m
        )
    }

    // ==================================================
    // EDIT FILM
    // ==================================================
    if (command === 'editfilmindo') {

        if (!isOwner)
            return conn.reply(
                m.chat,
                '❌',
                m
            )

        if (!text)
            return conn.reply(
                m.chat,
                `
Format salah

Contoh:
.editfilmindo Nomor Judul
                `.trim(),
                m
            )

        let args = text.split(' ')

        let number = parseInt(args.shift())

        let newTitle = args.join(' ').trim()

        if (isNaN(number))
            return conn.reply(
                m.chat,
                '❌ Nomor film tidak valid.',
                m
            )

        if (!newTitle)
            return conn.reply(
                m.chat,
                '❌ Judul baru tidak boleh kosong.',
                m
            )

        let index = number - 1

        if (!films[index])
            return conn.reply(
                m.chat,
                '❌ Film tidak ditemukan.',
                m
            )

        let oldTitle = films[index]

        films[index] = newTitle

        saveFilm(films)

        return conn.reply(
            m.chat,
            `
╭─〔 EDIT FILM INDO 〕─⬣
│
├ ✏️ Film berhasil diedit
│
├ 📌 Sebelum :
├ ${oldTitle}
│
├ 📌 Sesudah :
├ ${newTitle}
│
├ ⚡ Powered by AW BOT
╰──────────────⬣
            `.trim(),
            m
        )
    }

    // ==================================================
    // SEARCH FILM
    // ==================================================
    if (command === 'filmindo') {

        if (!text)
            return conn.reply(
                m.chat,
                `
Masukkan judul film

Contoh:
.filmindo Kemerdekaan
                `.trim(),
                m
            )

        let query = text.toLowerCase()

        let result = films.filter(v =>
            v.toLowerCase().includes(query)
        )

        if (result.length < 1) {

            return conn.reply(
                m.chat,
                `
╭─〔 FILM INDO 〕─⬣
│
├ ❌ Film belum tersedia di database
│
╰──────────────⬣
                `.trim(),
                m
            )

        }

        let teks = result.map((v, i) =>
            `├ ${i + 1}. ${v}`
        ).join('\n')

        return conn.reply(
            m.chat,
            `
╭─〔 LIST FILM INDO 〕─⬣
│
${teks}
│
╰──────────────⬣
            `.trim(),
            m
        )
    }

    // ==================================================
    // LIST ALL FILM
    // ==================================================
    if (command === 'listfilmindo') {

        if (!isOwner)
            return conn.reply(
                m.chat,
                '❌',
                m
            )

        if (films.length < 1) {

            return conn.reply(
                m.chat,
                `
╭─〔 LIST FILM INDO 〕─⬣
│
├ ❌ Database film masih kosong
│
├ ⚡ Powered by AW BOT
╰──────────────⬣
                `.trim(),
                m
            )

        }

        let teks = films.map((v, i) =>
            `├ ${i + 1}. ${v}`
        ).join('\n')

        return conn.reply(
            m.chat,
            `
╭─〔 DATABASE FILM INDO 〕─⬣
│
${teks}
│
├ 📦 Total Film : ${films.length}
├ ⚡ Powered by AW BOT
╰──────────────⬣
            `.trim(),
            m
        )
    }

}

handler.help = [
    'filmindo',
    'addfilmindo',
    'delfilmindo',
    'editfilmindo',
    'listfilmindo'
]

handler.tags = ['internet']

handler.command = /^(filmindo|addfilmindo|delfilmindo|editfilmindo|listfilmindo)$/i

module.exports = handler

/*
Script by AW BOT - Wahid
*/