import fs from 'fs';
import path from 'path';

const LEMBRETES_PATH = path.join(process.cwd(), 'public', 'lembretes.json');

export default async function handler(req, res) {
  const hoje = new Date().toISOString().split('T')[0];

  if (!fs.existsSync(LEMBRETES_PATH)) {
    return res.status(200).json({ message: 'Nenhum lembrete cadastrado.' });
  }

  const lembretes = JSON.parse(fs.readFileSync(LEMBRETES_PATH, 'utf-8'));

  for (const [casa, { data_inicio, telegram }] of Object.entries(lembretes)) {
    const vencimento = new Date(data_inicio);
    vencimento.setDate(vencimento.getDate() + 30);
    const vencStr = vencimento.toISOString().split('T')[0];

    if (vencStr === hoje) {
      await sendTelegramMessage(telegram, `📢 Olá! O aluguel da casa vence hoje, Procurar a pagar a mensalidade`);
    }
  }

  return res.status(200).json({ message: 'Notificações verificadas.' });
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
