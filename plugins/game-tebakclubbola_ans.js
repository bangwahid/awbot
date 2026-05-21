const similarity = require("similarity");
const threshold = 0.72;

let handler = (m) => m;

handler.before = async function (m) {
  let id = m.chat;

  if (!m.quoted) return !0;

  this.tebakclub = this.tebakclub ? this.tebakclub : {};
  if (!(id in this.tebakclub)) return !0;

  if (m.quoted.id !== this.tebakclub[id][0].key.id) return !0;

  let json = this.tebakclub[id][1];
  let jawaban = json.jawaban.toLowerCase().trim();
  let teksUser = (m.text || "").toLowerCase().trim();

  if (!teksUser) return !0;

  let poin = this.tebakclub[id][2];

  // === BENAR ===
  if (teksUser === jawaban) {
    global.db.data.users[m.sender].money += poin;

    m.reply(`
🎉 *JAWABAN BENAR!*

──────────────────
💰 Selamat! Kamu mendapatkan +${poin} money
🎯 Jawaban: *${json.jawaban}*
──────────────────
🔥 Mantap! lanjutkan permainanmu
`.trim());

    clearTimeout(this.tebakclub[id][3]);
    delete this.tebakclub[id];
  }

  // === DIIKIT LAGI ===
  else if (similarity(teksUser, jawaban) >= threshold) {
    m.reply(`
⚡ *Hampir Benar!*

──────────────────
💡 Jawabanmu sudah mendekati
🔎 Coba perbaiki sedikit lagi
──────────────────
`.trim());
  }

  // === SALAH ===
  else {
    m.reply(`
❌ *Jawaban Salah!*

──────────────────
📌 Coba perhatikan petunjuknya lagi
💬 Kirim jawaban yang lebih tepat
──────────────────
`.trim());
  }

  return !0;
};

handler.exp = 0;
module.exports = handler;