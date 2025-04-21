
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
    let selected = null;

    for (const supplier of suppliers) {
      try {
        const servicesRes = await axios.post(supplier.url, {
          key: supplier.key,
          action: "services"
        });

        const services = servicesRes.data;
        const match = services.find(
          s => s.name && s.name.toLowerCase().includes(type.toLowerCase())
        );

        if (match) {
          selected = { ...supplier, service: match.service };
          break;
        }
      } catch (err) {
        console.error(`שגיאה בקבלת שירותים מ-${supplier.name}:`, err.response?.data || err.message);
      }
    }

    if (!selected) {
      return res.status(400).json({ message: "לא נמצא שירות מתאים להזמנה." });
    }

    const orderRes = await axios.post(selected.url, {
      key: selected.key,
      action: "add",
      service: selected.service,
      link,
      quantity: amount
    });

    console.log(`הזמנה נשלחה דרך ${selected.name}:`, orderRes.data);

    res.json({
      success: true,
      message: `ההזמנה נשלחה דרך ${selected.name}, מספר הזמנה: ${orderRes.data.order || "N/A"}`
    });

  } catch (err) {
    console.error("שגיאה בהזמנה:", err.response?.data || err.message);
    res.status(500).json({ message: "שגיאה בביצוע ההזמנה." });
  }
});

app.listen(PORT, () => {
  console.log(`Adi-Boost server רץ על פורט ${PORT}`);
});
