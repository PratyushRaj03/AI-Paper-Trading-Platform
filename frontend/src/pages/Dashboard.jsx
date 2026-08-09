import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  PieChart as PieIcon,
  BrainCircuit,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useMarket } from '../context/MarketContext';
import { formatCurrency, formatPercent } from '../utils/formatters';
import api from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';

const SECTOR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { stocks, portfolio, holdings, loadingStocks } = useMarket();

  const [trades, setTrades] = useState([]);
  const [aiInsight, setAiInsight] = useState('');
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    fetchDashboardExtras();
  }, [holdings]);

  const fetchDashboardExtras = async () => {
    try {
      const [tradesRes, aiRes] = await Promise.all([
        api.get('/trades?limit=5'),
        api.post('/ai/coach')
      ]);

      if (tradesRes.data.success) setTrades(tradesRes.data.trades);
      if (aiRes.data.success && aiRes.data.insights && aiRes.data.insights.length > 0) {
        setAiInsight(aiRes.data.insights[0]);
      } else {
        setAiInsight("Your portfolio is currently concentrated in Technology stocks. Consider diversifying across defensive sectors.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Generate synthetic performance chart data points
  const totalVal = portfolio ? portfolio.totalValue : 1000000;
  const pnlVal = portfolio ? portfolio.overallPnL : 0;

  const chartData = [
    { name: 'Mon', value: 1000000 },
    { name: 'Tue', value: 1002400 },
    { name: 'Wed', value: 1001800 },
    { name: 'Thu', value: 1005200 },
    { name: 'Fri', value: 1003900 },
    { name: 'Sat', value: 1007800 },
    { name: 'Today', value: totalVal }
  ];

  // Asset allocation pie data
  const pieData = holdings.map(h => ({
    name: h.symbol,
    value: h.marketValue
  }));
  if (portfolio && portfolio.cashBalance > 0) {
    pieData.push({ name: 'Cash', value: portfolio.cashBalance });
  }

  if (loadingStocks || loadingDashboard) {
    return (
      <div className="p-6 space-y-6">
        <SkeletonLoader count={4} type="card" />
        <SkeletonLoader count={2} type="table" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            VIRTUAL PAPER PORTFOLIO
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time paper trading performance & AI portfolio analytics</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/markets')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg glow-blue transition-all flex items-center gap-2"
          >
            Explore Markets
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Total Portfolio Value</span>
            <Wallet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {formatCurrency(portfolio?.totalValue || 1000000)}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono mt-3">
            <span className={portfolio?.overallPnL >= 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
              {formatPercent(portfolio?.returnPercentage || 0)}
            </span>
            <span className="text-slate-500">all-time</span>
          </div>
        </div>

        {/* Available Cash */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Available Virtual Cash</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {formatCurrency(portfolio?.cashBalance || 1000000)}
          </div>
          <div className="text-[11px] text-slate-400 mt-3 font-mono">
            {portfolio ? ((portfolio.cashBalance / portfolio.totalValue) * 100).toFixed(1) : 100}% of portfolio
          </div>
        </div>

        {/* Invested Amount */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Invested Capital</span>
            <PieIcon className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {formatCurrency(portfolio?.investedAmount || 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-3">
            {holdings.length} Active Stock Positions
          </div>
        </div>

        {/* Overall P&L */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Overall P&L</span>
            {pnlVal >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
          </div>
          <div className={`text-2xl font-bold font-mono ${pnlVal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {pnlVal >= 0 ? '+' : ''}{formatCurrency(pnlVal)}
          </div>
          <div className="text-[11px] text-slate-400 mt-3">
            Realized & Unrealized Net
          </div>
        </div>
      </div>

      {/* AI Insight Pill */}
      <div className="p-4 rounded-2xl glass-card border border-blue-500/30 bg-blue-950/20 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0">
          <BrainCircuit className="w-5 h-5 text-blue-400 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">AI Portfolio Coach Insight</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">Real Data</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{aiInsight}</p>
        </div>
        <button
          onClick={() => navigate('/ai-coach')}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 shrink-0 mt-1"
        >
          Coach Review
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Curve Area Chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Portfolio Value Growth</h2>
              <p className="text-xs text-slate-400">Simulated 7-Day Performance Curve</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
              +{formatPercent(portfolio?.returnPercentage || 0)}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121721', borderColor: '#1e2638', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(v) => [formatCurrency(v), 'Value']}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Allocation Pie Chart */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Asset Allocation</h2>
            <p className="text-xs text-slate-400 mb-4">Stock vs Cash breakdown</p>
          </div>

          <div className="h-52 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#121721', borderColor: '#1e2638', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(v) => [formatCurrency(v), 'Value']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length] }} />
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-mono text-slate-400">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings & Recent Trades Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Holdings Table */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Current Holdings</h2>
            <button
              onClick={() => navigate('/portfolio')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View Full Portfolio
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {holdings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No active holdings. Explore markets to execute your first paper trade.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="pb-3">Symbol</th>
                    <th className="pb-3">Qty</th>
                    <th className="pb-3">Avg Price</th>
                    <th className="pb-3">Current</th>
                    <th className="pb-3">Market Value</th>
                    <th className="pb-3 text-right">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {holdings.map((h) => (
                    <tr key={h.symbol} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-bold text-white">{h.symbol}</td>
                      <td className="py-3 font-mono">{h.quantity}</td>
                      <td className="py-3 font-mono text-slate-400">{formatCurrency(h.averagePrice)}</td>
                      <td className="py-3 font-mono text-slate-200">{formatCurrency(h.currentPrice)}</td>
                      <td className="py-3 font-mono font-medium text-white">{formatCurrency(h.marketValue)}</td>
                      <td className={`py-3 text-right font-mono font-semibold ${h.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {h.isPositive ? '+' : ''}{formatCurrency(h.unrealizedPnL)} ({formatPercent(h.returnPercent)})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Watchlist Preview */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Top Watchlist</h2>
            <button
              onClick={() => navigate('/watchlist')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              All Tracked
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {stocks.slice(0, 5).map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => navigate(`/market/${stock.symbol}`)}
                className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer transition-all"
              >
                <div>
                  <div className="font-bold text-xs text-white">{stock.symbol}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[120px]">{stock.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-semibold text-white">{formatCurrency(stock.price)}</div>
                  <div className={`text-[10px] font-mono ${stock.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stock.isPositive ? '+' : ''}{stock.changePercent}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
