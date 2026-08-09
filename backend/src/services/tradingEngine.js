/**
 * Paper Trading Engine
 * Validates cash, holdings, executes BUY & SELL market and limit orders,
 * updates portfolio cash balance, calculates realized P&L and holding average price.
 */

const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const Order = require('../models/Order');
const Trade = require('../models/Trade');
const marketDataService = require('./marketDataService');

/**
 * Recalculates user portfolio total value, invested amount, and P&L
 */
const syncUserPortfolio = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const holdings = await Holding.find({ user: userId, quantity: { $gt: 0 } });
  
  let investedAmount = 0;
  let currentHoldingsValue = 0;

  holdings.forEach(h => {
    const quote = marketDataService.getStockBySymbol(h.symbol);
    const currentPrice = quote ? quote.price : h.averagePrice;
    investedAmount += h.quantity * h.averagePrice;
    currentHoldingsValue += h.quantity * currentPrice;
  });

  const totalValue = Number((user.virtualCash + currentHoldingsValue).toFixed(2));
  const overallPnL = Number((totalValue - 1000000).toFixed(2)); // Base cash ₹10,00,000
  const returnPercentage = Number(((overallPnL / 1000000) * 100).toFixed(2));

  let portfolio = await Portfolio.findOne({ user: userId });
  if (!portfolio) {
    portfolio = new Portfolio({
      user: userId,
      totalValue,
      cashBalance: user.virtualCash,
      investedAmount,
      todaysPnL: 0,
      overallPnL,
      returnPercentage
    });
  } else {
    portfolio.totalValue = totalValue;
    portfolio.cashBalance = user.virtualCash;
    portfolio.investedAmount = investedAmount;
    portfolio.overallPnL = overallPnL;
    portfolio.returnPercentage = returnPercentage;
  }

  await portfolio.save();
  return portfolio;
};

/**
 * Execute Buy Order
 */
const executeBuyOrder = async ({ userId, symbol, quantity, type = 'MARKET', limitPrice = null }) => {
  const stock = marketDataService.getStockBySymbol(symbol);
  if (!stock) throw new Error(`Stock symbol '${symbol}' not found`);

  const executionPrice = type === 'MARKET' ? stock.price : limitPrice;
  const totalCost = Number((executionPrice * quantity).toFixed(2));

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (user.virtualCash < totalCost) {
    throw new Error(`Insufficient funds. Required: ₹${totalCost.toLocaleString('en-IN')}, Available: ₹${user.virtualCash.toLocaleString('en-IN')}`);
  }

  // Create Order
  const order = new Order({
    user: userId,
    symbol: stock.symbol,
    companyName: stock.name,
    type,
    side: 'BUY',
    quantity,
    targetPrice: executionPrice,
    executedPrice: executionPrice,
    status: type === 'MARKET' ? 'EXECUTED' : 'OPEN',
    executedAt: type === 'MARKET' ? new Date() : null
  });
  await order.save();

  if (type === 'LIMIT') {
    return { order, message: 'Limit buy order placed successfully' };
  }

  // Deduct user virtual cash
  user.virtualCash = Number((user.virtualCash - totalCost).toFixed(2));
  await user.save();

  // Update Holding (weighted average price calculation)
  let holding = await Holding.findOne({ user: userId, symbol: stock.symbol });
  if (!holding) {
    holding = new Holding({
      user: userId,
      symbol: stock.symbol,
      companyName: stock.name,
      quantity,
      averagePrice: executionPrice,
      sector: stock.sector
    });
  } else {
    const totalQty = holding.quantity + quantity;
    const newAvgPrice = ((holding.quantity * holding.averagePrice) + (quantity * executionPrice)) / totalQty;
    holding.quantity = totalQty;
    holding.averagePrice = Number(newAvgPrice.toFixed(2));
  }
  await holding.save();

  // Create Trade record
  const trade = new Trade({
    user: userId,
    order: order._id,
    symbol: stock.symbol,
    companyName: stock.name,
    side: 'BUY',
    quantity,
    entryPrice: executionPrice,
    totalValue: totalCost,
    status: 'EXECUTED'
  });
  await trade.save();

  await syncUserPortfolio(userId);

  return { order, trade, message: 'Buy order executed successfully' };
};

/**
 * Execute Sell Order
 */
