/**
 * AI Bridge Service
 * Acts as the node proxy communicating with Python FastAPI AI Service.
 * Implements deterministic fallback logic if AI Service is unreachable or API key missing.
 */

const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Generate AI Trade Coach Analysis
 */
const getAICoachAnalysis = async (userPortfolioData) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/coach`, userPortfolioData, {
      timeout: 4000
    });
    return response.data;
  } catch (error) {
    console.log('AI Service offline or error, invoking Local Demo AI Coach fallback...');
    return generateFallbackAICoach(userPortfolioData);
  }
};

/**
 * Generate AI Single Trade Analysis
 */
const getAITradeAnalysis = async (tradeData) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/trade-analysis`, tradeData, {
      timeout: 4000
    });
    return response.data;
  } catch (error) {
    console.log('AI Service offline or error, invoking Local Demo Trade Analysis fallback...');
    return generateFallbackTradeAnalysis(tradeData);
  }
};

/**
 * Generate RAG Chat Response
 */
const getAIChatResponse = async (question, conversationHistory = []) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/ai/chat`, {
      question,
      history: conversationHistory
    }, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    console.log('AI Service offline or error, invoking Local Demo RAG Chat fallback...');
    return generateFallbackRAGChat(question);
  }
};

/* ==================== FALLBACK ENGINES ==================== */

const generateFallbackAICoach = (data) => {
  const { performance = {}, risk = {}, behavior = {}, holdings = [] } = data;
  const winRate = performance.winRate || 65;
  const conc = risk.portfolioConcentration || 25;
  const sharpe = risk.sharpeRatio || 1.2;

  const overallScore = Math.min(95, Math.max(45, Math.round((winRate * 0.4) + (sharpe * 25) - (conc * 0.2) + 20)));
  const riskScore = Math.min(95, Math.max(40, Math.round(100 - (conc * 0.6) - (risk.maxDrawdown * 3) + 15)));
  const strategyScore = Math.min(95, Math.max(50, Math.round((performance.profitFactor * 25) + 30)));

  const insights = [
    `Portfolio is ${conc > 35 ? 'heavily concentrated' : 'well-balanced'} with ${conc}% invested in your top holding.`,
    winRate > 60 
      ? `Strong win rate of ${winRate}%. You are letting your winning trades develop nicely.`
      : `Win rate is currently ${winRate}%. Focus on improving entry setups and risk-to-reward ratios.`,
    holdings.length < 3 
      ? `Holding only ${holdings.length} stock(s). Consider adding 2-3 non-correlated sectors for risk mitigation.`
      : `Diversified across ${holdings.length} stocks. Good sector dispersion.`,
    `Your profit factor is ${performance.profitFactor || 1.5}, indicating robust profitability per unit of risk.`
  ];

  const recommendations = [
    `Maintain strict stop-loss rules to keep maximum drawdown under 5%.`,
    `Avoid revenge trading immediately after a losing trade; adhere strictly to your trade plan.`,
    `Rebalance portfolio to limit individual stock concentration below 20%.`,
    `Position sizing: Limit any single trade to a maximum of 5-8% of total virtual capital.`
  ];

  return {
    isDemoFallback: true,
    message: "AI API key not configured — running in demo educational mode.",
    overallScore,
    riskScore,
    strategyScore,
    insights,
    recommendations
  };
};

const generateFallbackTradeAnalysis = (trade) => {
  const isBuy = trade.side === 'BUY';
  const isProfit = trade.realizedPnL > 0;

  return {
    isDemoFallback: true,
    message: "AI API key not configured — running in demo educational mode.",
    tradeQualityScore: isProfit ? 88 : 62,
    riskAssessment: `Risk taken was reasonable at approximately 2.5% of total portfolio value. Entry price ${trade.entryPrice} provided solid support level context.`,
    mistakeIdentification: isProfit 
      ? "No major execution mistakes. Exit target was met according to plan."
      : "Position size was slightly larger than recommended relative to stop-loss distance.",
    possibleImprovement: isBuy 
      ? "Consider staggering entry orders (scaling in) instead of full position sizing at single price point."
      : "Trail your stop loss once trade moves into 1:1 risk-reward to lock in baseline gains.",
    fullAnalysisText: `Educational Breakdown for ${trade.symbol} (${trade.side}): This trade demonstrated clear disciplined execution. ${isProfit ? 'Profit target was achieved smoothly.' : 'Loss was controlled within acceptable risk parameters.'} Remember that paper trading builds the psychological habit of consistent execution.`
  };
};

const generateFallbackRAGChat = (question) => {
  const q = question.toLowerCase();
  let answer = "Financial markets reward discipline, proper position sizing, and systematic risk management. Always diversify across sectors and keep individual trade risk below 2-5% of total capital.";
  let sources = ["Investing Fundamentals Guide", "Risk Management Handbook"];

  if (q.includes('sharpe') || q.includes('ratio')) {
    answer = "The Sharpe Ratio measures excess return per unit of total risk (volatility). Formula: (Portfolio Return - Risk-Free Rate) / Standard Deviation. A Sharpe ratio > 1.0 is considered good, > 2.0 is very good, and > 3.0 is exceptional.";
    sources = ["Financial Ratios & Portfolio Metrics"];
  } else if (q.includes('diversif') || q.includes('portfolio')) {
    answer = "Portfolio diversification is the strategy of spreading investments across various asset classes, sectors, and geographies to reduce unsystematic risk. By holding uncorrelated assets, poor performance in one stock can be offset by gains in others.";
    sources = ["Portfolio Management & Diversification"];
  } else if (q.includes('drawdown')) {
    answer = "Maximum Drawdown (MDD) measures the peak-to-trough decline of an investment portfolio during a specific period. It is expressed as a percentage and represents the worst-case scenario loss an investor experienced before a new peak was reached.";
    sources = ["Risk Management & Drawdown Analysis"];
  } else if (q.includes('p/e') || q.includes('pe')) {
    answer = "The Price-to-Earnings (P/E) ratio compares a company's stock price to its earnings per share. A higher P/E suggests investors expect higher future growth, whereas a lower P/E may indicate value or market caution.";
    sources = ["Fundamental Analysis Basics"];
  }

  return {
    isDemoFallback: true,
    message: "AI API key not configured — running in demo educational mode.",
    answer,
    sources
  };
};

module.exports = {
  getAICoachAnalysis,
  getAITradeAnalysis,
  getAIChatResponse
};
