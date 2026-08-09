import React from 'react';
import { PieChart as PieIcon, Wallet, TrendingUp, TrendingDown, ShieldCheck } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useMarket } from '../context/MarketContext';
import { formatCurrency, formatPercent } from '../utils/formatters';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Portfolio() {
  const { portfolio, holdings } = useMarket();

  const totalValue = portfolio ? portfolio.totalValue : 1000000;
  const cash = portfolio ? portfolio.cashBalance : 1000000;
  const invested = portfolio ? portfolio.investedAmount : 0;
  const pnl = portfolio ? portfolio.overallPnL : 0;
  const returnPct = portfolio ? portfolio.returnPercentage : 0;

  // Sector Breakdown calculation
  const sectorMap = {};
  holdings.forEach(h => {
    const sec = h.sector || 'Technology';
    sectorMap[sec] = (sectorMap[sec] || 0) + h.marketValue;
  });

  const sectorData = Object.keys(sectorMap).map(sec => ({
    name: sec,
    value: sectorMap[sec]
  }));
  if (cash > 0) {
    sectorData.push({ name: 'Cash', value: cash });
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            REAL-TIME HOLDINGS AUDIT
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Portfolio & Capital Allocation</h1>
          <p className="text-xs text-slate-400 mt-1">Detailed position metrics, unrealized P&L, and sector exposure</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-right">
            <div className="text-slate-400 text-[10px]">TOTAL PORTFOLIO VALUE</div>
            <div className="text-lg font-bold text-white">{formatCurrency(totalValue)}</div>
          </div>
        </div>
      </div>

      {/* 4 Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Available Cash</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{formatCurrency(cash)}</div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">{((cash/totalValue)*100).toFixed(1)}% liquidity</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Invested Assets</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{formatCurrency(invested)}</div>
          <div className="text-[11px] text-slate-500 mt-2">{holdings.length} Active Holdings</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Unrealized Net P&L</div>
          <div className={`text-xl font-bold font-mono mt-1 ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">{formatPercent(returnPct)} return</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Positions Count</div>
          <div className="text-xl font-bold font-mono text-white mt-1">{holdings.length} Stocks</div>
          <div className="text-[11px] text-slate-500 mt-2">100% Virtual Capital</div>
        </div>
      </div>

      {/* Allocation Charts & Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Holdings Table */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white">Active Stock Holdings</h2>

          {holdings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No holdings in portfolio. Use the Market or Trade pages to place orders.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="pb-3">Symbol</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Qty</th>
                    <th className="pb-3">Avg Price</th>
                    <th className="pb-3">Current</th>
                    <th className="pb-3">Market Value</th>
                    <th className="pb-3 text-right">Unrealized P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {holdings.map((h) => (
                    <tr key={h.symbol} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-bold text-white">{h.symbol}</td>
                      <td className="py-3 text-slate-300 max-w-[140px] truncate">{h.companyName}</td>
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

        {/* Sector Allocation Breakdown */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white">Sector Breakdown</h2>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`sec-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#121721', borderColor: '#1e2638', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(v) => [formatCurrency(v), 'Exposure']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {sectorData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-mono text-slate-400">{formatCurrency(item.value)} ({((item.value/totalValue)*100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
