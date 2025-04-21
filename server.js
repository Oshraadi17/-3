
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

app.post('/api/order', async (req, res) => {
  const { platform, serviceType, target, quantity } = req.body;
  const isUsername = serviceType === 'followers' || serviceType === 'live';

  const suppliers = Object.values(SUPPLIERS);
  let bestService = null;

  for (const supplier of suppliers) {
    try {
      const response = await axios.post(supplier.url, {
        key: supplier.key,
        action: 'services'
      });
      const services = response.data;

      const matching = services.find(service =>
        service.category.toLowerCase().includes(platform.toLowerCase()) &&
        service.name.toLowerCase().includes(serviceType.toLowerCase()) &&
        (isUsername ? service.type === 'username' : service.type === 'default')
      );

      if (matching) {
        bestService = { id: matching.service, supplier };
        break;
      }
    } catch (error) {
      continue;
    }
  }

  if (!bestService) {
    return res.json({ message: 'לא נמצא שירות מתאים להזמנה.' });
  }

  try {
    const orderResponse = await axios.post(bestService.supplier.url, {
      key: bestService.supplier.key,
      action: 'add',
      service: bestService.id,
      link: target,
      quantity: quantity
    });

    res.json({
      message: 'ההזמנה נשלחה בהצלחה ✅',
      order: orderResponse.data
    });
  } catch (error) {
    res.json({ message: 'שגיאה בהזמנה ❌', error: error.response?.data || error.message });
  }
});

app.listen(port, () => {
  console.log(`Adi Boost PRO רץ על פורט ${port}`);
});
