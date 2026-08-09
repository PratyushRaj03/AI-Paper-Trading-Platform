const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const tradingEngine = require('../services/tradingEngine');
const Trade = require('../models/Trade');

// Execute Buy Order (Market or Limit)
router.post('/buy', authMiddleware, async (req, res, next) => {
  try {
    const { symbol, quantity, type, limitPrice } = req.body;
    if (!symbol || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Valid symbol and positive quantity required' });
    }

    const result = await tradingEngine.executeBuyOrder({
      userId: req.user.id,
      symbol,
      quantity: Number(quantity),
      type: type || 'MARKET',
      limitPrice: limitPrice ? Number(limitPrice) : null
    });

    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// Execute Sell Order (Market or Limit)
router.post('/sell', authMiddleware, async (req, res, next) => {
  try {
    const { symbol, quantity, type, limitPrice } = req.body;
    if (!symbol || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Valid symbol and positive quantity required' });
    }

    const result = await tradingEngine.executeSellOrder({
      userId: req.user.id,
      symbol,
      quantity: Number(quantity),
      type: type || 'MARKET',
      limitPrice: limitPrice ? Number(limitPrice) : null
    });

    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// Get User Trade History with Search, Filter & Pagination
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { search, side, symbol, page = 1, limit = 20 } = req.query;

    const query = { user: req.user.id };
    if (side) query.side = side.toUpperCase();
    if (symbol) query.symbol = symbol.toUpperCase();
    if (search) {
      query.$or = [
        { symbol: new RegExp(search, 'i') },
        { companyName: new RegExp(search, 'i') }
      ];
    }

    const total = await Trade.countDocuments(query);
    const trades = await Trade.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      trades,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
