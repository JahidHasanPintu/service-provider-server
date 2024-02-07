// app.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config/db');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const bidsRoutes = require('./routes/bids');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const statsRoutes = require('./routes/stats');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/services', servicesRoutes);
app.use('/bids', bidsRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/stats', statsRoutes);

app.get("/",(req,res)=>{
  res.send("Hi, Welcome to service provider  ");
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
