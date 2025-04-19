
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const API_KEY = "8fb07bbae1e48bfc9ad4b0d8b280447b";

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/order', async (req, res) => {
  const { link, quantity, service } = req.body;

  if (!link || !quantity || !service) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const response = await axios.post('https://smmfollows.com/api/v2', {
      key: API_KEY,
      action: 'add',
      service,
      link,
      quantity
    });

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'API Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Adi-Boost running on ${PORT}`);
});
