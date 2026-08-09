const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('../backend/src/routes/authRoutes');
const marketRoutes = require('../backend/src/routes/marketRoutes');
const tradeRoutes = require('../backend/src/routes/tradeRoutes');
const orderRoutes = require('../backend/src/routes/orderRoutes');
const portfolioRoutes = require('../backend/src/routes/portfolioRoutes');
const watchlistRoutes = require('../backend/src/routes/watchlistRoutes');
const analyticsRoutes = require('../backend/src/routes/analyticsRoutes');
const aiRoutes = require('../backend/src/routes/aiRoutes');
const errorHandler = require('../backend/src/middleware/errorHandler');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Serverless MongoDB Connection Cache
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      await mongoose.connect(uri, {
        bufferCommands: false
      });
      isConnected = true;
    } catch (e) {
      console.log('Serverless MongoDB Connection Warning:', e.message);
    }
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/user', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Vercel Serverless',
    timestamp: new Date().toISOString(),
    demoMode: !process.env.MARKET_API_KEY || !process.env.AI_API_KEY
  });
});

app.use(errorHandler);

module.exports = app;
