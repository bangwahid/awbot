const { sKata, cKata } = require('.././lib/sambung-kata');

const game = `
🎮 *SAMBUNG KATA*

🧠 Game kata bersambung adalah permainan di mana setiap pemain harus membuat kata dari akhir kata sebelumnya.
`.trim();

const rules = `
📜 RULES

✔ Kata dasar saja
✔ Tanpa spasi
✔ Tanpa imbuhan (me-, -an, dll)

🏆 Reward:
+500 XP × jumlah pemain (winner)

━━━━━━━━━━━━━━
🎮 COMMAND
━━━━━━━━━━━━━━
.join  → ikut game
.start → mulai game
`.trim();

let poin = 500;

let handler = async (m, { conn, text, isPrems, isROwner, usedPrefix, command }) => {
    let isDebug = /debug/i.test(command) && isROwner;
    //if (!isPrems) throw `Game ini dalam tahap pengemmbangan.. cooming soon`
    conn.skata = conn.skata ? conn.skata : {};
    // try {
    let id = m.chat;
    let kata = await genKata();
    let room_all = Object.values(conn.skata).find(room => room.id !== id && room.player.includes(m.sender));
    if (room_all) throw `🚫 AKSES DITOLAK

Kamu masih berada dalam sesi *Sambung Kata* di chat lain.

Selesaikan permainan terlebih dahulu sebelum memulai yang baru.`;
    if (id in conn.skata) {
        let room = conn.skata[id];
        let member = room.player;
        if (room.status == 'play') {
            if (!room.waktu._destroyed && !room.diam) return conn.reply(m.chat, `🚫 Akses Ditolak @${m.sender.split('@')[0]}

Game masih berlangsung di chat ini.
Tunggu sampai selesai, lalu coba bergabung lagi.`, room.chat, { contextInfo: { mentionedJid: member } }).catch(e => { return !1 }); // ketika naileys err
            delete conn.skata[id];
        }
        if (text == 'start' && room.status == 'wait') {
            if (!member.includes(m.sender)) return m.reply('⚠️ Kamu belum bergabung dalam game ini.');
            if (member.length < 2) throw `⚠️ Minimal pemain adalah *2 orang* untuk memulai permainan.`;
            room.curr = member[0];
            room.status = 'play';
            room.chat = await conn.reply(m.chat, `🎮 *SAMBUNG KATA DIMULAI*

👤 Giliran: @${member[0].split('@')[0]}

📌 Kata awal: *${room.kata.toUpperCase()}*
🔎 Lanjutkan: *${room.filter(room.kata).toUpperCase()}... ?*

💬 Ketik jawaban langsung di chat
❌ Ketik "nyerah" untuk menyerah

👥 Total Player: ${member.length}`, m, { contextInfo: { mentionedJid: member } });
            room.win_point = 100;
            for (let i of room.player) {
                let user = db.data.users[i];
                if (!('skata' in user)) user.skata = 0;
            }
            clearTimeout(room.waktu_list);
            room.waktu = setTimeout(() => {
                conn.reply(m.chat, `⏳ *WAKTU HABIS!*

@${room.curr.split('@')[0]} tereliminasi dari permainan.`, room.chat, { contextInfo: { mentionedJid: member } }).then(_ => {
                    room.eliminated.push(room.curr);
                    let index = member.indexOf(room.curr);
                    member.splice(index, 1);
                    room.curr = member[0];
                    if (room.player.length == 1 && room.status == 'play') {
                        db.data.users[member[0]].exp += room.win_point;
                        conn.reply(m.chat, `🏆 *GAME SELESAI*

🎉 @${member[0].split('@')[0]} berhasil menjadi pemenang!

💰 Reward: +${room.win_point} XP`, room.chat, { contextInfo: { mentionedJid: member } }).then(_ => {
                            delete conn.skata[id];
                            return !0;
                        });
                    }
                    room.diam = true;
                    room.new = true;
                    let who = room.curr;
                    conn.preSudo('nextkata', who, m).then(async _ => {
                        conn.ev.emit('messages.upsert', _);
                    });
                });
            }, 45000);

        } else if (room.status == 'wait') {
            if (member.includes(m.sender)) throw `Kamu sudah ikut di list`;
            member.push(m.sender);
            clearTimeout(room.waktu_list);
            room.waktu_list = setTimeout(() => {
                conn.reply(m.chat, `Sambung kata tidak dimulai (Cancel)`, room.chat).then(() => { delete conn.skata[id] });
            }, 120000);
            let caption = `━━━━━━━━━━━━━━
👥 *LIST PLAYER*
━━━━━━━━━━━━━━

${member.map((v, i) => `• ${i + 1}. @${v.split('@')[0]}`).join('\n')}

━━━━━━━━━━━━━━
🎮 Sistem:
• Permainan bergiliran sesuai urutan
• Hanya player terdaftar yang bisa bermain
━━━━━━━━━━━━━━`.trim();
            room.chat = await conn.reply(m.chat, `${caption}\n\n━━━━━━━━━━━━━━
📌 *CARA BERGABUNG*
━━━━━━━━━━━━━━

• Ketik: *${usedPrefix + command}*
  ➜ Untuk join/ikut game

• Ketik: *${usedPrefix + command} start*
  ➜ Untuk memulai permainan

━━━━━━━━━━━━━━`, m, { contextInfo: { mentionedJid: conn.parseMention(caption) } });
        }
    } else {
        conn.skata[id] = {
            id,
            player: isDebug ? ([owner[0] + '@s.whatsapp.net', conn.user.jid, owner[0] + '@s.whatsapp.net']) : [],
            status: 'wait',
            eliminated: [],
            basi: [],
            diam: false,
            win_point: 0,
            curr: '',
            kata,
            filter,
            genKata,
            chat: conn.reply(m.chat, `${game}\n${rules}`, m),
            waktu: false
        };
    }
    // } catch (e) {
    //  throw e
    // }
};

