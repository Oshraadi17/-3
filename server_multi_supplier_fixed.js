
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const suppliers = [
  {
    name: "SMMFollows",
    url: "https://smmfollows.com/api/v2",
    key: "d7c89a3283ce994acb8b8ace69dd53ec"
  },
  {
    name: "Peakerr",
    url: "https://peakerr.com/api/v2",
    key: "d75f46d4bf4adbff66037c90aac642f6"
  }
];

app.post("/api/order", async (req, res) => {
  const { serviceType, link, quantity } = req.body;

  let selectedService = null;
  let selectedSupplier = null;

  for (const supplier of suppliers) {
    try {
      const response = await axios.post(supplier.url, {
        key: supplier.key,
        action: "services"
      });

      const services = response.data;
      const filtered = services.filter(s =>
        s.name && s.name.toLowerCase().includes(serviceType.toLowerCase()) &&
        s.rate &&
        s.max >= quantity
      ).sort((a, b) => a.rate - b.rate); // הכי זול = לרוב גם הכי מהיר

      if (filtered.length > 0) {
        selectedService = filtered[0];
        selectedSupplier = supplier;
        break;
      }
    } catch (err) {
      console.log(`שגיאה עם ${supplier.name}:`, err.message);
    }
  }

  if (!selectedService || !selectedSupplier) {
    return res.status(400).json({ error: "לא נמצא שירות מתאים להזמנה." });
  }

  try {
    const orderResponse = await axios.post(selectedSupplier.url, {
      key: selectedSupplier.key,
      action: "add",
      service: selectedService.service,
      link,
      quantity
    });

    res.json({ success: true, supplier: selectedSupplier.name, order: orderResponse.data });
  } catch (error) {
    res.status(500).json({ error: "נכשלה ההזמנה." });
  }
});

app.listen(PORT, () => {
  console.log(`Adi-Boost server פועל על פורט ${PORT}`);
});
