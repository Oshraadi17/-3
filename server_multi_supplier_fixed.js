const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
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
  const { type, link, amount } = req.body;
  try {
    let fastestSupplier = null;
    for (let supplier of suppliers) {
      try {
        const response = await axios.post(supplier.url, {
          key: supplier.key,
          action: "services"
        });
        const services = response.data;
        const matching = services.find(
          s => s.type && s.type.toLowerCase().includes(type.toLowerCase())
        );
        if (matching) {
          fastestSupplier = { ...supplier, service: matching.service };
          break;
        }
      } catch (err) {
        continue;
      }
    }

    if (!fastestSupplier) {
      return res.status(400).json({ message: "לא נמצא שירות מתאים להזמנה." });
    }

    await axios.post(fastestSupplier.url, {
      key: fastestSupplier.key,
      action: "add",
      service: fastestSupplier.service,
      link,
      quantity: amount
    });

    res.json({ message: "ההזמנה נשלחה בהצלחה!" });
  } catch (error) {
    res.status(500).json({ message: "שגיאה בשרת." });
  }
});

app.listen(PORT, () => {
  console.log(`Adi-Boost server רץ על פורט ${PORT}`);
});
