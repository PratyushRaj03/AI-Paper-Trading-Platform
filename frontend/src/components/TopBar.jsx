import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ShieldCheck, LogOut, User, Activity, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { formatCurrency, formatPercent } from '../utils/formatters';

export default function TopBar() {
  const { user, logout } = useAuth();
  const { stocks, portfolio } = useMarket();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const searchRef = useRef(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStocks = searchQuery
    ? stocks.filter(s => s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : stocks.slice(0, 5);

  return (
    <header className="h-16 border-b border-slate-800/80 glass-panel px-6 flex items-center justify-between z-20 sticky top-0">
      {/* Global Stock Search */}
      <div className="relative w-80" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search stock symbol or name (e.g. AAPL, NVDA)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all"
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
            <div className="p-2 text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
              {searchQuery ? 'Search Results' : 'Popular Stocks'}
            </div>
            {filteredStocks.length === 0 ? (
              <div className="p-4 text-xs text-slate-500 text-center">No stocks matching "{searchQuery}"</div>
            ) : (
              filteredStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => {
                    navigate(`/market/${stock.symbol}`);
                    setShowSearchDropdown(false);
                    setSearchQuery('');
                  }}
                  className="px-3 py-2.5 hover:bg-slate-800/60 flex items-center justify-between cursor-pointer border-b border-slate-800/40 last:border-0 transition-colors"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">{stock.symbol}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-medium text-white">{formatCurrency(stock.price)}</div>
                    <div className={`text-[10px] font-mono ${stock.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatPercent(stock.changePercent)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* TopBar Right Items */}
      <div className="flex items-center gap-4">
        {/* Virtual Money Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Virtual Cash: <strong className="font-mono">{formatCurrency(portfolio ? portfolio.cashBalance : 1000000)}</strong></span>
        </div>

        {/* Demo Mode Status Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/40 border border-blue-500/30 text-blue-300 text-[11px]">
          <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>DEMO MARKET LIVE</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 text-xs">
              <div className="font-semibold text-white mb-2 flex items-center justify-between">
                <span>Notifications</span>
                <span className="text-[10px] text-blue-400">1 New</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/40 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-slate-200">₹10,00,000 Credited</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Your paper trading account is ready for execution.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-md">
              {user ? user.name.charAt(0).toUpperCase() : 'T'}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="font-semibold text-white">{user?.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  navigate('/settings');
                  setShowProfileMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-slate-300 hover:bg-slate-800 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-slate-400" />
                Settings & Profile
              </button>
              <button
                onClick={logout}
                className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-950/30 flex items-center gap-2 border-t border-slate-800"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
