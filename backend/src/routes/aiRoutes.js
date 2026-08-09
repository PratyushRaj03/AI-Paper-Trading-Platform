const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const aiBridgeService = require('../services/aiBridgeService');
const analyticsEngine = require('../services/analyticsEngine');
const Holding = require('../models/Holding');
const Trade = require('../models/Trade');
const AIConversation = require('../models/AIConversation');
const AITradeAnalysis = require('../models/AITradeAnalysis');

// AI Trade Coach Analysis
router.post('/coach', authMiddleware, async (req, res, next) => {
  try {
    const analytics = await analyticsEngine.calculateUserAnalytics(req.user.id);
    const holdings = await Holding.find({ user: req.user.id });
    const recentTrades = await Trade.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(10);

    const coachInputData = {
      user: req.user,
      performance: analytics.performance,
      risk: analytics.risk,
      behavior: analytics.behavior,
      holdings: holdings.map(h => ({ symbol: h.symbol, qty: h.quantity, avgPrice: h.averagePrice, sector: h.sector })),
      recentTradesCount: recentTrades.length
    };

    const coachResult = await aiBridgeService.getAICoachAnalysis(coachInputData);
    res.json({ success: true, ...coachResult });
  } catch (error) {
    next(error);
  }
});

// Single Historical Trade AI Review
router.post('/trade-analysis', authMiddleware, async (req, res, next) => {
  try {
    const { tradeId } = req.body;
    if (!tradeId) return res.status(400).json({ success: false, message: 'tradeId required' });

    const trade = await Trade.findOne({ _id: tradeId, user: req.user.id });
    if (!trade) return res.status(404).json({ success: false, message: 'Trade record not found' });

    // Check if already cached
    let cachedAnalysis = await AITradeAnalysis.findOne({ trade: trade._id, user: req.user.id });
    if (cachedAnalysis) {
      return res.json({
        success: true,
        trade,
        analysis: {
          tradeQualityScore: cachedAnalysis.tradeQualityScore,
          riskAssessment: cachedAnalysis.riskAssessment,
          mistakeIdentification: cachedAnalysis.mistakeIdentification,
          possibleImprovement: cachedAnalysis.possibleImprovement,
          fullAnalysisText: cachedAnalysis.fullAnalysisText
        }
      });
    }

    const aiResult = await aiBridgeService.getAITradeAnalysis({
      tradeId: trade._id,
      symbol: trade.symbol,
      side: trade.side,
      quantity: trade.quantity,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      realizedPnL: trade.realizedPnL,
      totalValue: trade.totalValue,
      createdAt: trade.createdAt
    });

    // Cache analysis in MongoDB
    await AITradeAnalysis.create({
      user: req.user.id,
      trade: trade._id,
      tradeQualityScore: aiResult.tradeQualityScore || 75,
      riskAssessment: aiResult.riskAssessment || '',
      mistakeIdentification: aiResult.mistakeIdentification || '',
      possibleImprovement: aiResult.possibleImprovement || '',
      fullAnalysisText: aiResult.fullAnalysisText || ''
    });

    res.json({ success: true, trade, analysis: aiResult });
  } catch (error) {
    next(error);
  }
});

// Financial Assistant RAG Chat
router.post('/chat', authMiddleware, async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question text required' });
    }

    let conversation = await AIConversation.findOne({ user: req.user.id });
    if (!conversation) {
      conversation = new AIConversation({ user: req.user.id, messages: [] });
    }

    // Format chat history for context
    const history = conversation.messages.slice(-6).map(m => ({
      sender: m.sender,
      text: m.text
    }));

    const aiResponse = await aiBridgeService.getAIChatResponse(question, history);

    // Save user message and AI response
    conversation.messages.push({
      sender: 'user',
      text: question,
      timestamp: new Date()
    });

    conversation.messages.push({
      sender: 'ai',
      text: aiResponse.answer,
      sources: aiResponse.sources || [],
      timestamp: new Date()
    });

    await conversation.save();

    res.json({
      success: true,
      answer: aiResponse.answer,
      sources: aiResponse.sources || [],
      isDemoFallback: aiResponse.isDemoFallback || false,
      message: aiResponse.message || null
    });
  } catch (error) {
    next(error);
  }
});

// Get Chat Conversation History
router.get('/chat/history', authMiddleware, async (req, res, next) => {
  try {
    const conversation = await AIConversation.findOne({ user: req.user.id });
    res.json({ success: true, messages: conversation ? conversation.messages : [] });
  } catch (error) {
    next(error);
  }
});

// Clear Chat History
router.delete('/chat/history', authMiddleware, async (req, res, next) => {
  try {
    await AIConversation.deleteOne({ user: req.user.id });
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
