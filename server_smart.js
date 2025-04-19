
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = "8fb07bbae1e48bfc9ad4b0d8b280447b";
const API_URL = "https://smmfollows.com/api/v2";

app.use(bodyParser.json());
app.use(express.static(__dirname));

const SERVICE_KEYWORDS = {
    likes: ["like", "likes"],
    views: ["view", "views"],
    followers: ["follower", "followers"],
    comments: ["comment", "comments"]
};

async function getFastestService(serviceType) {
    try {
        const { data } = await axios.post(API_URL, {
            key: API_KEY,
            action: "services"
        });

        const keywords = SERVICE_KEYWORDS[serviceType];
        if (!keywords) return null;

        const filtered = data.filter(service =>
            service.type === "Default" &&
            service.status === "Active" &&
            keywords.some(keyword =>
                service.name.toLowerCase().includes(keyword)
            )
        );

        if (filtered.length === 0) return null;

        filtered.sort((a, b) => a.average_time - b.average_time);
        return filtered[0].service;
    } catch (error) {
        console.error("שגיאה בקבלת רשימת שירותים:", error.message);
        return null;
    }
}

app.post("/api/order", async (req, res) => {
    const { service, link, quantity } = req.body;

    const serviceId = await getFastestService(service);
    if (!serviceId) {
        return res.status(400).json({ message: "לא נמצא שירות מתאים לבקשה שלך." });
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
    console.log(`Adi-Boost חכם רץ על פורט ${PORT}`);
});
