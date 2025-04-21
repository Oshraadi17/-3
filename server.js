
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
  likes: ['like', 'likes', 'hearts'],
  followers: ['follow', 'follower', 'followers'],
  views: ['view', 'views', 'watch'],
  live: ['live', 'stream', 'live views', 'livestream']
};

function isMatch(name, keywords) {
  const lower = name.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

app.post('/api/estimate', async (req, res) => {
  const { platform, serviceType, quantity } = req.body;
  const isUsername = serviceType === 'followers' || serviceType === 'live';
  let allMatches = [];

  for (const supplierName in SUPPLIERS) {
    const supplier = SUPPLIERS[supplierName];
    try {
      const response = await axios.post(supplier.url, {
        key: supplier.key,
        action: 'services'
      });
      const services = response.data;

      const matches = services
        .filter(service =>
          service.category.toLowerCase().includes(platform.toLowerCase()) &&
          isMatch(service.name, serviceKeywords[serviceType]) &&
          (isUsername ? service.type === 'username' : service.type === 'default')
        )
        .map(service => ({
          rate: parseFloat(service.rate) || 0,
          averageTime: parseFloat(service.average_time) || 9999,
          supplierName
        }));

      allMatches = allMatches.concat(matches);
    } catch (error) {
      continue;
    }
  }

  if (allMatches.length === 0) {
    return res.json({ message: '❌ לא נמצא שירות מתאים להצגת מחיר.' });
  }

  allMatches.sort((a, b) => a.rate - b.rate || a.averageTime - b.averageTime);
  const best = allMatches[0];
  const priceEstimate = ((best.rate / 1000) * quantity).toFixed(2);

  res.json({
    message: `💰 מחיר משוער: $${priceEstimate} | ספק: ${best.supplierName} | זמן אספקה: ${best.averageTime} דקות`
  });
});

app.post('/api/order', async (req, res) => {
  const { platform, serviceType, target, quantity } = req.body;
  const isUsername = serviceType === 'followers' || serviceType === 'live';
  let allMatches = [];

  for (const supplierName in SUPPLIERS) {
    const supplier = SUPPLIERS[supplierName];
    try {
      const response = await axios.post(supplier.url, {
        key: supplier.key,
        action: 'services'
      });
      const services = response.data;

      const matches = services
        .filter(service =>
          service.category.toLowerCase().includes(platform.toLowerCase()) &&
          isMatch(service.name, serviceKeywords[serviceType]) &&
          (isUsername ? service.type === 'username' : service.type === 'default')
        )
        .map(service => ({
          serviceId: service.service,
          rate: parseFloat(service.rate) || 0,
          averageTime: parseFloat(service.average_time) || 9999,
          supplier,
          supplierName
        }));

      allMatches = allMatches.concat(matches);
    } catch (error) {
      continue;
    }
  }

  if (allMatches.length === 0) {
    return res.json({ message: '❌ לא נמצא שירות להזמנה.' });
  }

  allMatches.sort((a, b) => a.rate - b.rate || a.averageTime - b.averageTime);
  const best = allMatches[0];

  try {
    const orderResponse = await axios.post(best.supplier.url, {
      key: best.supplier.key,
      action: 'add',
      service: best.serviceId,
      link: target,
      quantity: quantity
    });

    res.json({
      message: `✅ נשלחה הזמנה לספק ${best.supplierName} | מחיר: $${best.rate} ל-1000`,
      order: orderResponse.data
    });
  } catch (error) {
    res.json({ message: '❌ שגיאה בביצוע ההזמנה', error: error.response?.data || error.message });
  }
});

app.listen(port, () => {
  console.log('Adi Boost PRICE ESTIMATE Server is running');
});
