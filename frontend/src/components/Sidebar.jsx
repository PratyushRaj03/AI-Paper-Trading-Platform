import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  PieChart,
  ClipboardList,
  Bookmark,
  BarChart3,
  BrainCircuit,
  MessageSquareCode,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/markets', label: 'Markets', icon: TrendingUp },
  { path: '/trade', label: 'Trade', icon: ArrowLeftRight },
  { path: '/portfolio', label: 'Portfolio', icon: PieChart },
  { path: '/orders', label: 'Orders', icon: ClipboardList },
  { path: '/watchlist', label: 'Watchlist', icon: Bookmark },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/ai-coach', label: 'AI Trade Coach', icon: BrainCircuit, badge: 'AI' },
  { path: '/assistant', label: 'Financial Assistant', icon: MessageSquareCode, badge: 'RAG' },
  { path: '/history', label: 'Trade History', icon: History },
  { path: '/settings', label: 'Settings', icon: Settings }
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <aside
      className={`relative z-30 transition-all duration-300 glass-panel border-r border-slate-800/80 flex flex-col h-screen select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/60">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center glow-blue shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-white leading-none text-base">
                Aura<span className="text-blue-500">Pulse</span> <span className="text-purple-400 text-xs font-mono">AI</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Paper Trading</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 mx-auto rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center glow-blue">
            <Zap className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 font-medium border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  {!collapsed && (
                    <span className="text-sm truncate flex-1">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800/60">
        <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-semibold text-xs shrink-0">
            {user ? user.name.charAt(0).toUpperCase() : <UserCircle className="w-5 h-5" />}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user ? user.name : 'Trader'}</div>
              <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Virtual ₹10L
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
