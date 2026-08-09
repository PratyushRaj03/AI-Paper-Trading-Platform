const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const analyticsEngine = require('../services/analyticsEngine');

// Get User Trading Analytics
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const analytics = await analyticsEngine.calculateUserAnalytics(req.user.id);
    res.json({ success: true, analytics });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
