import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShieldAlert, Award, Activity, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import api from '../services/api';
import { formatCurrency, formatPercent } from '../utils/formatters';
import SkeletonLoader from '../components/SkeletonLoader';

const WIN_LOSS_COLORS = ['#10b981', '#ef4444'];

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics');
      if (res.data.success) {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="p-6 space-y-6">
        <SkeletonLoader count={4} type="card" />
        <SkeletonLoader count={2} type="table" />
      </div>
    );
  }

  const { performance, risk, behavior } = analytics;

  const winLossData = [
    { name: 'Winning Trades', value: performance.winRate },
    { name: 'Losing Trades', value: performance.lossRate }
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Performance & Risk Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">Quantitative statistical breakdown computed from your trading history</p>
        </div>
      </div>

      {/* Performance Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Win Rate</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{performance.winRate}%</div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">{performance.lossRate}% loss rate</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Profit Factor</div>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">{performance.profitFactor}</div>
          <div className="text-[11px] text-slate-500 mt-2">Gross Profit / Gross Loss</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Sharpe Ratio</div>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">{risk.sharpeRatio}</div>
          <div className="text-[11px] text-slate-500 mt-2">Risk-adjusted return ratio</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Max Drawdown</div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1">-{risk.maxDrawdown}%</div>
          <div className="text-[11px] text-slate-500 mt-2">Peak-to-trough drop</div>
        </div>
      </div>

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Win/Loss Pie Chart */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white">Win / Loss Ratio</h2>
          
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={winLossData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {winLossData.map((entry, index) => (
                    <Cell key={`win-${index}`} fill={WIN_LOSS_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#121721', borderColor: '#1e2638', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-xs font-mono pt-2">
            <div className="text-emerald-400 font-semibold">Wins: {performance.winRate}%</div>
            <div className="text-red-400 font-semibold">Losses: {performance.lossRate}%</div>
          </div>
        </div>

        {/* Trading Behavior Breakdown */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-white">Trading Behavior & Metrics</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Total Executed Trades</span>
              <div className="text-lg font-bold text-white mt-1">{behavior.totalTrades}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Buy / Sell Ratio</span>
              <div className="text-lg font-bold text-blue-400 mt-1">{behavior.buySellRatio}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Avg Trade Size</span>
              <div className="text-lg font-bold text-emerald-400 mt-1">{formatCurrency(behavior.avgTradeSize)}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Top Position Conc.</span>
              <div className="text-lg font-bold text-amber-400 mt-1">{risk.portfolioConcentration}%</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Annual Volatility</span>
              <div className="text-lg font-bold text-purple-400 mt-1">{risk.volatility}%</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Most Traded Symbol</span>
              <div className="text-lg font-bold text-white mt-1">{behavior.mostTradedSymbol}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-400">Best Trade Realized: </span>
              <span className="text-emerald-400 font-bold">+{formatCurrency(behavior.bestTrade?.realizedPnL || 0)}</span>
              <span className="text-slate-500"> ({behavior.bestTrade?.symbol})</span>
            </div>
            <div>
              <span className="text-slate-400">Worst Trade Realized: </span>
              <span className="text-red-400 font-bold">{formatCurrency(behavior.worstTrade?.realizedPnL || 0)}</span>
              <span className="text-slate-500"> ({behavior.worstTrade?.symbol})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
