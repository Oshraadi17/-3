
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

const serviceMatchMap = {
  "likes": ["like", "likes"],
  "followers": ["follower", "followers"],
  "views": ["view", "views"]
};

app.post("/api/order", async (req, res) => {
  const { serviceType, link, quantity } = req.body;

  if (!serviceType || !link || !quantity) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  let selected = null;

  for (const supplier of suppliers) {
    try {
      const servicesRes = await axios.post(supplier.url, {
        key: supplier.key,
        action: "services"
      });

      const services = servicesRes.data;
      const keywords = serviceMatchMap[serviceType] || [];

      const filtered = services.filter(s =>
        s.name &&
        keywords.some(k => s.name.toLowerCase().includes(k)) &&
        s.max >= quantity
      );

      if (filtered.length > 0) {
        selected = {
          supplier,
          service: filtered[0]
        };
        break;
      }
    } catch (err) {
      console.error(`Error fetching services from ${supplier.name}:`, err.response?.data || err.message);
    }
  }

  if (!selected) {
    return res.status(400).json({ message: "No suitable service found" });
  }

  try {
    const orderRes = await axios.post(selected.supplier.url, {
      key: selected.supplier.key,
      action: "add",
      service: selected.service.service,
      link,
      quantity
    });

    console.log(`Order sent to ${selected.supplier.name}:`, orderRes.data);

    res.json({
      success: true,
      message: `ההזמנה נשלחה דרך ${selected.supplier.name}, מספר הזמנה: ${orderRes.data.order || "N/A"}`
    });
  } catch (error) {
    console.error("Order submission error:", error.response?.data || error.message);
    res.status(500).json({ message: "שגיאה בביצוע ההזמנה." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Adi Boost REAL server running on port ${PORT}`);
});
