
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(express.static('.'));

const SUPPLIERS = {
  peakerr: {
    url: 'https://peakerr.com/api/v2',
    key: 'd75f46d4bf4adbff66037c90aac642f6'
  },
  smmfollows: {
    url: 'https://smmfollows.com/api/v2',
    key: 'd7c89a3283ce994acb8b8ace69dd53ec'
  }
};

const serviceKeywords = {
  likes: ['like'],
  followers: ['follower'],
  views: ['view'],
  live: ['live']
};

function isMatch(name, keywords) {
  const lower = name.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

app.post('/api/estimate', async (req, res) => {
  const { platform, serviceType, quantity } = req.body;
  const isUsername = ['followers', 'live'].includes(serviceType);
  let matches = [];

  for (const name in SUPPLIERS) {
    const sup = SUPPLIERS[name];
    try {
      const services = (await axios.post(sup.url, {
        key: sup.key,
        action: 'services'
      })).data;

      matches = matches.concat(services
        .filter(s =>
          s.category.toLowerCase().includes(platform.toLowerCase()) &&
          isMatch(s.name, serviceKeywords[serviceType]) &&
          (isUsername ? s.type === 'username' : s.type === 'default')
        )
        .map(s => ({
          rate: parseFloat(s.rate),
          supplier: name
        }))
      );
    } catch {}
  }

  if (!matches.length) return res.json({ message: '❌ No matching service found.' });

  matches.sort((a, b) => a.rate - b.rate);
  const best = matches[0];
  const totalPrice = ((best.rate / 1000) * quantity).toFixed(2);
  res.json({ message: `✅ Best: ${best.supplier} | Rate: $${best.rate}/1000 | Total: $${totalPrice}` });
});

app.post('/api/order', async (req, res) => {
  const { platform, serviceType, target, quantity } = req.body;
  const isUsername = ['followers', 'live'].includes(serviceType);
  let matches = [];

  for (const name in SUPPLIERS) {
    const sup = SUPPLIERS[name];
    try {
      const services = (await axios.post(sup.url, {
        key: sup.key,
        action: 'services'
      })).data;

      matches = matches.concat(services
        .filter(s =>
          s.category.toLowerCase().includes(platform.toLowerCase()) &&
          isMatch(s.name, serviceKeywords[serviceType]) &&
          (isUsername ? s.type === 'username' : s.type === 'default')
        )
        .map(s => ({
          id: s.service,
          rate: parseFloat(s.rate),
          supplier: sup,
          supplierName: name
        }))
      );
    } catch {}
  }

  if (!matches.length) return res.json({ message: '❌ No matching service for order.' });

  matches.sort((a, b) => a.rate - b.rate);
  const best = matches[0];

  try {
    const response = await axios.post(best.supplier.url, {
      key: best.supplier.key,
      action: 'add',
      service: best.id,
      link: target,
      quantity: quantity
    });
    res.json({ message: `✅ Order sent to ${best.supplierName}`, order: response.data });
  } catch (err) {
    res.json({ message: '❌ Error placing order', error: err.response?.data || err.message });
  }
});

app.listen(port, () => console.log(`Adi Boost with price display running on port ${port}`));
