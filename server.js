
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Adi Boost PRO API is live!');
});

// הוספת האזנה לפורט לפי Render
const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Adi Boost PRO server running on port ${port}`);
});
