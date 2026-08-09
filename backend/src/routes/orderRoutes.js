const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Order = require('../models/Order');

// Get Orders (Tabs: OPEN, EXECUTED, CANCELLED, ALL)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { user: req.user.id };

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

// Cancel Eligible Limit Order
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'OPEN') {
      return res.status(400).json({ success: false, message: `Cannot cancel order with status '${order.status}'` });
    }

    order.status = 'CANCELLED';
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
