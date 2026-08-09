import React from 'react';

export default function SkeletonLoader({ count = 4, type = 'card' }) {
  const items = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div className="space-y-3 animate-pulse">
        {items.map((_, i) => (
          <div key={i} className="h-12 bg-slate-900/60 rounded-xl border border-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((_, i) => (
        <div key={i} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 animate-pulse">
          <div className="flex justify-between">
            <div className="w-24 h-4 bg-slate-800 rounded" />
            <div className="w-8 h-8 bg-slate-800 rounded-lg" />
          </div>
          <div className="w-32 h-6 bg-slate-800 rounded" />
          <div className="h-8 bg-slate-800/60 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
