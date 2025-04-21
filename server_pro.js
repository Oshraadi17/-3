
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

// ספקים מוגדרים מראש
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

// מפת מילות מפתח לכל שירות
const serviceMatchMap = {
  "likes": ["like", "likes", "לייק"],
  "followers": ["follower", "followers", "עוקב"],
  "views": ["view", "views", "צפיות"],
  "live": ["live", "stream", "צפיות בלייב"]
};

// שמירה בזיכרון של שירותים זמינים
let cachedServices = {};

async function fetchServices() {
  for (const supplier of suppliers) {
    try {
      const res = await axios.post(supplier.url, {
        key: supplier.key,
        action: "services"
      });
      cachedServices[supplier.name] = res.data;
    } catch (err) {
      console.error(`שגיאה בשליפת שירותים מ-${supplier.name}:`, err.response?.data || err.message);
      cachedServices[supplier.name] = [];
    }
  }
  console.log("רשימת שירותים עודכנה");
}

app.post("/api/order", async (req, res) => {
  const { serviceType, link, quantity } = req.body;
  if (!serviceType || !link || !quantity) {
    return res.status(400).json({ message: "נא למלא את כל השדות." });
  }

  const keywords = serviceMatchMap[serviceType] || [];
  let chosen = null;

  for (const supplier of suppliers) {
    const services = cachedServices[supplier.name] || [];
    const match = services.filter(s =>
      s.name &&
      keywords.some(k => s.name.toLowerCase().includes(k.toLowerCase())) &&
      s.max >= quantity
    ).sort((a, b) => (a.average_time || 9999) - (b.average_time || 9999));

    if (match.length > 0) {
      chosen = { supplier, service: match[0] };
      break;
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
    console.error("שגיאה בשליחת הזמנה:", err.response?.data || err.message);
    res.status(500).json({ message: "שגיאה בשליחת ההזמנה." });
  }
});

fetchServices(); // שליפה ראשונית של שירותים
setInterval(fetchServices, 1000 * 60 * 10); // רענון כל 10 דקות

app.listen(PORT, () => {
  console.log("ADI BOOST PRO - שרת פועל על פורט " + PORT);
});
