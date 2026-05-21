const similarity = require('similarity')
const threshold = 0.72

let rewardAmount = 1000

module.exports = {
    async before(m) {

        this.family = this.family ? this.family : {}

        let id = m.chat
        if (!(id in this.family)) return true

        let room = this.family[id]
        if (!room || !room.jawaban) {
            delete this.family[id]
            return true
        }

        let text = (m.text || '')
            .toLowerCase()
            .replace(/[^\w\s\-]+/g, '')
            .trim()

        if (!text) return true

        // =========================
        // 🏳️ NYERAH
        // =========================
        if (text === 'nyerah') {

            let allAnswers = room.jawaban
                .map((jawaban, i) => `(${i + 1}) ${jawaban}`)
                .join('\n')

            this.reply(m.chat, `
🏳️ *GAME BERAKHIR*
━━━━━━━━━━━━━━

Jawaban benar:
${allAnswers}

━━━━━━━━━━━━━━
            `.trim(), room.msg)

            clearTimeout(room.timeout)
            delete this.family[id]

            return true
        }

        // =========================
        // 🔍 CEK JAWABAN
        // =========================
        let index = room.jawaban.indexOf(text)

        if (index < 0) {

            let belum = room.jawaban.filter((_, i) => !room.terjawab[i])

            if (belum.length > 0) {
                let maxSim = Math.max(...belum.map(j => similarity(j, text)))
                if (maxSim >= threshold) return m.reply('💡 *Dikit lagi!*')
            }

            return m.reply('❌ *Salah!*')
        }

        // =========================
        // ❌ SUDAH TERJAWAB
        // =========================
        if (room.terjawab[index]) return true

        let users = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = { money: 0 })

        room.terjawab[index] = m.sender
        users.money += rewardAmount

        // =========================
        // 🏆 CEK WIN
        // =========================
        let isWin = room.terjawab.filter(v => v).length === room.jawaban.length

        let caption = `
👨‍👩‍👧‍👦 *FAMILY 100*
━━━━━━━━━━━━━━

❓ ${room.soal}

📊 Jawaban:
${room.jawaban.map((j, i) => {
    return room.terjawab[i]
        ? `(${i + 1}) ${j} ✔️ @${room.terjawab[i].split('@')[0]}`
        : `(${i + 1}) _ _ _`
}).join('\n')}

${isWin ? '🎉 *SEMUA JAWABAN TERJAWAB!*' : ''}

💰 +${rewardAmount} money / jawaban
━━━━━━━━━━━━━━
        `.trim()

        let msg = await this.reply(m.chat, caption, m)

        this.family[id].msg = msg

        // =========================
        // 🏁 END GAME
        // =========================
        if (isWin) {
            clearTimeout(room.timeout)
            setTimeout(() => {
                delete this.family[id]
            }, 5000)
        }

        return true
    }
}