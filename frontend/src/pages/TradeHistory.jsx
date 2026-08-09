import React, { useState, useEffect } from 'react';
import { History, Search, BrainCircuit, X, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatPercent } from '../utils/formatters';
import SkeletonLoader from '../components/SkeletonLoader';

export default function TradeHistory() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSide, setFilterSide] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Single Trade AI Analysis Modal state
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    fetchTrades();
  }, [search, filterSide, page]);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/trades?search=${search}&side=${filterSide}&page=${page}&limit=15`);
      if (res.data.success) {
        setTrades(res.data.trades);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTradeAnalysis = async (trade) => {
    setSelectedTrade(trade);
    setAnalysis(null);
    setLoadingAnalysis(true);
    try {
      const res = await api.post('/ai/trade-analysis', { tradeId: trade._id });
      if (res.data.success) {
        setAnalysis(res.data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-400" />
            Trade History & AI Review
          </h1>
          <p className="text-xs text-slate-400 mt-1">Audit past executed orders and generate educational AI trade breakdowns</p>
        </div>

        {/* Search & Side Filters */}
        <div className="flex items-center gap-3">
          <div className="relative w-48">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search symbol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <select
            value={filterSide}
            onChange={(e) => setFilterSide(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="">All Sides</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>
      </div>

      {/* Trades Table */}
      {loading ? (
        <SkeletonLoader count={8} type="table" />
      ) : trades.length === 0 ? (
        <div className="p-12 text-center glass-card rounded-3xl border border-slate-800 text-slate-500 text-xs">
          No trade history found. Place paper trades to populate history.
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6 border border-slate-800 overflow-x-auto space-y-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3">Trade ID</th>
                <th className="pb-3">Symbol</th>
                <th className="pb-3">Side</th>
                <th className="pb-3">Qty</th>
                <th className="pb-3">Entry Price</th>
                <th className="pb-3">Exit Price</th>
                <th className="pb-3">Total Value</th>
                <th className="pb-3">Realized P&L</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">AI Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {trades.map((t) => (
                <tr key={t._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 text-[11px] text-slate-500">{t._id.substring(t._id.length - 8)}</td>
                  <td className="py-3 font-bold text-white">{t.symbol}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.side === 'BUY' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-red-950/80 text-red-400 border border-red-500/30'
                    }`}>
                      {t.side}
                    </span>
                  </td>
                  <td className="py-3 text-slate-200">{t.quantity}</td>
                  <td className="py-3 text-slate-400">{formatCurrency(t.entryPrice)}</td>
                  <td className="py-3 text-slate-300">{t.exitPrice ? formatCurrency(t.exitPrice) : '—'}</td>
                  <td className="py-3 font-medium text-white">{formatCurrency(t.totalValue)}</td>
                  <td className={`py-3 font-bold ${t.realizedPnL > 0 ? 'text-emerald-400' : t.realizedPnL < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {t.realizedPnL > 0 ? '+' : ''}{formatCurrency(t.realizedPnL)}
                  </td>
                  <td className="py-3 text-slate-400 text-[11px]">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleOpenTradeAnalysis(t)}
                      className="px-2.5 py-1 rounded bg-blue-950/60 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[11px] font-sans font-semibold flex items-center gap-1 ml-auto transition-all"
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                      AI Analysis
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Page {page} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Single Trade Review Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl glass-card rounded-3xl p-6 relative border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTrade(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AI Trade Quality Breakdown</h2>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedTrade.symbol} ({selectedTrade.side}) — {formatCurrency(selectedTrade.totalValue)}
                </p>
              </div>
            </div>

            {loadingAnalysis ? (
              <div className="p-8 text-center text-slate-400 text-xs font-mono animate-pulse">
                Generating educational trade breakdown...
              </div>
            ) : analysis ? (
              <div className="space-y-4 text-xs">
                {/* Score */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="font-semibold text-slate-300">Trade Quality Score</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">{analysis.tradeQualityScore}/100</span>
                </div>

                {/* Risk Assessment */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    Risk Assessment
                  </span>
                  <p className="text-slate-300 leading-relaxed">{analysis.riskAssessment}</p>
                </div>

                {/* Mistakes */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Mistake Identification
                  </span>
                  <p className="text-slate-300 leading-relaxed">{analysis.mistakeIdentification}</p>
                </div>

                {/* Improvement */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Actionable Improvement
                  </span>
                  <p className="text-slate-300 leading-relaxed">{analysis.possibleImprovement}</p>
                </div>

                <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 text-[11px] text-blue-300 italic">
                  Note: Educational AI analysis only. Not financial or investment advice.
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
