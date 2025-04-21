
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
  "לייקים": ["like", "likes", "לייק"],
  "צפיות": ["view", "views", "צפייה", "צפיות"],
  "עוקבים": ["follower", "followers", "עוקב"]
};

app.post("/api/order", async (req, res) => {
  const { service, link, quantity } = req.body;

  if (!service || !link || !quantity) {
    return res.status(400).json({ message: "חסרים פרטים בהזמנה." });
  }

  let selectedService = null;
  let selectedSupplier = null;

  for (const supplier of suppliers) {
    try {
      const response = await axios.post(supplier.url, {
        key: supplier.key,
        action: "services"
      });

      const services = response.data;
      const keywords = serviceMatchMap[service] || [];

      const filtered = services.filter(s =>
        s.name &&
        keywords.some(k => s.name.toLowerCase().includes(k)) &&
        s.rate &&
        s.max >= quantity
      ).sort((a, b) => a.rate - b.rate);

      if (filtered.length > 0) {
        selectedService = filtered[0];
        selectedSupplier = supplier;
        break;
      }
    } catch (err) {
      console.error(`שגיאה עם ${supplier.name}:`, err.response?.data || err.message);
    }
  }

  if (!selectedService || !selectedSupplier) {
    return res.status(400).json({ message: "לא נמצא שירות מתאים להזמנה." });
  }

  try {
    const orderResponse = await axios.post(selectedSupplier.url, {
      key: selectedSupplier.key,
      action: "add",
      service: selectedService.service,
      link,
      quantity
    });

    console.log(`ההזמנה נשלחה דרך ${selectedSupplier.name}:`, orderResponse.data);

    res.json({
      success: true,
      message: `ההזמנה נשלחה דרך ${selectedSupplier.name}, מספר הזמנה: ${orderResponse.data.order || "N/A"}`
    });
  } catch (error) {
    console.error("שגיאה בביצוע ההזמנה:", error.response?.data || error.message);
    res.status(500).json({ message: "שגיאה בביצוע ההזמנה." });
  }
});

app.listen(PORT, () => {
  console.log(`Adi Boost server פועל על פורט ${PORT}`);
});
