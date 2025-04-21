
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(express.static('.'));

app.post('/api/order', (req, res) => {
    const { serviceType, link, quantity } = req.body;
    if (!serviceType || !link || !quantity) {
        return res.status(400).json({ message: 'שגיאה: נתונים חסרים' });
    }

    // סימולציית שליחת ההזמנה
    console.log('התקבלה הזמנה:', { serviceType, link, quantity });
    res.json({ message: 'ההזמנה נשלחה בהצלחה' });
});

app.listen(PORT, () => {
    console.log(`Adi Boost Server is running on port ${PORT}`);
});
