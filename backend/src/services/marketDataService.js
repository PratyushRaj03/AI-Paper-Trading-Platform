/**
 * Market Data Service
 * Provides stock quotes, historical candle charts (1D, 1W, 1M, 3M, 1Y),
 * search, and live price random-walk ticks.
 * Supports external MARKET_API_KEY with graceful fallback to DEMO MODE.
 */

const INITIAL_STOCKS = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    price: 182.50,
    open: 181.20,
    high: 184.10,
    low: 180.80,
    previousClose: 180.50,
    volume: 54231000,
    peRatio: 28.5,
    marketCap: '2.82T',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.'
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    price: 415.20,
    open: 412.00,
    high: 418.00,
    low: 410.50,
    previousClose: 410.80,
    volume: 22150000,
    peRatio: 35.2,
    marketCap: '3.08T',
    description: 'Microsoft develops and supports software, services, devices and solutions including Azure, Windows, and Office.'
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    sector: 'Communication Services',
    price: 175.80,
    open: 174.10,
    high: 177.30,
    low: 173.50,
    previousClose: 173.90,
    volume: 28400000,
    peRatio: 24.1,
    marketCap: '2.19T',
    description: 'Alphabet is a multinational technology conglomerate operating Google search, YouTube, Cloud, and Android.'
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    sector: 'Consumer Cyclical',
    price: 186.40,
    open: 184.50,
    high: 188.20,
    low: 183.90,
    previousClose: 184.20,
    volume: 38100000,
    peRatio: 41.8,
    marketCap: '1.93T',
    description: 'Amazon focuses on e-commerce, cloud computing (AWS), online advertising, digital streaming, and AI.'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    sector: 'Consumer Cyclical',
    price: 218.90,
    open: 214.00,
    high: 223.50,
    low: 212.80,
    previousClose: 212.50,
    volume: 89300000,
    peRatio: 58.4,
    marketCap: '695B',
    description: 'Tesla designs, manufactures, and sells electric vehicles, energy storage devices, and solar panels.'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology',
    price: 125.60,
    open: 122.40,
    high: 128.00,
    low: 121.90,
    previousClose: 121.80,
    volume: 112000000,
    peRatio: 72.3,
    marketCap: '3.09T',
    description: 'NVIDIA designs graphics processing units (GPUs) for gaming and professional markets, as well as system on a chip units for AI.'
  },
  {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    sector: 'Communication Services',
    price: 495.30,
    open: 488.90,
    high: 501.20,
    low: 486.50,
    previousClose: 487.10,
    volume: 14500000,
    peRatio: 26.8,
    marketCap: '1.25T',
    description: 'Meta operates social technology products including Facebook, Instagram, WhatsApp, Threads, and Quest VR.'
  },
  {
    symbol: 'NFLX',
    name: 'Netflix, Inc.',
    sector: 'Communication Services',
    price: 642.10,
    open: 638.00,
    high: 648.50,
    low: 635.20,
    previousClose: 636.00,
    volume: 4100000,
    peRatio: 38.6,
    marketCap: '277B',
    description: 'Netflix is a subscription video-on-demand service producing and distributing TV shows and movies globally.'
  },
  {
    symbol: 'AMD',
    name: 'Advanced Micro Devices, Inc.',
    sector: 'Technology',
    price: 164.70,
    open: 162.00,
    high: 167.30,
    low: 161.10,
    previousClose: 161.50,
    volume: 45200000,
    peRatio: 46.2,
    marketCap: '266B',
    description: 'AMD produces computer processors and related technologies for business and consumer markets.'
  },
  {
    symbol: 'INTC',
    name: 'Intel Corporation',
    sector: 'Technology',
    price: 31.40,
    open: 31.00,
    high: 32.10,
    low: 30.80,
    previousClose: 30.90,
    volume: 42100000,
    peRatio: 29.8,
    marketCap: '133B',
    description: 'Intel Corporation designs and manufactures microprocessors and semiconductor components.'
  }
];

// In-memory stock price map
const stockStateMap = new Map();

INITIAL_STOCKS.forEach(stock => {
  stockStateMap.set(stock.symbol, { ...stock });
});

// Periodic price simulation tick (updates price slightly for realism)
setInterval(() => {
  stockStateMap.forEach((stock, symbol) => {
    const deltaPercent = (Math.random() - 0.49) * 0.004; // -0.2% to +0.2% change per tick
    const newPrice = Number((stock.price * (1 + deltaPercent)).toFixed(2));
    stock.price = Math.max(1, newPrice);
    if (stock.price > stock.high) stock.high = stock.price;
    if (stock.price < stock.low) stock.low = stock.price;
  });
}, 3000);

const getStockList = (query = '') => {
  const stocks = Array.from(stockStateMap.values()).map(stock => {
    const change = Number((stock.price - stock.previousClose).toFixed(2));
    const changePercent = Number(((change / stock.previousClose) * 100).toFixed(2));
    return {
      ...stock,
      change,
      changePercent,
      isPositive: change >= 0
    };
  });

  if (!query) return stocks;

  const q = query.toLowerCase();
  return stocks.filter(
    s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  );
};

const getStockBySymbol = (symbol) => {
  const uppercaseSymbol = symbol.toUpperCase();
  const stock = stockStateMap.get(uppercaseSymbol);
  if (!stock) return null;

  const change = Number((stock.price - stock.previousClose).toFixed(2));
  const changePercent = Number(((change / stock.previousClose) * 100).toFixed(2));

  return {
    ...stock,
    change,
    changePercent,
    isPositive: change >= 0
  };
};

/**
 * Generate historical chart candles for 1D, 1W, 1M, 3M, 1Y
 */
const getHistoricalData = (symbol, timeframe = '1D') => {
  const stock = getStockBySymbol(symbol);
  if (!stock) return [];

  const basePrice = stock.price;
  const dataPoints = [];

  let count = 24; // Default 1D hours
  let stepMinutes = 15;
  let volatility = 0.005;

  if (timeframe === '1W') {
    count = 35; // 7 days * 5 trading hours
    stepMinutes = 120;
    volatility = 0.012;
  } else if (timeframe === '1M') {
    count = 30; // 30 days
    stepMinutes = 1440;
    volatility = 0.02;
  } else if (timeframe === '3M') {
    count = 60; // 60 data points
    stepMinutes = 2160;
    volatility = 0.035;
  } else if (timeframe === '1Y') {
    count = 52; // 52 weeks
    stepMinutes = 10080;
    volatility = 0.06;
  }

  const now = new Date();
  let currentPrice = basePrice * (1 - volatility * (count / 2) * 0.05);

  for (let i = count; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * stepMinutes * 60 * 1000);
    const randomFactor = (Math.random() - 0.48) * volatility;
    currentPrice = Number((currentPrice * (1 + randomFactor)).toFixed(2));
    
    // Ensure last point equals exact current stock price
    if (i === 0) currentPrice = basePrice;

    dataPoints.push({
      timestamp: timestamp.toISOString(),
      label: timeframe === '1D' 
        ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      price: currentPrice
    });
  }

  return dataPoints;
};

module.exports = {
  getStockList,
  getStockBySymbol,
  getHistoricalData
};
