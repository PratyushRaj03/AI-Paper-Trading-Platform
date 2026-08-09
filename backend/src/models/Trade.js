const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    symbol: { type: String, required: true, uppercase: true },
    companyName: { type: String },
    side: { type: String, enum: ['BUY', 'SELL'], required: true },
    quantity: { type: Number, required: true },
    entryPrice: { type: Number, required: true },
    exitPrice: { type: Number, default: 0 },
    realizedPnL: { type: Number, default: 0 },
    totalValue: { type: Number, required: true },
    status: { type: String, enum: ['EXECUTED'], default: 'EXECUTED' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trade', tradeSchema);
