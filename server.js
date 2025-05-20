const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// 🔐 Твій токен Monobank
const MONO_TOKEN = 'uFiYaX1PFTbwu4Ptg7Qxo2nkw1Q5SCt78H0fTy-x-2ag';

app.get('/white-card-transactions', async (req, res) => {
  try {
    const headers = { 'X-Token': MONO_TOKEN };

    // Крок 1: Отримати список акаунтів
    const clientInfoRes = await axios.get('https://api.monobank.ua/personal/client-info', { headers });
    const accounts = clientInfoRes.data.accounts;

    // Крок 2: Знайти акаунт з типом "white"
    const whiteAccount = accounts.find(acc => acc.type === 'white');
    if (!whiteAccount) {
      return res.status(404).json({ error: 'Біла картка не знайдена' });
    }

    const accountId = whiteAccount.id;

    // Крок 3: Отримати транзакції за останні 7 днів
    const from = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60; // UNIX-час 7 днів тому
    const transactionsRes = await axios.get(`https://api.monobank.ua/personal/statement/${accountId}/${from}`, { headers });

    // Повертаємо транзакції клієнту
    res.json(transactionsRes.data);

  } catch (err) {
    console.error('Помилка:', err.message);
    res.status(500).json({ error: 'Не вдалося отримати транзакції' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
