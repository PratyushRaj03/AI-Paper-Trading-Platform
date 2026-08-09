const mongoose = require('mongoose');

const performanceSnapshotSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    portfolioValue: { type: Number, required: true },
    cashBalance: { type: Number, required: true },
    investedAmount: { type: Number, required: true },
    dailyPnL: { type: Number, default: 0 },
    overallPnL: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PerformanceSnapshot', performanceSnapshotSchema);
