const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true, uppercase: true },
    companyName: { type: String },
    type: { type: String, enum: ['MARKET', 'LIMIT'], default: 'MARKET' },
    side: { type: String, enum: ['BUY', 'SELL'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    targetPrice: { type: Number, required: true },
    executedPrice: { type: Number, default: 0 },
    status: { type: String, enum: ['OPEN', 'EXECUTED', 'CANCELLED'], default: 'OPEN' },
    executedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
