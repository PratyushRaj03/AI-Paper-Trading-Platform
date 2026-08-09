import React, { useState, useEffect } from 'react';
import { BrainCircuit, ShieldAlert, Award, Lightbulb, CheckCircle2, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import api from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';

export default function AITradeCoach() {
  const [coachData, setCoachData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoachData();
  }, []);

  const fetchCoachData = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/coach');
      if (res.data.success) {
        setCoachData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !coachData) {
    return (
      <div className="p-6 space-y-6">
        <SkeletonLoader count={3} type="card" />
        <SkeletonLoader count={2} type="table" />
      </div>
    );
  }

  const { overallScore, riskScore, strategyScore, insights, recommendations, isDemoFallback, message } = coachData;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center glow-blue shadow-lg">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Trade Coach</h1>
            <p className="text-xs text-slate-400 mt-1">Autonomous behavioral evaluation and strategy guidance engine</p>
          </div>
        </div>

        <button
          onClick={fetchCoachData}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4 text-blue-400" />
          Re-Analyze Portfolio
        </button>
      </div>

      {/* Demo Fallback Notice if active */}
      {isDemoFallback && (
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{message || "AI API key not configured — running in demo educational mode."}</span>
        </div>
      )}

      {/* 3 Executive Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Trading Score</div>
          <div className="relative flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border-4 border-blue-500/30 flex items-center justify-center bg-blue-950/20">
              <span className="text-4xl font-extrabold font-mono text-white">{overallScore}</span>
              <span className="text-xs text-slate-500 font-mono">/100</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">Composite execution quality metric</p>
        </div>

        {/* Risk Score */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Management Score</div>
          <div className="relative flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border-4 border-emerald-500/30 flex items-center justify-center bg-emerald-950/20">
              <span className="text-4xl font-extrabold font-mono text-emerald-400">{riskScore}</span>
              <span className="text-xs text-slate-500 font-mono">/100</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">Position sizing & drawdown protection</p>
        </div>

        {/* Strategy Score */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Strategy Consistency Score</div>
          <div className="relative flex items-center justify-center">
            <div className="w-28 h-28 rounded-full border-4 border-purple-500/30 flex items-center justify-center bg-purple-950/20">
              <span className="text-4xl font-extrabold font-mono text-purple-400">{strategyScore}</span>
              <span className="text-xs text-slate-500 font-mono">/100</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">Statistical win-to-loss consistency</p>
        </div>
      </div>

      {/* Behavioral Insights & Recommendations Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Behavioral Insights */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Behavioral Insights</h2>
          </div>

          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs leading-relaxed text-slate-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Tailored Recommendations</h2>
          </div>

          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs leading-relaxed text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
