import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Lock, Bell, BrainCircuit, ShieldCheck, CheckCircle2, Github, Code2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function Settings() {
  const { user, fetchUserProfile } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true);
  const [aiInsights, setAiInsights] = useState(user?.preferences?.aiInsights ?? true);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/user/profile', {
        name,
        preferences: { notifications, aiInsights }
      });
      if (res.data.success) {
        addToast('Settings updated successfully', 'success');
        fetchUserProfile();
      }
    } catch (err) {
      addToast('Failed to update settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-400" />
            Platform & Profile Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage user preferences, currency format, and AI configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="md:col-span-2 glass-card rounded-3xl p-6 border border-slate-800 space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            User Information
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Preferences</h3>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">System Notifications</div>
                  <div className="text-[11px] text-slate-400">Receive order execution & price alert toasts</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">AI Portfolio Insights</div>
                  <div className="text-[11px] text-slate-400">Enable real-time AI Trade Coach tips on Dashboard</div>
                </div>
                <input
                  type="checkbox"
                  checked={aiInsights}
                  onChange={(e) => setAiInsights(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg glow-blue"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Environment & Developer Credit Sidebar */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Environment Status
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Currency</span>
                <span className="font-mono text-white font-semibold">INR (₹)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Paper Capital</span>
                <span className="font-mono text-emerald-400 font-semibold">₹10,00,000</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Local Demo Mode Active
                </div>
                <p className="text-[11px] text-emerald-400/80">
                  AuraPulse AI is fully operational with simulated market data & local RAG fallback.
                </p>
              </div>
            </div>
          </div>

          {/* Subtle Developer Credit */}
          <div className="glass-card rounded-3xl p-5 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <Code2 className="w-4 h-4 text-blue-400" />
              Developer & Creator
            </div>
            <p className="text-slate-400">Built by <strong className="text-slate-200">Pratyush Raj Srivastava</strong></p>
            <a
              href="https://github.com/PratyushRaj03"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-semibold pt-1 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              github.com/PratyushRaj03
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
