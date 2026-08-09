const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const marketDataService = require('../services/marketDataService');
const { syncUserPortfolio } = require('../services/tradingEngine');

// Get User Portfolio Overview
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    let portfolio = await syncUserPortfolio(req.user.id);
    if (!portfolio) {
      portfolio = await Portfolio.findOne({ user: req.user.id });
    }
    res.json({ success: true, portfolio });
  } catch (error) {
    next(error);
  }
});

// Get User Portfolio Holdings with Live Quotes & P&L Calculation
router.get('/holdings', authMiddleware, async (req, res, next) => {
  try {
    const rawHoldings = await Holding.find({ user: req.user.id, quantity: { $gt: 0 } });
    
    const holdings = rawHoldings.map(h => {
      const quote = marketDataService.getStockBySymbol(h.symbol);
      const currentPrice = quote ? quote.price : h.averagePrice;
      const marketValue = Number((h.quantity * currentPrice).toFixed(2));
      const totalCost = Number((h.quantity * h.averagePrice).toFixed(2));
      const unrealizedPnL = Number((marketValue - totalCost).toFixed(2));
      const returnPercent = totalCost > 0 ? Number(((unrealizedPnL / totalCost) * 100).toFixed(2)) : 0;

      return {
        _id: h._id,
        symbol: h.symbol,
        companyName: h.companyName,
        sector: h.sector,
        quantity: h.quantity,
        averagePrice: h.averagePrice,
        currentPrice,
        marketValue,
        unrealizedPnL,
        returnPercent,
        isPositive: unrealizedPnL >= 0
      };
    });

    res.json({ success: true, holdings });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
