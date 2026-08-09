import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import BuySellModal from '../components/BuySellModal';
import SkeletonLoader from '../components/SkeletonLoader';

export default function Watchlist() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [watchlistStocks, setWatchlistStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [modalSide, setModalSide] = useState('BUY');

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const res = await api.get('/watchlist');
      if (res.data.success) {
        setWatchlistStocks(res.data.stocks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (symbol) => {
    try {
      const res = await api.delete(`/watchlist/${symbol}`);
      if (res.data.success) {
        setWatchlistStocks(prev => prev.filter(s => s.symbol !== symbol));
        addToast(`Removed ${symbol} from watchlist`, 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-amber-400" />
            Stock Watchlist
          </h1>
          <p className="text-xs text-slate-400 mt-1">Monitor real-time prices for your favorited companies</p>
        </div>
      </div>

      {loading ? (
        <SkeletonLoader count={4} type="table" />
      ) : watchlistStocks.length === 0 ? (
        <div className="p-12 text-center glass-card rounded-3xl border border-slate-800 text-slate-500 text-xs">
          Your watchlist is empty. Visit the Markets page to add stocks.
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3">Symbol</th>
                <th className="pb-3">Company Name</th>
                <th className="pb-3">Sector</th>
                <th className="pb-3">Current Price</th>
                <th className="pb-3">Daily Change</th>
                <th className="pb-3 text-right">Paper Trade</th>
                <th className="pb-3 text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {watchlistStocks.map((s) => (
                <tr
                  key={s.symbol}
                  onClick={() => navigate(`/market/${s.symbol}`)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                >
                  <td className="py-3 font-bold text-white">{s.symbol}</td>
                  <td className="py-3 text-slate-300 max-w-[160px] truncate">{s.name}</td>
                  <td className="py-3 text-blue-400">{s.sector}</td>
                  <td className="py-3 font-mono font-bold text-white">{formatCurrency(s.price)}</td>
                  <td className={`py-3 font-mono font-semibold ${s.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.isPositive ? '+' : ''}{formatPercent(s.changePercent)}
                  </td>
                  <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedStock(s);
                          setModalSide('BUY');
                          setModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-[11px] font-semibold transition-all"
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStock(s);
                          setModalSide('SELL');
                          setModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-[11px] font-semibold transition-all"
                      >
                        Sell
                      </button>
                    </div>
                  </td>
                  <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleRemove(s.symbol)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedStock && (
        <BuySellModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          stock={selectedStock}
          initialSide={modalSide}
        />
      )}
    </div>
  );
}
