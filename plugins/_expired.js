let handler = m => m
handler.before = async function (m) {

    if (m.isGroup && global.db.data.chats[m.chat].expired != 0) {
        if (new Date() * 1 >= global.db.data.chats[m.chat].expired) {
            await this.reply(m.chat, `Masa Sewa *${this.user.name}* di Group ini Habis, waktunya Bot untuk meninggalkan Group\nJangan lupa sewa lagi ya!`, null)
            await this.groupLeave(m.chat)
            global.db.data.chats[m.chat].expired = 0
        }
    }
}

module.exports = handler
