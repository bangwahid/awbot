const {
    generateWAMessage,
    generateWAMessageFromContent
} = require("@adiwajshing/baileys");
const crypto = require("crypto");
const { PassThrough } = require("stream");
const ffmpeg = require("fluent-ffmpeg");

let handler = async (m, { conn, text, usedPrefix, comma>
    let args = (text || "").split("|").map(v => v.trim(>
    let teks = "";
    let warna = "";
    let target = "";

    // Parsing argumen
    for (let v of args) {
        if (/chat\.whatsapp\.com\//i.test(v)) {
            target = v;
        } else if (/@g\.us$/.test(v) || /^\d{10,}$/.tes>
            target = v;
        } else if (!teks) {
            teks = v;
        } else if (!warna) {
            warna = v;
        }
    }

    let id = m.chat;
    if (target) {
        if (/chat\.whatsapp\.com\//i.test(target)) {
            let code = target.split("chat.whatsapp.com/>
            try {
                let info = await conn.groupGetInviteInf>
                id = info.id;
            } catch {
                return m.reply("⚠️ Link grup tidak valid>
            }
        } else {
            if (/^\d+$/.test(target)) target += "@g.us";
            id = target;
        }
    }

    const quoted = m.quoted || m;
    const mime = quoted?.mimetype || "";
    const caption = quoted?.caption || teks || "";

    const warnaMap = {
        biru: "#34B7F1",
        hijau: "#25D366",
        kuning: "#FFD700",
        merah: "#FF3B30",
        ungu: "#9C27B0",
        hitam: "#000000",
        putih: "#FFFFFF",
        cyan: "#00BCD4"
    };

    const bgColor = warnaMap[warna?.toLowerCase()];

    if (!caption && !m.quoted) {
        return m.reply(`✨ *UPSWGC (Group Status Update>

Gunakan: ${usedPrefix + command} teks|warna
Contoh: ${usedPrefix + command} Halo Semuanya|merah

Atau reply gambar/video/audio dengan command ini.`);
    }

    try {
        if (/image|video|audio/.test(mime)) {
            m.reply("_Sedang memproses media..._");
            const buffer = await quoted.download().catc>
            if (!buffer) return m.reply("⚠️ Gagal mengam>

            let content = {};
            if (/image/.test(mime)) {
                content = { image: buffer, caption };
            } else if (/video/.test(mime)) {
                content = { video: buffer, caption };
            } else if (/audio/.test(mime)) {
                const vn = await toVN(buffer);
                content = { audio: vn, mimetype: "audio>
            }

            await sendGroupStatus(conn, id, content);
            return m.reply("✅ Media status berhasil di>
        } else {
            // Text Status
            await sendGroupStatus(conn, id, bgColor ? {
                text: caption,
                backgroundColor: bgColor,
                font: 1
            } : { text: caption });

            return m.reply("✅ Status teks berhasil dik>
        }
    } catch (e) {
        console.error(e);
        return m.reply("❌ Terjadi kesalahan: " + e.mes>
    }
};
/**
 * Mengirim pesan ke Status Grup (Group Status V2)
 */
async function sendGroupStatus(conn, jid, content) {
    // 1. Generate pesan internal (Image/Video/Text)
    const msg = await generateWAMessage(jid, content, {
        upload: conn.waUploadToServer
    });

    let innerMsg = msg.message;

    // 2. Bungkus ke dalam groupStatusMessageV2
    const statusMessage = {
        groupStatusMessageV2: {
            message: innerMsg
        }
    };

    // 3. Tambahkan messageSecret (Penting agar media b>
    const secret = crypto.randomBytes(32);
    statusMessage.groupStatusMessageV2.message.messageC>
        messageSecret: secret
    };

    // 4. Generate pesan final untuk di-relay
    const final = generateWAMessageFromContent(jid, sta>
        userJid: conn.user.id,
    });

    await conn.relayMessage(jid, final.message, {
        messageId: final.key.id
    });

    return final;
}

/**
 * Konversi audio ke OGG/Opus (VN)
 */
async function toVN(buffer) {
    return new Promise((resolve, reject) => {
        const input = new PassThrough();
        const output = new PassThrough();
        const chunks = [];
        input.end(buffer);
        ffmpeg(input)
            .audioCodec("libopus")
            .audioBitrate(128)
            .format("ogg")
            .noVideo()
            .on("error", (err) => reject(new Error("FFm>
            .on("end", () => resolve(Buffer.concat(chun>
            .pipe(output);
        output.on("data", chunk => chunks.push(chunk));
    });
}

handler.help = ["swgc", "upswgc"];
handler.tags = ["group"];
handler.command = /^(swgc|upswgc)$/i;
handler.admin = true;

module.exports = handler;