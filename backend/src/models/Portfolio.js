const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    totalValue: { type: Number, required: true, default: 1000000 },
    cashBalance: { type: Number, required: true, default: 1000000 },
    investedAmount: { type: Number, default: 0 },
    todaysPnL: { type: Number, default: 0 },
    overallPnL: { type: Number, default: 0 },
    returnPercentage: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
