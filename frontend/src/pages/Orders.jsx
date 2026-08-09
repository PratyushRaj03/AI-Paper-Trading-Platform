import React, { useState, useEffect } from 'react';
import { ClipboardList, XCircle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import SkeletonLoader from '../components/SkeletonLoader';

export default function Orders() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const fetchOrders = async (statusTab) => {
    setLoading(true);
    try {
      const res = await api.get(`/orders?status=${statusTab}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await api.delete(`/orders/${orderId}`);
      if (res.data.success) {
        addToast('Order cancelled successfully', 'info');
        fetchOrders(activeTab);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-blue-400" />
            Order Book & Status
          </h1>
          <p className="text-xs text-slate-400 mt-1">Track pending limit orders, executed paper trades, and cancellations</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto">
        {['ALL', 'OPEN', 'EXECUTED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg glow-blue'
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab} ORDERS
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <SkeletonLoader count={6} type="table" />
      ) : orders.length === 0 ? (
        <div className="p-12 text-center glass-card rounded-3xl border border-slate-800 text-slate-500 text-xs">
          No orders found in status '{activeTab}'.
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Symbol</th>
                <th className="pb-3">Side</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Qty</th>
                <th className="pb-3">Target Price</th>
                <th className="pb-3">Executed Price</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {orders.map((o) => (
                <tr key={o._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 text-[11px] text-slate-500">{o._id.substring(o._id.length - 8)}</td>
                  <td className="py-3 font-bold text-white">{o.symbol}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      o.side === 'BUY' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' : 'bg-red-950/80 text-red-400 border border-red-500/30'
                    }`}>
                      {o.side}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">{o.type}</td>
                  <td className="py-3 text-slate-200">{o.quantity}</td>
                  <td className="py-3 text-slate-400">{formatCurrency(o.targetPrice)}</td>
                  <td className="py-3 text-slate-200">{o.executedPrice ? formatCurrency(o.executedPrice) : '—'}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      o.status === 'EXECUTED' ? 'bg-blue-950 text-blue-400' :
                      o.status === 'OPEN' ? 'bg-amber-950 text-amber-400 animate-pulse' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400 text-[11px]">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    {o.status === 'OPEN' ? (
                      <button
                        onClick={() => handleCancelOrder(o._id)}
                        className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition-all font-sans text-[11px]"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="text-slate-600 font-sans text-[11px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
