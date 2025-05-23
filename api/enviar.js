export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { mensagem } = req.body;
  if (!mensagem) {
    return res.status(400).json({ error: 'Mensagem vazia' });
  }

  const token = process.env.TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: 'Variáveis de ambiente não configuradas' });
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: mensagem
  };

  try {
    const telegramRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await telegramRes.json();

    if (!data.ok) {
      return res.status(500).json({ error: data.description || 'Erro ao enviar mensagem' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao conectar com o Telegram' });
  }
}
