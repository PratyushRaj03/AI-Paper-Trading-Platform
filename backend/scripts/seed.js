/**
 * Database Seed Script
 * Pre-populates local MongoDB with a Demo User (demo@example.com / Demo@123),
 * initial virtual cash (₹10,00,000), sample holdings, orders, trades, and watchlist.
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../src/models/User');
const Portfolio = require('../src/models/Portfolio');
const Holding = require('../src/models/Holding');
const Order = require('../src/models/Order');
const Trade = require('../src/models/Trade');
const Watchlist = require('../src/models/Watchlist');
const { syncUserPortfolio } = require('../src/services/tradingEngine');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paper-trading';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    console.log('Clearing existing demo data...');
    await User.deleteMany({ email: 'demo@example.com' });

    console.log('Creating Demo User...');
    const hashedPassword = await bcrypt.hash('Demo@123', 10);
    
    const user = new User({
      name: 'Demo Trader',
      email: 'demo@example.com',
      password: hashedPassword,
      virtualCash: 750000 // ₹7,50,000 cash remaining after ₹2,50,000 invested
    });
    await user.save();

    console.log('Creating Demo Watchlist...');
    await Watchlist.create({
      user: user._id,
      symbols: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA']
    });

    console.log('Creating Demo Holdings...');
    const holdingsData = [
      { symbol: 'AAPL', companyName: 'Apple Inc.', quantity: 25, averagePrice: 175.00, sector: 'Technology' },
      { symbol: 'MSFT', companyName: 'Microsoft Corporation', quantity: 15, averagePrice: 400.00, sector: 'Technology' },
      { symbol: 'NVDA', companyName: 'NVIDIA Corporation', quantity: 40, averagePrice: 115.00, sector: 'Technology' },
      { symbol: 'GOOGL', companyName: 'Alphabet Inc.', quantity: 30, averagePrice: 168.00, sector: 'Communication Services' }
    ];

    for (const h of holdingsData) {
      await Holding.create({
        user: user._id,
        ...h
      });
    }

    console.log('Creating Demo Orders & Trades History...');
    const tradesData = [
      { symbol: 'AAPL', companyName: 'Apple Inc.', side: 'BUY', quantity: 25, entryPrice: 175.00, totalValue: 4375, realizedPnL: 0, dateOffsetDays: 10 },
      { symbol: 'MSFT', companyName: 'Microsoft Corporation', side: 'BUY', quantity: 15, entryPrice: 400.00, totalValue: 6000, realizedPnL: 0, dateOffsetDays: 8 },
      { symbol: 'NVDA', companyName: 'NVIDIA Corporation', side: 'BUY', quantity: 40, entryPrice: 115.00, totalValue: 4600, realizedPnL: 0, dateOffsetDays: 5 },
      { symbol: 'TSLA', companyName: 'Tesla, Inc.', side: 'BUY', quantity: 20, entryPrice: 200.00, totalValue: 4000, realizedPnL: 0, dateOffsetDays: 4 },
      { symbol: 'TSLA', companyName: 'Tesla, Inc.', side: 'SELL', quantity: 20, entryPrice: 200.00, exitPrice: 218.90, totalValue: 4378, realizedPnL: 378, dateOffsetDays: 2 }
    ];

    for (const t of tradesData) {
      const order = await Order.create({
        user: user._id,
        symbol: t.symbol,
        companyName: t.companyName,
        type: 'MARKET',
        side: t.side,
        quantity: t.quantity,
        targetPrice: t.entryPrice,
        executedPrice: t.exitPrice || t.entryPrice,
        status: 'EXECUTED',
        createdAt: new Date(Date.now() - t.dateOffsetDays * 86400000),
        executedAt: new Date(Date.now() - t.dateOffsetDays * 86400000)
      });

      await Trade.create({
        user: user._id,
        order: order._id,
        symbol: t.symbol,
        companyName: t.companyName,
        side: t.side,
        quantity: t.quantity,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice || 0,
        realizedPnL: t.realizedPnL,
        totalValue: t.totalValue,
        status: 'EXECUTED',
        createdAt: new Date(Date.now() - t.dateOffsetDays * 86400000)
      });
    }

    console.log('Syncing Demo Portfolio...');
    await syncUserPortfolio(user._id);

    console.log('----------------------------------------------------');
    console.log('SEED COMPLETE SUCCESSFULLY!');
    console.log('Demo Credentials:');
    console.log('  Email:    demo@example.com');
    console.log('  Password: Demo@123');
    console.log('  Virtual Money: ₹10,00,000');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
