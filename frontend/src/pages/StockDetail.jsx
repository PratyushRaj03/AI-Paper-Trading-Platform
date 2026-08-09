import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Bookmark, BookmarkCheck, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { formatCurrency, formatPercent } from '../utils/formatters';
import BuySellModal from '../components/BuySellModal';
import SkeletonLoader from '../components/SkeletonLoader';
import { useToast } from '../context/ToastContext';

const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y'];

export default function StockDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [stock, setStock] = useState(null);
  const [history, setHistory] = useState([]);
  const [timeframe, setTimeframe] = useState('1D');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSide, setModalSide] = useState('BUY');
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  useEffect(() => {
    fetchStockDetails();
    fetchStockHistory(timeframe);
  }, [symbol, timeframe]);

  const fetchStockDetails = async () => {
    try {
      const res = await api.get(`/market/stocks/${symbol}`);
      if (res.data.success) {
        setStock(res.data.stock);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockHistory = async (tf) => {
    try {
      const res = await api.get(`/market/stocks/${symbol}/history?timeframe=${tf}`);
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWatchlist = async () => {
    try {
      if (isWatchlisted) {
        await api.delete(`/watchlist/${symbol}`);
        setIsWatchlisted(false);
        addToast(`Removed ${symbol} from watchlist`, 'info');
      } else {
        await api.post('/watchlist', { symbol });
        setIsWatchlisted(true);
        addToast(`Added ${symbol} to watchlist`, 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !stock) {
    return (
      <div className="p-6 space-y-6">
        <SkeletonLoader count={1} type="card" />
        <SkeletonLoader count={1} type="table" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/markets')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Markets
        </button>

        <button
          onClick={toggleWatchlist}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card text-xs font-medium text-slate-300 hover:text-white transition-colors"
        >
          {isWatchlisted ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
          {isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}
        </button>
      </div>

      {/* Stock Overview Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">{stock.symbol}</h1>
            <span className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300 text-xs font-semibold">
              {stock.sector}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">{stock.name}</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl font-bold font-mono text-white">{formatCurrency(stock.price)}</div>
            <div className={`text-xs font-mono font-medium flex items-center justify-end gap-1 ${
              stock.isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {stock.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {stock.isPositive ? '+' : ''}{stock.change} ({formatPercent(stock.changePercent)})
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setModalSide('BUY');
                setModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
              BUY
            </button>
            <button
              onClick={() => {
                setModalSide('SELL');
                setModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/50 flex items-center gap-1.5 transition-all"
            >
              <ArrowDownRight className="w-4 h-4" />
              SELL
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Price Chart Section */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Interactive Price History</h2>
          </div>

          {/* Timeframe Selector Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={stock.isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={stock.isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#121721', borderColor: '#1e2638', borderRadius: '12px', fontSize: '12px' }}
                formatter={(v) => [formatCurrency(v), 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={stock.isPositive ? "#10b981" : "#ef4444"}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#stockGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Day High</div>
          <div className="text-base font-bold font-mono text-white mt-1">{formatCurrency(stock.high)}</div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Day Low</div>
          <div className="text-base font-bold font-mono text-white mt-1">{formatCurrency(stock.low)}</div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">P/E Ratio</div>
          <div className="text-base font-bold font-mono text-white mt-1">{stock.peRatio}</div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Market Cap</div>
          <div className="text-base font-bold font-mono text-white mt-1">{stock.marketCap}</div>
        </div>
      </div>

      {/* Company Description */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
        <h3 className="text-sm font-bold text-white">About {stock.name}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{stock.description}</p>
      </div>

      <BuySellModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        stock={stock}
        initialSide={modalSide}
      />
    </div>
  );
}
