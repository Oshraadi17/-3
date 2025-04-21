
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.post('/price', (req, res) => {
    const { platform, service, quantity } = req.body;
    if (!quantity || isNaN(quantity)) {
        return res.json({ message: 'Invalid quantity' });
    }
    const price = 0.0003 * parseInt(quantity);  // Example price per unit
    res.json({ price });
});

app.post('/order', (req, res) => {
    const { platform, service, usernameOrUrl, quantity } = req.body;
    if (!platform || !service || !usernameOrUrl || !quantity) {
        return res.json({ message: 'Missing required fields' });
    }
    // Normally API call to supplier would go here
    res.json({ message: `Order placed: ${platform} ${service}, ${quantity} units to ${usernameOrUrl}` });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
