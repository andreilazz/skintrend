'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function Portfolio() {
  const [token, setToken] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const authFetch = (url: string, tokenStr: string) => {
    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${tokenStr}`,
        'Content-Type': 'application/json',
      }
    });
  };

  const fetchPortfolioData = async (validToken: string) => {
    try {
      const [analyticsRes, posRes, histRes] = await Promise.all([
        authFetch('http://localhost:3001/trading/analytics', validToken),
        authFetch('http://localhost:3001/trading/positions', validToken),
        authFetch('http://localhost:3001/trading/history', validToken)
      ]);

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (posRes.ok) setPositions(await posRes.json());
      if (histRes.ok) setHistory(await histRes.json());
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Eroare la sincronizarea datelor.');
      setLoading(false);
    }
  };

  const handleClose = async (id: number) => {
    if (!token) return;
    const toastId = toast.loading('Closing position...');
    try {
      const res = await fetch(`http://localhost:3001/trading/close/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Position closed successfully.', { id: toastId });
        await fetchPortfolioData(token);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to close position.', { id: toastId });
      }
    } catch (error) {
      toast.error('Server error.', { id: toastId });
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      window.location.href = '/login';
      return;
    }
    setToken(savedToken);
    fetchPortfolioData(savedToken);
    
    // Refresh silențios la fiecare 30 secunde
    const interval = setInterval(() => fetchPortfolioData(savedToken), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !analytics) {
    return (
      <main className="min-h-screen bg-black text-[#f5f5f7] p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto space-y-8">
          <Navbar />
          <div className="flex justify-center mt-32 text-[#86868b] text-sm animate-pulse tracking-widest uppercase font-medium">
            Syncing with market...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-[#f5f5f7] p-4 md:p-8 font-sans selection:bg-[#2997ff]/30">
      <div className="max-w-6xl mx-auto space-y-8">
        <Navbar />

        {/* Titlul Paginii */}
        <div className="pt-4 px-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Portfolio.</h1>
            <p className="text-[#86868b] text-lg">Performance overview and active market exposures.</p>
          </div>
          <div className="flex items-center gap-2 bg-[#1c1c1e] px-4 py-2 rounded-full border border-white/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#32d74b] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#32d74b]"></span>
            </span>
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Live Sync</span>
          </div>
        </div>

        {/* --- PERFORMANCE CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5 hover:border-white/10 transition-colors">
            <h3 className="text-xs text-[#86868b] font-semibold uppercase tracking-wider mb-2">Net Worth</h3>
            <p className="text-3xl font-bold text-white">${analytics.netWorth.toFixed(2)}</p>
          </div>
          
          <div className="bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5 hover:border-white/10 transition-colors">
            <h3 className="text-xs text-[#86868b] font-semibold uppercase tracking-wider mb-2">Total Net Profit</h3>
            <p className={`text-3xl font-bold ${analytics.totalProfit >= 0 ? 'text-[#32d74b]' : 'text-[#ff453a]'}`}>
              {analytics.totalProfit >= 0 ? '+' : ''}${analytics.totalProfit.toFixed(2)}
            </p>
          </div>

          <div className="bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5 hover:border-white/10 transition-colors">
            <h3 className="text-xs text-[#86868b] font-semibold uppercase tracking-wider mb-2">Win Rate</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white">{analytics.winRate.toFixed(1)}%</p>
              <p className="text-xs text-[#86868b] font-medium">/ {analytics.totalTrades} trades</p>
            </div>
          </div>

          <div className="bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-center">
            <h3 className="text-xs text-[#86868b] font-semibold uppercase tracking-wider mb-2">Best Trade</h3>
            {analytics.bestTrade ? (
              <div>
                <p className="text-sm font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" title={analytics.bestTrade.assetName}>
                  {analytics.bestTrade.assetName}
                </p>
                <p className="text-xl font-bold text-[#32d74b] mt-1">+{analytics.bestTrade.profit.toFixed(2)}%</p>
              </div>
            ) : (
              <p className="text-sm text-[#86868b] font-medium mt-1">No data yet.</p>
            )}
          </div>
        </div>

        {/* --- STACKED TABLES (Unul sub altul) --- */}
        <div className="flex flex-col gap-8">
          
          {/* --- ACTIVE POSITIONS --- */}
          <div className="bg-[#1c1c1e] rounded-[24px] border border-white/5 flex flex-col max-h-[500px]">
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Positions</h3>
            </div>
            
            <div className="overflow-y-auto overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#1c1c1e]/95 backdrop-blur-md z-10">
                  <tr className="text-[#86868b] text-[10px] uppercase tracking-wider border-b border-white/5">
                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Asset</th>
                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Side</th>
                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Entry Price</th>
                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Live P&L</th>
                    <th className="px-6 py-4 text-right font-semibold whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {Array.isArray(positions) && positions.map((pos) => {
                    const pnl = Number(pos.liveProfit || 0);
                    const isPositive = pnl >= 0;
                    
                    return (
                      <tr key={pos.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 text-sm font-semibold text-white whitespace-nowrap">
                          {pos.assetName}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[9px] font-bold uppercase ${pos.type === 'LONG' ? 'bg-[#32d74b]/10 text-[#32d74b]' : 'bg-[#ff453a]/10 text-[#ff453a]'}`}>
                            {pos.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#86868b] font-medium">${Number(pos.entryPrice).toFixed(2)}</td>
                        <td className={`px-6 py-4 text-sm font-bold ${isPositive ? 'text-[#32d74b]' : 'text-[#ff453a]'}`}>
                          {isPositive ? '+' : ''}{pnl.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleClose(pos.id)} 
                            className="bg-[#333336] text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-white hover:text-black transition-all active:scale-95"
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {(!positions || positions.length === 0) && (
                <div className="text-center py-16 text-[#86868b] text-sm font-medium">No active market positions.</div>
              )}
            </div>
          </div>

          {/* --- CLOSED HISTORY --- */}
          <div className="bg-[#1c1c1e] rounded-[24px] border border-white/5 flex flex-col max-h-[500px]">
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Trade History</h3>
            </div>
            
            <div className="overflow-y-auto overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#1c1c1e]/95 backdrop-blur-md z-10">
                  <tr className="text-[#86868b] text-[10px] uppercase tracking-wider border-b border-white/5">
                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Asset</th>
                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Side</th>
                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Exit Price</th>
                    <th className="px-6 py-4 text-right font-semibold whitespace-nowrap">Net P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {Array.isArray(history) && history.map((h) => {
                    const pnl = Number(h.profit);
                    const isPositive = pnl >= 0;
                    
                    return (
                      <tr key={h.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-white whitespace-nowrap">
                          {h.assetName}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[9px] font-bold uppercase ${h.type === 'LONG' ? 'bg-white/10 text-white' : 'bg-[#86868b]/10 text-[#86868b]'}`}>
                            {h.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#86868b] font-medium">${Number(h.closePrice).toFixed(2)}</td>
                        <td className={`px-6 py-4 text-right text-sm font-bold ${isPositive ? 'text-[#32d74b]' : 'text-[#ff453a]'}`}>
                          {isPositive ? '+' : ''}{pnl.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {(!history || history.length === 0) && (
                <div className="text-center py-16 text-[#86868b] text-sm font-medium">No closed trades yet.</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}