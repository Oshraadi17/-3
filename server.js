const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

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

const keywordMap = {
  followers: ['follower'],
  likes: ['like'],
  views: ['view'],
  live: ['live', 'stream']
};

function matchesKeywords(name, keywords) {
  const lower = name.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

app.post('/api/estimate', async (req, res) => {
  const { platform, serviceType, quantity } = req.body;
  let candidates = [];

  for (const [supplierName, supplier] of Object.entries(SUPPLIERS)) {
    try {
      const services = (await axios.post(supplier.url, {
        key: supplier.key,
        action: 'services'
      })).data;

      services.forEach(svc => {
        if (svc.category.toLowerCase().includes(platform.toLowerCase()) &&
            matchesKeywords(svc.name, keywordMap[serviceType])) {
          candidates.push({
            supplierName,
            service: svc.service,
            rate: parseFloat(svc.rate),
            avgTime: svc.average_time || 9999,
            name: svc.name,
            supplier
          });
        }
      });
    } catch (e) {
      console.log('Error from supplier', supplierName, e.message);
    }
  }

  if (!candidates.length) return res.json({ message: 'No matching service found.' });

  candidates.sort((a, b) => a.rate - b.rate || a.avgTime - b.avgTime);
  const best = candidates[0];
  const total = (best.rate / 1000) * quantity;
  res.json({ message: `Best: ${best.name} | ${best.supplierName} | Total: $${total.toFixed(2)}` });
});

app.post('/api/order', async (req, res) => {
  const { platform, serviceType, target, quantity } = req.body;
  let candidates = [];

  for (const [supplierName, supplier] of Object.entries(SUPPLIERS)) {
    try {
      const services = (await axios.post(supplier.url, {
        key: supplier.key,
        action: 'services'
      })).data;

      services.forEach(svc => {
        if (svc.category.toLowerCase().includes(platform.toLowerCase()) &&
            matchesKeywords(svc.name, keywordMap[serviceType])) {
          candidates.push({
            supplierName,
            service: svc.service,
            rate: parseFloat(svc.rate),
            avgTime: svc.average_time || 9999,
            name: svc.name,
            supplier
          });
        }
      });
    } catch {}
  }

  if (!candidates.length) return res.json({ message: 'No matching service to order.' });

  candidates.sort((a, b) => a.rate - b.rate || a.avgTime - b.avgTime);
  const best = candidates[0];

  try {
    const order = await axios.post(best.supplier.url, {
      key: best.supplier.key,
      action: 'add',
      service: best.service,
      link: target,
      quantity
    });
    res.json({ message: `Order placed: ${best.name} (${best.supplierName})`, order: order.data });
  } catch (err) {
    res.json({ message: 'Error placing order.', error: err.message });
  }
});

app.listen(port, () => console.log('Server running on port', port));
