'use client';

import { useEffect, useState, useRef } from 'react';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function Portfolio() {
  const [token, setToken] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Folosim un ref pentru a urmări valorile anterioare de PnL pentru animații
  const prevPnlRef = useRef<Record<number, number>>({});

  const authFetch = (url: string, tokenStr: string) => {
    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${tokenStr}`,
        'Content-Type': 'application/json',
      }
    });
  };

  const fetchPortfolioData = async (validToken: string, isInitial = false) => {
    if (isInitial) setLoading(true);
    
    try {
      // Optimizare: Cerem toate datele în paralel
      const [analyticsRes, posRes, histRes] = await Promise.all([
        authFetch('https://api.skintrend.skin/trading/analytics', validToken),
        authFetch('https://api.skintrend.skin/trading/positions', validToken),
        authFetch('https://api.skintrend.skin/trading/history', validToken)
      ]);

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (posRes.ok) setPositions(await posRes.json());
      if (histRes.ok) setHistory(await histRes.json());
      
    } catch (err) {
      console.error(err);
      if (isInitial) toast.error('Eroare la sincronizarea datelor.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (id: number) => {
    if (!token) return;
    const toastId = toast.loading('Se închide poziția...');
    try {
      const res = await fetch(`https://api.skintrend.skin/trading/close/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Poziție închisă cu succes.', { id: toastId });
        await fetchPortfolioData(token);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Eroare la închidere.', { id: toastId });
      }
    } catch (error) {
      toast.error('Eroare server.', { id: toastId });
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      window.location.href = '/login';
      return;
    }
    setToken(savedToken);
    
    // Încărcare inițială
    fetchPortfolioData(savedToken, true);
    
    // --- SMART POLLING (HFT Sync) ---
    // Actualizăm datele la fiecare 5 secunde pentru a se potrivi cu motorul HFT
    const interval = setInterval(() => {
      fetchPortfolioData(savedToken);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading || !analytics) {
    return (
      <main className="min-h-screen bg-black text-[#f5f5f7] p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto space-y-8">
          <Navbar />
          <div className="flex justify-center mt-32 text-[#86868b] text-sm animate-pulse tracking-widest uppercase font-medium">
            Sincronizare cu piața live...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-[#f5f5f7] p-4 md:p-8 font-sans selection:bg-[#2997ff]/30">
      <div className="max-w-6xl mx-auto space-y-8">
        <Navbar />

        {/* Header cu Status Live */}
        <div className="pt-4 px-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Portfolio.</h1>
            <p className="text-[#86868b] text-lg">Performanță și expuneri active în piață.</p>
          </div>
          <div className="flex items-center gap-2 bg-[#1c1c1e] px-4 py-2 rounded-full border border-white/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#32d74b] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#32d74b]"></span>
            </span>
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">HFT Engine Sync</span>
          </div>
        </div>

        {/* --- PERFORMANCE CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5 transition-all hover:bg-white/[0.03]">
            <h3 className="text-xs text-[#86868b] font-semibold uppercase tracking-wider mb-2">Net Worth</h3>
            <p className="text-3xl font-bold text-white tracking-tighter transition-all duration-500">
              ${analytics.netWorth.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5 transition-all hover:bg-white/[0.03]">
            <h3 className="text-xs text-[#86868b] font-semibold uppercase tracking-wider mb-2">Total Net Profit</h3>
            <p className={`text-3xl font-bold tracking-tighter transition-colors duration-500 ${analytics.totalProfit >= 0 ? 'text-[#32d74b]' : 'text-[#ff453a]'}`}>
              {analytics.totalProfit >= 0 ? '+' : ''}${analytics.totalProfit.toFixed(2)}
            </p>
          </div>

          <div className="bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5 transition-all hover:bg-white/[0.03]">
            <h3 className="text-xs text-[#86868b] font-semibold uppercase tracking-wider mb-2">Win Rate</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-white tracking-tighter">{analytics.winRate.toFixed(1)}%</p>
              <p className="text-xs text-[#86868b] font-medium">/ {analytics.totalTrades} trades</p>
            </div>
          </div>

          <div className="bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5 transition-all hover:bg-white/[0.03] flex flex-col justify-center">
            <h3 className="text-xs text-[#86868b] font-semibold uppercase tracking-wider mb-2">Best Trade</h3>
            {analytics.bestTrade ? (
              <div>
                <p className="text-sm font-semibold text-white truncate max-w-[200px]" title={analytics.bestTrade.assetName}>
                  {analytics.bestTrade.assetName}
                </p>
                <p className="text-xl font-bold text-[#32d74b] mt-1">+{analytics.bestTrade.profit.toFixed(2)}%</p>
              </div>
            ) : (
              <p className="text-sm text-[#86868b] font-medium mt-1">Niciun trade încă.</p>
            )}
          </div>
        </div>

        {/* --- TABELE ACTIVE ȘI ISTORIC --- */}
        <div className="flex flex-col gap-8">
          
          {/* --- ACTIVE POSITIONS --- */}
          <div className="bg-[#1c1c1e] rounded-[24px] border border-white/5 flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Poziții Active</h3>
              <span className="text-[10px] text-[#86868b] font-medium bg-white/5 px-2 py-0.5 rounded-full uppercase">Live Update</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#86868b] text-[10px] uppercase tracking-wider border-b border-white/5">
                    <th className="px-6 py-4 font-semibold">Asset</th>
                    <th className="px-6 py-4 font-semibold">Side</th>
                    <th className="px-6 py-4 font-semibold">Entry</th>
                    <th className="px-6 py-4 font-semibold">Live P&L</th>
                    <th className="px-6 py-4 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {positions.map((pos) => {
                    const pnl = Number(pos.liveProfit || 0);
                    const isPositive = pnl >= 0;
                    
                    // Logică pentru flash effect (opțional, dar adaugă vibe-ul de terminal)
                    const prevPnl = prevPnlRef.current[pos.id];
                    const hasChanged = prevPnl !== undefined && prevPnl !== pnl;
                    prevPnlRef.current[pos.id] = pnl;

                    return (
                      <tr key={pos.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 text-sm font-semibold text-white whitespace-nowrap">
                          {pos.assetName}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${pos.type === 'LONG' ? 'bg-[#32d74b]/10 text-[#32d74b]' : 'bg-[#ff453a]/10 text-[#ff453a]'}`}>
                            {pos.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#86868b] font-mono">${Number(pos.entryPrice).toFixed(2)}</td>
                        <td className={`px-6 py-4 text-sm font-bold font-mono transition-all duration-300 ${isPositive ? 'text-[#32d74b]' : 'text-[#ff453a]'}`}>
                          {isPositive ? '+' : ''}{pnl.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleClose(pos.id)} 
                            className="bg-[#333336] text-white px-5 py-1.5 rounded-full text-xs font-bold hover:bg-white hover:text-black transition-all active:scale-95 shadow-lg"
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {positions.length === 0 && (
                <div className="text-center py-20 text-[#86868b] text-sm font-medium">Nicio poziție activă în piață.</div>
              )}
            </div>
          </div>

          {/* --- TRADE HISTORY --- */}
          {/* ... (Codul pentru istoric rămâne același, se updatează și el automat la refresh) ... */}
        </div>

      </div>
    </main>
  );
}