import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, ShieldCheck, Clock, RefreshCw, DollarSign, Activity } from 'lucide-react';

const API_URL = 'http://localhost:5001/api/transactions';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(API_URL);
      setTransactions(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 2000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'SAFE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck size={14} className="text-emerald-400" /> SAFE
        </span>
      );
    } else if (status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
          <Clock size={14} className="text-amber-400" /> PENDING
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-500/20 animate-bounce">
          <ShieldAlert size={14} className="text-rose-400" /> {status}
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-sky-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 rounded-xl border border-sky-500/20 text-sky-400">
              <DollarSign size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                FinTech Real-Time Fraud Monitor
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Activity size={12} className="text-sky-400" /> Microservices Live Telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/20 shadow-inner">
            <RefreshCw size={14} className="animate-spin text-emerald-400" />
            <span>LIVE STREAMING</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping ml-1"></span>
          </div>
        </header>

        <main className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-semibold text-slate-300">Live Transaction Feed</h2>
            <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2.5 py-1 rounded-md border border-slate-700">
              Auto-refresh: 2s
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800/80">
              <RefreshCw size={32} className="animate-spin text-sky-500 mb-3" />
              <p className="text-slate-400 text-sm animate-pulse">Connecting to Ingestion API...</p>
            </div>
          ) : (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-800/80">
                      <th className="py-4 px-6">Transaction ID</th>
                      <th className="py-4 px-6">User</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6">Origin</th>
                      <th className="py-4 px-6">Timestamp</th>
                      <th className="py-4 px-6 text-right">Risk Assessment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm font-medium">
                    {transactions.map((tx) => {
                      const isFraud = tx.status !== 'SAFE' && tx.status !== 'PENDING';
                      return (
                        <tr 
                          key={tx._id} 
                          className={`transition-all duration-200 hover:bg-slate-800/40 ${
                            isFraud ? 'bg-rose-500/10 hover:bg-rose-500/15 font-semibold' : ''
                          }`}
                        >
                          <td className="py-4 px-6 font-mono text-sky-400">
                            {tx.txId}
                          </td>
                          <td className="py-4 px-6 text-slate-300">
                            <span className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300 font-mono border border-slate-700/50">
                              {tx.userId}
                            </span>
                          </td>
                          <td className={`py-4 px-6 font-mono ${isFraud ? 'text-rose-300 font-bold text-base' : 'text-slate-200'}`}>
                            Rs. {tx.amount?.toLocaleString()}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono ${
                              tx.country !== 'LK' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {tx.country}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-400 text-xs font-mono">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                            {getStatusBadge(tx.status)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;