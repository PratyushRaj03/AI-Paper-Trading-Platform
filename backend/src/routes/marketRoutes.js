const express = require('express');
const router = express.Router();
const marketDataService = require('../services/marketDataService');

// Search & List Stocks
router.get('/stocks', (req, res) => {
  const query = req.query.query || '';
  const stocks = marketDataService.getStockList(query);
  res.json({ success: true, stocks });
});

// Get Single Stock Details
router.get('/stocks/:symbol', (req, res) => {
  const stock = marketDataService.getStockBySymbol(req.params.symbol);
  if (!stock) {
    return res.status(404).json({ success: false, message: `Stock '${req.params.symbol}' not found` });
  }
  res.json({ success: true, stock });
});

// Get Stock Price History Candles (1D, 1W, 1M, 3M, 1Y)
router.get('/stocks/:symbol/history', (req, res) => {
  const timeframe = req.query.timeframe || '1D';
  const history = marketDataService.getHistoricalData(req.params.symbol, timeframe);
  res.json({ success: true, symbol: req.params.symbol, timeframe, history });
});

module.exports = router;
