module.exports = {
before: async function (m) {
    this.autosholat = this.autosholat || {}
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? this.user.jid : m.sender
    let id = m.chat
    let jadwalSholat = {
            Fajr: "04:14",
            Sunrise: "05:33",
            Dhuhr: "11:29",
            Asr: "14:50",
            Sunset: "17:19",
            Maghrib: "18:08",
            Isha: "18:34",
            Imsak: "04:04",
            Midnight: "00:00",
            Firstthird: "23:00",
            Lastthird: "03:00"
        }
    const date = new Date((new Date).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta"
    }));
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeNow = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    let isActive = Object.values(this.autosholat).includes(true);
    if (id in this.autosholat && isActive) {
        return false
    }

    for (const [sholat, waktu] of Object.entries(jadwalSholat)) {
        if (timeNow === waktu && !(id in this.autosholat)) {
            let caption = `Hai kak @${who.split`@`[0]},\nWaktu *${sholat}* telah tiba, ambilah air wudhu dan segeralah shalat.\n\n*${waktu}*\n_untuk wilayah Malang dan sekitarnya._`
            this.autosholat[id] = [
                this.reply(m.chat, caption, null, {
                    contextInfo: {
                        mentionedJid: [who]
                    }
                }),
                setTimeout(() => {
                    delete this.autosholat[id]
                }, 57000)
            ]
        }
    }
},
disabled: false
}
