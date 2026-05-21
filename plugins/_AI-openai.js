const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const chatAI = async (text) => {
  let user_id = uuidv4().replace(/-/g, '');
  let lastMsg = `USER: ${text}`;
  let signature = crypto
    .createHmac('sha256', 'CONSICESIGAIMOVIESkjkjs32120djwejk2372kjsajs3u293829323dkjd8238293938wweiuwe')
    .update(user_id + lastMsg + 'normal')
    .digest('hex');
  
  let form = new URLSearchParams({
    question: lastMsg,
    conciseaiUserId: user_id,
    signature,
    previousChats: JSON.stringify([{ a: '', b: lastMsg, c: false }]),
    model: 'normal'
  });

  let { data } = await axios.post('https://toki-41b08d0904ce.herokuapp.com/api/conciseai/chat', form.toString(), {
    headers: {
      'User-Agent': 'okhttp/4.10.0',
      'Connection': 'Keep-Alive',
      'Accept-Encoding': 'gzip',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  return data.answer;
};

let handler = async (m, { args }) => {
  try {
    if (!args.length) throw 'Kasih Pertanyaan';
    m.reply(await chatAI(args.join(' ')));
  } catch (e) {
    m.reply(e.message || e);
  }
};

handler.help = ['ai'];
handler.command = ['ai', 'openai'];
handler.tags = ['ai'];

module.exports = handler;