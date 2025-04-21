
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

  let bestService = null;

  for (const supplier of suppliers) {
    try {
      const response = await axios.post(supplier.url, {
        key: supplier.key,
        action: "services"
      });

      const services = response.data;
      const filtered = services.filter(s =>
        s.name && s.name.toLowerCase().includes(type.toLowerCase()) &&
        s.average_time !== undefined && s.max >= amount
      );

      if (filtered.length > 0) {
        const fastest = filtered.sort((a, b) => a.average_time - b.average_time)[0];
        if (!bestService || fastest.average_time < bestService.average_time) {
          bestService = {
            ...supplier,
            serviceId: fastest.service,
            average_time: fastest.average_time
          };
        }
      }
    } catch (err) {
      console.error(`שגיאה עם ${supplier.name}:`, err.response?.data || err.message);
    }
  }

  if (!bestService) {
    return res.status(400).json({ message: "לא נמצא שירות מהיר להזמנה." });
  }

  try {
    const orderResponse = await axios.post(bestService.url, {
      key: bestService.key,
      action: "add",
      service: bestService.serviceId,
      link,
      quantity: amount
    });

    console.log(`נבחר שירות מהיר דרך ${bestService.name}:`, orderResponse.data);

    res.json({
      success: true,
      message: `ההזמנה נשלחה דרך ${bestService.name}, זמן ממוצע: ${bestService.average_time} דקות, מספר הזמנה: ${orderResponse.data.order || "N/A"}`
    });
  } catch (error) {
    console.error("שגיאה בביצוע ההזמנה:", error.response?.data || error.message);
    res.status(500).json({ message: "הזמנה נכשלה." });
  }
});

app.listen(PORT, () => {
  console.log(`Adi-Boost Fastest Server רץ על פורט ${PORT}`);
});
