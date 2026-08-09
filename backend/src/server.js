const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { WebSocketServer } = require('ws');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const marketRoutes = require('./routes/marketRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const orderRoutes = require('./routes/orderRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const errorHandler = require('./middleware/errorHandler');
const marketDataService = require('./services/marketDataService');

const app = express();
const server = http.createServer(app);

// Enable CORS & JSON Parsing
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    demoMode: !process.env.MARKET_API_KEY || !process.env.AI_API_KEY
  });
});

// Central Error Handler
app.use(errorHandler);

// WebSocket Setup for Live Stock Price Ticks
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  // Send initial stock quotes immediately
  const initialStocks = marketDataService.getStockList();
  ws.send(JSON.stringify({ type: 'INITIAL_QUOTES', data: initialStocks }));

  // Broadcast price ticks every 3 seconds
  const interval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      const updatedStocks = marketDataService.getStockList();
      ws.send(JSON.stringify({ type: 'PRICE_TICK', data: updatedStocks }));
    }
  }, 3000);

  ws.on('close', () => {
    clearInterval(interval);
  });
});

// Connect to MongoDB & Start Server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paper-trading';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully:', MONGODB_URI);
    server.listen(PORT, () => {
      console.log(`Backend Server listening on port ${PORT}`);
      console.log(`WebSocket server active on ws://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    console.log('Starting server in fallback mode...');
    server.listen(PORT, () => {
      console.log(`Backend Server listening on port ${PORT} (MongoDB reconnecting...)`);
    });
  });
