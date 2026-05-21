    const similarity = require('similarity')
const threshold = 0.72

module.exports = {
    async before(m) {

        this.game = this.game ? this.game : {}

        let id = 'family100_' + m.chat

        if (!(id in this.game)) return true

        let room = this.game[id]
        if (!room) return true

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
                .map((j, i) => `(${i + 1}) ${j}`)
                .join('\n')

            this.reply(
                m.chat,
                `
🏳️ *GAME BERAKHIR*
━━━━━━━━━━━━━━

Jawaban yang benar:
${allAnswers}

━━━━━━━━━━━━━━
                `.trim(),
                room.msg
            )

            clearTimeout(room.timeout)
            delete this.game[id]

            return true
        }

        // =========================
        // 🔍 COCOK JAWABAN
        // =========================
        let index = room.jawaban.indexOf(text)

        if (index < 0) {

            let belumTerjawab = room.jawaban.filter((_, i) => !room.terjawab[i])

            if (belumTerjawab.length > 0) {

                let maxSim = Math.max(
                    ...belumTerjawab.map(j => similarity(j, text))
                )

                if (maxSim >= threshold) {
                    m.reply('💡 *Dikit lagi!*')
                }
            }

            return true
        }

        // =========================
        // ❌ SUDAH TERJAWAB
        // =========================
        if (room.terjawab[index]) return true

        if (!global.db.data.users[m.sender])
            global.db.data.users[m.sender] = { money: 0 }

        let users = global.db.data.users[m.sender]

        room.terjawab[index] = m.sender
        users.money += room.rewardAmount

        // =========================
        // 🏆 CEK MENANG
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
        : ''
}).filter(Boolean).join('\n')}

${isWin ? '🎉 *SEMUA JAWABAN TERJAWAB!*' : ''}

💰 +${room.rewardAmount} money / jawaban
━━━━━━━━━━━━━━
        `.trim()

        m.reply(caption, null, {
            contextInfo: {
                mentionedJid: this.parseMention(caption)
            }
        }).then(msg => {
            if (this.game[id]) this.game[id].msg = msg
        }).catch(() => {})

        // =========================
        // 🏁 WIN END GAME
        // =========================
        if (isWin) {
            clearTimeout(room.timeout)
            delete this.game[id]
        }

        return true
    }
}