handler.help = ['sambungkata'];
handler.tags = ['game'];
handler.command = /^s(ambung)?kata(debug)?$/i;
handler.limit = true;
handler.group = true;

module.exports = handler;

async function genKata() {
    let json = await sKata();
    let result = json.kata;
    while (result.length < 3 || result.length > 7) {
        json = await sKata();
        result = json.kata;
    }
    return result;
}

function filter(text) {
    let mati = ["q", "w", "r", "t", "y", "p", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"];
    let misah;
    if (text.length < 3) return text;
    // alarm
    if (/([qwrtypsdfghjklzxcvbnm][qwrtypsdfhjklzxcvbnm])$/.test(text)) {
        let mid = /([qwrtypsdfhjklzxcvbnm])$/.exec(text)[0];
        return mid;
    }

    // mati + voc + ng {kijang, pisang, dalang, dll}

    if (/([qwrtypsdfghjklzxcvbnm][aiueo]ng)$/.test(text)) {
        let mid = /([qwrtypsdfghjklzxcvbnm][aiueo]ng)$/.exec(text)[0];
        return mid;
    }
    // voc2x + mati(optional) {portofolio, manusia, tiup, dll}
    else if (/([aiueo][aiueo]([qwrtypsdfghjklzxcvbnm]|ng)?)$/i.test(text)) {
        if (/(ng)$/i.test(text)) return text.substring(text.length - 3); // ex tiang, riang, siang
        else if (/([qwrtypsdfghjklzxcvbnm])$/i.test(text)) return text.substring(text.length - 2);
        else return text.substring(text.length - 1);
    }
    // ng/ny + voc + mati { sinyal, langit, banyak, dll}
    else if (/n[gy]([aiueo]([qwrtypsdfghjklzxcvbnm])?)$/.test(text)) {
        let nyenye = /n[gy]/i.exec(text)[0];
        misah = text.split(nyenye);
        return nyenye + misah[misah.length - 1];
    }
    // mati { kuku, batu, kamu, aku, saya, dll}
    else {
        let res = Array.from(text).filter(v => mati.includes(v));
        let resu = res[res.length - 1];
        for (let huruf of mati) {
            if (text.endsWith(huruf)) {
                resu = res[res.length - 2];
            }
        }
        misah = text.split(resu);
        if (text.endsWith(resu)) {
            return resu + misah[misah.length - 2] + resu;
        }
        return resu + misah[misah.length - 1];
    }
}
