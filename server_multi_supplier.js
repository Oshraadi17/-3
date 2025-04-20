
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const SUPPLIERS = [
  {
    name: "smmfollows",
    url: "https://smmfollows.com/api/v2",
    key: "8fb07bbae1e48bfc9ad4b0d8b280447b"
  },
  {
    name: "peakerr",
    url: "https://panel.peakerr.com/api/v2",
    key: "7e2a1421e24ed0570c518d2f613a4365"
  }
];

async function getBestService(serviceType, quantity) {
  for (const supplier of SUPPLIERS) {
    try {
      const res = await axios.post(supplier.url, {
        key: supplier.key,
        action: "services"
      });

      const services = res.data.filter(s =>
        s.type === "Default" &&
        s.status === "Active" &&
        s.category.toLowerCase().includes("tiktok") &&
        s.name.toLowerCase().includes(serviceType.toLowerCase()) &&
        s.min <= quantity &&
        s.max >= quantity
      );

      if (services.length > 0) {
        const best = services.sort((a, b) => a.average_time - b.average_time)[0];
        return { supplier, service: best };
      }
    } catch (error) {
      console.log(`שגיאה בספק ${supplier.name}:`, error.message);
    }
  }
  return null;
}

app.post("/api/order", async (req, res) => {
  const { service, link, quantity } = req.body;

  const result = await getBestService(service, quantity);
  if (!result) {
    return res.status(400).json({ message: "לא נמצא שירות מתאים להזמנה." });
  }

  const { supplier, service: selectedService } = result;

  try {
    const orderRes = await axios.post(supplier.url, {
      key: supplier.key,
      action: "add",
      service: selectedService.service,
      link,
      quantity
    });

    if (orderRes.data && orderRes.data.order) {
      res.json({ message: `ההזמנה נשלחה דרך ${supplier.name}, מס׳ הזמנה: ${orderRes.data.order}` });
    } else {
      res.json({ message: "ההזמנה נשלחה אך לא התקבלה תגובה תקינה." });
    }
  } catch (err) {
    res.status(500).json({ message: "שגיאה בעת ביצוע ההזמנה." });
  }
});

app.listen(PORT, () => {
  console.log("Adi-Boost server עם תמיכה בשני ספקים רץ על פורט", PORT);
});
