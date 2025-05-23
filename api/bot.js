import fs from 'fs';
import path from 'path';

const STATUS_PATH = path.join(process.cwd(), 'public', 'status.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const body = req.body;
  const message = body?.message?.text;
  const chatId = body?.message?.chat?.id;

  if (!message || !chatId) {
    return res.status(400).json({ error: 'Mensagem ou chatId ausente' });
  }

  const match = message.match(/^\/(alugada|desalugada)\s+(\d+)$/);
  if (!match) {
    return res.status(200).json({ message: 'Comando ignorado' });
  }

  const [, comando, numeroStr] = match;
  const numero = parseInt(numeroStr);

  if (isNaN(numero)) {
    return await sendTelegramMessage(chatId, 'Número inválido.');
  }

  let status = { casas_disponiveis: [] };
  try {
    const file = fs.readFileSync(STATUS_PATH, 'utf8');
    status = JSON.parse(file);
  } catch (err) {
    console.log('Arquivo de status não encontrado ou inválido. Será criado.');
  }

  const index = status.casas_disponiveis.indexOf(numero);
  let resposta = '';

  if (comando === 'alugada') {
    if (index !== -1) status.casas_disponiveis.splice(index, 1);
    resposta = `Casa ${numero} agora está INDISPONÍVEL ❌`;
  } else {
    if (index === -1) status.casas_disponiveis.push(numero);
    resposta = `Casa ${numero} agora está DISPONÍVEL ✅`;
  }

  fs.writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2));
  await sendTelegramMessage(chatId, resposta);

  return res.status(200).json({ status });
}

async function sendTelegramMessage(chatId, text) {
  const token = process.env.TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}
