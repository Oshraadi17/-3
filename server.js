const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = "8fb07bbae1e48bfc9ad4b0d8b280447b";
const API_URL = "https://smmfollows.com/api/v2";

app.use(bodyParser.json());
app.use(express.static(__dirname));

app.post("/api/order", async (req, res) => {
    const { service, link, quantity } = req.body;

    const serviceIds = {
        likes: 8300,
        views: 2026,
        followers: 13143,
        comments: 1234
    };

    const serviceId = serviceIds[service];
    if (!serviceId) {
        return res.status(400).json({ message: "שירות לא קיים." });
    }

    try {
        const response = await axios.post(API_URL, {
            key: API_KEY,
            action: "add",
            service: serviceId,
            link: link,
            quantity: quantity
        });

        if (response.data && response.data.order) {
            res.json({ message: `ההזמנה בוצעה! מספר הזמנה: ${response.data.order}` });
        } else {
            res.json({ message: "משהו השתבש, נסה שוב מאוחר יותר." });
        }
    } catch (error) {
        res.status(500).json({ message: "שגיאה מהשרת: לא הצלחנו לבצע את ההזמנה." });
    }
});

app.listen(PORT, () => {
    console.log(`Adi-Boost server running on port ${PORT}`);
});