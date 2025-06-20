import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err || !files.photo) return res.status(400).json({ ok: false });

    const photo = fs.createReadStream(files.photo[0].filepath);
    const token = process.env.TOKEN;
    const chatId = process.env.CHAT_ID;

    const telegramUrl = `https://api.telegram.org/bot${token}/sendPhoto`;

    const tgForm = new FormData();
    tgForm.append('chat_id', chatId);
    tgForm.append('photo', photo);

    const response = await fetch(telegramUrl, {
      method: 'POST',
      body: tgForm
    });

    const data = await response.json();
    return res.status(200).json({ ok: data.ok });
  });
}
