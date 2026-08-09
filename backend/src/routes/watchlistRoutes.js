const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Watchlist = require('../models/Watchlist');
const marketDataService = require('../services/marketDataService');

// Get Watchlist Stocks with Prices
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    let watchlist = await Watchlist.findOne({ user: req.user.id });
    if (!watchlist) {
      watchlist = await Watchlist.create({ user: req.user.id, symbols: ['AAPL', 'MSFT', 'NVDA'] });
    }

    const stocks = watchlist.symbols
      .map(sym => marketDataService.getStockBySymbol(sym))
      .filter(Boolean);

    res.json({ success: true, symbols: watchlist.symbols, stocks });
  } catch (error) {
    next(error);
  }
});

// Add Stock to Watchlist
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { symbol } = req.body;
    if (!symbol) return res.status(400).json({ success: false, message: 'Stock symbol required' });

    const upperSymbol = symbol.toUpperCase();
    let watchlist = await Watchlist.findOne({ user: req.user.id });
    if (!watchlist) {
      watchlist = new Watchlist({ user: req.user.id, symbols: [] });
    }

    if (!watchlist.symbols.includes(upperSymbol)) {
      watchlist.symbols.push(upperSymbol);
      await watchlist.save();
    }

    res.json({ success: true, message: `Added ${upperSymbol} to watchlist`, symbols: watchlist.symbols });
  } catch (error) {
    next(error);
  }
});

// Remove Stock from Watchlist
router.delete('/:symbol', authMiddleware, async (req, res, next) => {
  try {
    const upperSymbol = req.params.symbol.toUpperCase();
    let watchlist = await Watchlist.findOne({ user: req.user.id });
    if (watchlist) {
      watchlist.symbols = watchlist.symbols.filter(s => s !== upperSymbol);
      await watchlist.save();
    }

    res.json({ success: true, message: `Removed ${upperSymbol} from watchlist`, symbols: watchlist ? watchlist.symbols : [] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
