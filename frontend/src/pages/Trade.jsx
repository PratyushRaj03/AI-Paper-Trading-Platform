import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, ArrowUpRight, ArrowDownRight, Wallet, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function Trade() {
  const { stocks, portfolio, holdings, fetchPortfolioData } = useMarket();
  const { addToast } = useToast();

  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [side, setSide] = useState('BUY');
  const [orderType, setOrderType] = useState('MARKET');
  const [quantity, setQuantity] = useState(10);
  const [limitPrice, setLimitPrice] = useState(182.50);
  const [loading, setLoading] = useState(false);
  const [openOrders, setOpenOrders] = useState([]);

  const currentStock = stocks.find(s => s.symbol === selectedSymbol) || stocks[0] || { price: 100, symbol: 'AAPL', name: 'Apple' };
  const currentHolding = holdings.find(h => h.symbol === selectedSymbol);
  const availableShares = currentHolding ? currentHolding.quantity : 0;

  useEffect(() => {
    if (currentStock) {
      setLimitPrice(currentStock.price);
    }
    fetchOpenOrders();
  }, [selectedSymbol]);

  const fetchOpenOrders = async () => {
    try {
      const res = await api.get('/orders?status=OPEN');
      if (res.data.success) setOpenOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    }
  };

  const executionPrice = orderType === 'MARKET' ? currentStock.price : Number(limitPrice);
  const estimatedTotal = Number((executionPrice * quantity).toFixed(2));
  const availableCash = portfolio ? portfolio.cashBalance : 1000000;

  const canAfford = side === 'BUY' ? availableCash >= estimatedTotal : availableShares >= quantity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quantity <= 0) return;

    setLoading(true);
    try {
      const endpoint = side === 'BUY' ? '/trades/buy' : '/trades/sell';
      const res = await api.post(endpoint, {
        symbol: currentStock.symbol,
        quantity: Number(quantity),
        type: orderType,
        limitPrice: orderType === 'LIMIT' ? Number(limitPrice) : null
      });

      if (res.data.success) {
        addToast(res.data.message || 'Order executed successfully', 'success');
        fetchPortfolioData();
        fetchOpenOrders();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Order execution failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-blue-400" />
            Paper Trading Terminal
          </h1>
          <p className="text-xs text-slate-400 mt-1">Execute market and limit orders instantly with zero capital risk</p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Virtual Cash: <strong className="font-mono text-white">{formatCurrency(availableCash)}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Order Desk Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stock Selection & Quote Display */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-white">Select Asset</h2>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">Stock Symbol</label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
            >
              {stocks.map(s => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} — {s.name} ({formatCurrency(s.price)})
                </option>
              ))}
            </select>
          </div>

          {/* Quote Details */}
          {currentStock && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Current Market Price</span>
                <span className="text-lg font-bold font-mono text-white">{formatCurrency(currentStock.price)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Day High / Low</span>
                <span className="font-mono text-slate-300">{formatCurrency(currentStock.high)} / {formatCurrency(currentStock.low)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Sector</span>
                <span className="text-blue-400 font-medium">{currentStock.sector}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Your Holdings</span>
                <span className="font-mono text-emerald-400 font-semibold">{availableShares} Shares</span>
              </div>
            </div>
          )}
        </div>

        {/* Center Column: Order Form */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5 lg:col-span-2">
          <h2 className="text-base font-bold text-white">Order Entry Form</h2>

          {/* Buy / Sell Buttons */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setSide('BUY')}
              className={`py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                side === 'BUY' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              BUY ORDER (Long)
            </button>
            <button
              onClick={() => setSide('SELL')}
              className={`py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                side === 'SELL' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              SELL ORDER (Short/Exit)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1.5 block">Execution Type</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="MARKET">Market Order (Instant execution)</option>
                  <option value="LIMIT">Limit Order (Target price execution)</option>
                </select>
              </div>

              {orderType === 'LIMIT' ? (
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1.5 block">Limit Price (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium text-slate-300 mb-1.5 block">Execution Price</label>
                  <input
                    type="text"
                    disabled
                    value={formatCurrency(currentStock.price)}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-950 border border-slate-800 rounded-xl text-slate-400"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Quantity (Shares)</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2.5 text-sm font-mono bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Estimated Value</span>
                <span className="font-mono text-white font-bold">{formatCurrency(estimatedTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Account Balance Status</span>
                <span className={canAfford ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                  {canAfford ? 'Sufficient Funds' : 'Insufficient Capital/Shares'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !canAfford}
              className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-xl ${
                side === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
              } disabled:opacity-50`}
            >
              {loading ? 'Submitting Order...' : `Submit ${side} Order for ${currentStock.symbol}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
