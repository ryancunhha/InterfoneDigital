import fs from 'fs';
import path from 'path';

const STATUS_PATH = path.join(process.cwd(), 'public', 'status.json');
const LEMBRETES_PATH = path.join(process.cwd(), 'public', 'lembretes.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const message = req.body?.message?.text;
  const chatId = req.body?.message?.chat?.id;
  if (!message || !chatId) return res.status(400).json({ error: 'Mensagem inválida' });

  const matchAlugada = message.match(/^\/alugado\s+(\d+)\s+(\d{4}-\d{2}-\d{2})\s+(@\w+)/);
  if (matchAlugada) {
    const [, numero, data, telegram] = matchAlugada;
    const num = parseInt(numero);

    const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf-8'));
    const index = status.casas_disponiveis.indexOf(num);
    if (index !== -1) status.casas_disponiveis.splice(index, 1);
    fs.writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2));

    const lembretes = fs.existsSync(LEMBRETES_PATH)
      ? JSON.parse(fs.readFileSync(LEMBRETES_PATH, 'utf-8'))
      : {};
    lembretes[num] = { data_inicio: data, telegram };
    fs.writeFileSync(LEMBRETES_PATH, JSON.stringify(lembretes, null, 2));

    return await sendTelegramMessage(chatId, `✅ Casa ${num} alugado em ${data}`);
  }

  const matchDesalugada = message.match(/^\/desalugado\s+(\d+)/);
  if (matchDesalugada) {
    const num = parseInt(matchDesalugada[1]);

    const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf-8'));
    if (!status.casas_disponiveis.includes(num)) {
      status.casas_disponiveis.push(num);
    }
    fs.writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2));

    if (fs.existsSync(LEMBRETES_PATH)) {
      const lembretes = JSON.parse(fs.readFileSync(LEMBRETES_PATH, 'utf-8'));
      delete lembretes[num];
      fs.writeFileSync(LEMBRETES_PATH, JSON.stringify(lembretes, null, 2));
    }

    return await sendTelegramMessage(chatId, `🏠 Casa ${num} disponível para alugar.`);
  }

  return res.status(200).json({ message: 'Comando não reconhecido.' });
}

async function sendTelegramMessage(chatId, text) {
  const token = process.env.TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}
