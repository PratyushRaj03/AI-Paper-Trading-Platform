const mongoose = require('mongoose');

const aiTradeAnalysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    trade: { type: mongoose.Schema.Types.ObjectId, ref: 'Trade', required: true },
    tradeQualityScore: { type: Number, default: 75 },
    riskAssessment: { type: String, required: true },
    mistakeIdentification: { type: String, required: true },
    possibleImprovement: { type: String, required: true },
    fullAnalysisText: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AITradeAnalysis', aiTradeAnalysisSchema);