const executeSellOrder = async ({ userId, symbol, quantity, type = 'MARKET', limitPrice = null }) => {
  const stock = marketDataService.getStockBySymbol(symbol);
  if (!stock) throw new Error(`Stock symbol '${symbol}' not found`);

  const holding = await Holding.findOne({ user: userId, symbol: stock.symbol });
  if (!holding || holding.quantity < quantity) {
    const availableQty = holding ? holding.quantity : 0;
    throw new Error(`Insufficient shares. You hold ${availableQty} shares of ${stock.symbol}, but attempted to sell ${quantity}.`);
  }

  const executionPrice = type === 'MARKET' ? stock.price : limitPrice;
  const totalProceeds = Number((executionPrice * quantity).toFixed(2));

  // Create Order
  const order = new Order({
    user: userId,
    symbol: stock.symbol,
    companyName: stock.name,
    type,
    side: 'SELL',
    quantity,
    targetPrice: executionPrice,
    executedPrice: executionPrice,
    status: type === 'MARKET' ? 'EXECUTED' : 'OPEN',
    executedAt: type === 'MARKET' ? new Date() : null
  });
  await order.save();

  if (type === 'LIMIT') {
    return { order, message: 'Limit sell order placed successfully' };
  }

  // Calculate Realized P&L
  const costBasis = holding.averagePrice * quantity;
  const realizedPnL = Number((totalProceeds - costBasis).toFixed(2));

  // Update Holding quantity
  holding.quantity -= quantity;
  if (holding.quantity === 0) {
    await Holding.deleteOne({ _id: holding._id });
  } else {
    await holding.save();
  }

  // Credit user cash
  const user = await User.findById(userId);
  user.virtualCash = Number((user.virtualCash + totalProceeds).toFixed(2));
  await user.save();

  // Create Trade record
  const trade = new Trade({
    user: userId,
    order: order._id,
    symbol: stock.symbol,
    companyName: stock.name,
    side: 'SELL',
    quantity,
    entryPrice: holding.averagePrice,
    exitPrice: executionPrice,
    realizedPnL,
    totalValue: totalProceeds,
    status: 'EXECUTED'
  });
  await trade.save();

  await syncUserPortfolio(userId);

  return { order, trade, realizedPnL, message: 'Sell order executed successfully' };
};

/**
 * Process Open Limit Orders against current stock prices
 */
const checkAndExecuteLimitOrders = async () => {
  try {
    const openOrders = await Order.find({ status: 'OPEN' });
    for (const order of openOrders) {
      const stock = marketDataService.getStockBySymbol(order.symbol);
      if (!stock) continue;

      if (order.side === 'BUY' && stock.price <= order.targetPrice) {
        order.status = 'EXECUTED';
        order.executedPrice = stock.price;
        order.executedAt = new Date();
        await order.save();

        const user = await User.findById(order.user);
        const totalCost = Number((stock.price * order.quantity).toFixed(2));

        if (user && user.virtualCash >= totalCost) {
          user.virtualCash = Number((user.virtualCash - totalCost).toFixed(2));
          await user.save();

          let holding = await Holding.findOne({ user: order.user, symbol: order.symbol });
          if (!holding) {
            holding = new Holding({
              user: order.user,
              symbol: order.symbol,
              companyName: stock.name,
              quantity: order.quantity,
              averagePrice: stock.price,
              sector: stock.sector
            });
          } else {
            const totalQty = holding.quantity + order.quantity;
            const newAvgPrice = ((holding.quantity * holding.averagePrice) + (order.quantity * stock.price)) / totalQty;
            holding.quantity = totalQty;
            holding.averagePrice = Number(newAvgPrice.toFixed(2));
          }
          await holding.save();

          await Trade.create({
            user: order.user,
            order: order._id,
            symbol: order.symbol,
            companyName: stock.name,
            side: 'BUY',
            quantity: order.quantity,
            entryPrice: stock.price,
            totalValue: totalCost,
            status: 'EXECUTED'
          });

          await syncUserPortfolio(order.user);
        }
      } else if (order.side === 'SELL' && stock.price >= order.targetPrice) {
        const holding = await Holding.findOne({ user: order.user, symbol: order.symbol });
        if (holding && holding.quantity >= order.quantity) {
          order.status = 'EXECUTED';
          order.executedPrice = stock.price;
          order.executedAt = new Date();
          await order.save();

          const totalProceeds = Number((stock.price * order.quantity).toFixed(2));
          const realizedPnL = Number((totalProceeds - (holding.averagePrice * order.quantity)).toFixed(2));

          holding.quantity -= order.quantity;
          if (holding.quantity === 0) {
            await Holding.deleteOne({ _id: holding._id });
          } else {
            await holding.save();
          }

          const user = await User.findById(order.user);
          user.virtualCash = Number((user.virtualCash + totalProceeds).toFixed(2));
          await user.save();

          await Trade.create({
            user: order.user,
            order: order._id,
            symbol: order.symbol,
            companyName: stock.name,
            side: 'SELL',
            quantity: order.quantity,
            entryPrice: holding.averagePrice,
            exitPrice: stock.price,
            realizedPnL,
            totalValue: totalProceeds,
            status: 'EXECUTED'
          });

          await syncUserPortfolio(order.user);
        }
      }
    }
  } catch (err) {
    console.error('Error checking limit orders:', err.message);
  }
};

// Check limit orders every 5 seconds
setInterval(checkAndExecuteLimitOrders, 5000);

module.exports = {
  syncUserPortfolio,
  executeBuyOrder,
  executeSellOrder
};
