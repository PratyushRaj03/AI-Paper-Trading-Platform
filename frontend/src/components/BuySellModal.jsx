import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useMarket } from '../context/MarketContext';
import { formatCurrency } from '../utils/formatters';

export default function BuySellModal({ isOpen, onClose, stock, initialSide = 'BUY' }) {
  if (!isOpen || !stock) return null;

  const { addToast } = useToast();
  const { portfolio, holdings, fetchPortfolioData } = useMarket();

  const [side, setSide] = useState(initialSide);
  const [orderType, setOrderType] = useState('MARKET');
  const [quantity, setQuantity] = useState(1);
  const [limitPrice, setLimitPrice] = useState(stock.price);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSide(initialSide);
    setLimitPrice(stock.price);
  }, [stock, initialSide]);

  const currentHolding = holdings.find(h => h.symbol === stock.symbol);
  const availableShares = currentHolding ? currentHolding.quantity : 0;

  const executionPrice = orderType === 'MARKET' ? stock.price : Number(limitPrice);
  const estimatedTotal = Number((executionPrice * (Number(quantity) || 0)).toFixed(2));
  const availableCash = portfolio ? portfolio.cashBalance : 1000000;

  const canAfford = side === 'BUY' ? availableCash >= estimatedTotal : availableShares >= quantity;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quantity <= 0) {
      addToast('Please enter a valid quantity greater than 0', 'error');
      return;
    }

    if (!canAfford) {
      addToast(
        side === 'BUY'
          ? `Insufficient virtual cash. Required: ${formatCurrency(estimatedTotal)}, Available: ${formatCurrency(availableCash)}`
          : `Insufficient shares. Available: ${availableShares}, Selling: ${quantity}`,
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      const endpoint = side === 'BUY' ? '/trades/buy' : '/trades/sell';
      const response = await api.post(endpoint, {
        symbol: stock.symbol,
        quantity: Number(quantity),
        type: orderType,
        limitPrice: orderType === 'LIMIT' ? Number(limitPrice) : null
      });

      if (response.data.success) {
        addToast(
          response.data.message || `${side} order executed for ${quantity} shares of ${stock.symbol}`,
          'success',
          'Order Executed'
        );
        fetchPortfolioData();
        onClose();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to execute order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass-card rounded-2xl p-6 relative border border-slate-800 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Stock Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{stock.symbol}</h2>
              <span className="text-xs text-slate-400 font-normal">Paper Trade</span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[220px]">{stock.name}</p>
          </div>
          <div className="text-right">
            <div className="text-base font-mono font-bold text-white">{formatCurrency(stock.price)}</div>
            <div className={`text-xs font-mono ${stock.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {stock.isPositive ? '+' : ''}{stock.changePercent}%
            </div>
          </div>
        </div>

        {/* Buy / Sell Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-xl mb-5 border border-slate-800">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`py-2 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
              side === 'BUY'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            BUY (Long)
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`py-2 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
              side === 'SELL'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            SELL (Short/Exit)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order Type (Market vs Limit) */}
          <div>
            <label className="text-xs font-medium text-slate-300 mb-1.5 block">Order Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderType('MARKET')}
                className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  orderType === 'MARKET'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Market Order
              </button>
              <button
                type="button"
                onClick={() => setOrderType('LIMIT')}
                className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  orderType === 'LIMIT'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Limit Order
              </button>
            </div>
          </div>

          {/* Limit Price Input if Limit Order */}
          {orderType === 'LIMIT' && (
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Limit Price (₹)</label>
              <input
                type="number"
                step="0.05"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Quantity Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">Quantity (Shares)</label>
              <span className="text-[11px] text-slate-400">
                {side === 'BUY' ? `Max Cash: ${formatCurrency(availableCash)}` : `Held: ${availableShares} shares`}
              </span>
            </div>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 text-sm font-mono bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Summary Box */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Execution Price</span>
              <span className="font-mono text-slate-200">{formatCurrency(executionPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Value</span>
              <span className="font-mono text-white font-semibold">{formatCurrency(estimatedTotal)}</span>
            </div>
          </div>

          {/* Execution Button */}
          <button
            type="submit"
            disabled={loading || !canAfford}
            className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg ${
              side === 'BUY'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
                : 'bg-red-600 hover:bg-red-500 shadow-red-950/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading
              ? 'Processing Order...'
              : `${side} ${quantity} Share${quantity > 1 ? 's' : ''} of ${stock.symbol}`}
          </button>
        </form>
      </div>
    </div>
  );
}
