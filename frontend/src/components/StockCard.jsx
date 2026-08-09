import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';
import BuySellModal from './BuySellModal';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function StockCard({ stock, isWatchlisted = false, onWatchlistToggle }) {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSide, setModalSide] = useState('BUY');
  const [watchlisted, setWatchlisted] = useState(isWatchlisted);

  const handleWatchlistClick = async (e) => {
    e.stopPropagation();
    try {
      if (watchlisted) {
        await api.delete(`/watchlist/${stock.symbol}`);
        setWatchlisted(false);
        addToast(`Removed ${stock.symbol} from watchlist`, 'info');
      } else {
        await api.post('/watchlist', { symbol: stock.symbol });
        setWatchlisted(true);
        addToast(`Added ${stock.symbol} to watchlist`, 'success');
      }
      if (onWatchlistToggle) onWatchlistToggle(stock.symbol, !watchlisted);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div
        onClick={() => navigate(`/market/${stock.symbol}`)}
        className="glass-card rounded-2xl p-5 hover:border-blue-500/50 transition-all duration-300 group cursor-pointer relative overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white group-hover:text-blue-400 transition-colors">
                {stock.symbol}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-medium text-slate-400">
                {stock.sector}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[170px] mt-0.5">{stock.name}</p>
          </div>

          <button
            onClick={handleWatchlistClick}
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
          >
            {watchlisted ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        {/* Price & Change */}
        <div className="flex items-baseline justify-between mb-4">
          <span className="text-xl font-bold font-mono text-white">{formatCurrency(stock.price)}</span>
          <div className={`flex items-center gap-1 text-xs font-mono font-medium px-2 py-0.5 rounded-md ${
            stock.isPositive ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-red-950/60 text-red-400 border border-red-500/30'
          }`}>
            {stock.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {formatPercent(stock.changePercent)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/60">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setModalSide('BUY');
              setModalOpen(true);
            }}
            className="py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Buy
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setModalSide('SELL');
              setModalOpen(true);
            }}
            className="py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            Sell
          </button>
        </div>
      </div>

      <BuySellModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        stock={stock}
        initialSide={modalSide}
      />
    </>
  );
}
