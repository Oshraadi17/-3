
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

const suppliers = [
  {
    name: "Peakerr",
    url: "https://peakerr.com/api/v2",
    key: "7e2a1421e24ed0570c518d2f613a4365"
  },
  {
    name: "SMMFollows",
    url: "https://smmfollows.com/api/v2",
    key: "d75f46d4bf4adbff66037c90aac642f6"
  }
];

app.post("/api/order", async (req, res) => {
  const { platform, serviceType, link, quantity } = req.body;

  if (!platform || !serviceType || !link || !quantity) {
    return res.status(400).json({ message: "שדות חסרים בבקשה." });
  }

  let chosen = null;

  for (const supplier of suppliers) {
    try {
      const servicesRes = await axios.post(supplier.url, {
        key: supplier.key,
        action: "services"
      });

      const services = servicesRes.data;

      const filtered = services.filter(service =>
        service.name &&
        service.name.toLowerCase().includes(platform.toLowerCase()) &&
        service.name.toLowerCase().includes(serviceType.toLowerCase())
      );

      if (filtered.length > 0) {
        chosen = { supplier, service: filtered[0] };
        break;
      }
    } catch (err) {
      console.error(`שגיאה בשליפת שירותים מ-${supplier.name}:`, err.message);
    }
  }

  if (!chosen) {
    return res.status(404).json({ message: "לא נמצא שירות מתאים להזמנה." });
  }

  try {
    const orderRes = await axios.post(chosen.supplier.url, {
      key: chosen.supplier.key,
      action: "add",
      service: chosen.service.service,
      link,
      quantity
    });

    res.json({
      success: true,
      message: `הזמנה נשלחה דרך ${chosen.supplier.name}, מספר: ${orderRes.data.order || "N/A"}`,
      serviceId: chosen.service.service,
      averageTime: chosen.service.average_time || "לא ידוע"
    });
  } catch (err) {
    console.error("שגיאה בביצוע ההזמנה:", err.message);
    res.status(500).json({ message: "שגיאה בביצוע ההזמנה." });
  }
});

app.listen(PORT, () => {
  console.log("Adi Boost PRO - שרת עם תמיכה בפלטפורמה רץ על פורט " + PORT);
});
