'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';

// Importăm graficul fără SSR (Server Side Rendering) ca să nu crape
const PriceChart = dynamic(() => import('@/components/PriceChart'), { ssr: false });

function TradeContent() {
  const searchParams = useSearchParams();
  const [asset, setAsset] = useState(searchParams.get('asset') || '★ Butterfly Knife | Doppler (Factory New)');
  const [catalog, setCatalog] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [amount, setAmount] = useState(10);
  const [liveData, setLiveData] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  // Stări pentru Grafic
  const [chartData, setChartData] = useState<{ time: number; value: number }[]>([]);
  const [timeframe, setTimeframe] = useState('1H');

  // Stare pentru Pozițiile Active
  const [positions, setPositions] = useState<any[]>([]);

  // 1. Inițializare (Token + Catalog)
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    setToken(savedToken);
    
    fetch('https://api.skintrend.skin/prices/catalog')
      .then(res => res.json())
      .then(data => setCatalog(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Eroare la încărcarea catalogului"));
  }, []);

  // 2. Fetcher pentru Pozițiile Active
  const fetchPositions = async (validToken: string) => {
    try {
      const res = await fetch('https://api.skintrend.skin/trading/positions', {
        headers: { 'Authorization': `Bearer ${validToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPositions(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Eroare la poziții:", e);
    }
  };

  // 3. Engine-ul Principal (Grafic + Date Live + Update Poziții)
  useEffect(() => {
    let isMounted = true;

    const fetchLive = async () => {
      try {
        const res = await fetch(`https://api.skintrend.skin/prices/live?item=${encodeURIComponent(asset)}`);
        const data = await res.json();
        if (isMounted) setLiveData(data);
        return data;
      } catch (e) { return null; }
    };

    const fetchHistory = async (currentPrice: number) => {
      try {
        const res = await fetch(`https://api.skintrend.skin/prices/history?item=${encodeURIComponent(asset)}&timeframe=${timeframe}`);
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 1) {
          if (isMounted) setChartData(data);
        } else if (currentPrice) {
          // Fallback dacă nu există istoric în DB încă
          const fallback = [];
          let simPrice = currentPrice * 0.95; 
          const now = Math.floor(Date.now() / 1000);
          for (let i = 30; i > 0; i--) {
            fallback.push({ time: now - (i * 3600), value: Number(simPrice.toFixed(2)) });
            simPrice = simPrice + (simPrice * (Math.random() * 0.03 - 0.012)); 
          }
          fallback.push({ time: now, value: currentPrice }); 
          if (isMounted) setChartData(fallback);
        }
      } catch (e) { console.error(e); }
    };

    const initData = async () => {
      setChartData([]); // Resetăm graficul la schimbarea itemului
      const live = await fetchLive();
      if (live && live.currentPrice) {
        await fetchHistory(live.currentPrice);
      }
      if (token) fetchPositions(token);
    };

    initData();

    // HFT Interval: Tragem prețul live și actualizăm PnL-ul la poziții din 5 în 5 secunde
    const interval = setInterval(() => {
      fetchLive();
      if (token) fetchPositions(token);
    }, 5000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [asset, timeframe, token]);

  // 4. Deschide Tranzacție
  const handleTrade = async (type: 'LONG' | 'SHORT') => {
    if (!token) return toast.error('Trebuie să fii logat!');
    if (amount <= 0) return toast.error('Suma trebuie să fie validă.');
    
    const loadingToast = toast.loading('Se execută ordinul...');
    try {
      const res = await fetch('https://api.skintrend.skin/trading/open', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, amount, assetName: asset })
      });

      if (res.ok) {
        toast.success(`Poziție ${type} deschisă cu succes!`, { id: loadingToast });
        fetchPositions(token); // Reîncărcăm tabelul instant
      } else {
        const err = await res.json();
        toast.error(err.message || 'Eroare la tranzacție', { id: loadingToast });
      }
    } catch (e) {
      toast.error('Eroare conexiune server', { id: loadingToast });
    }
  };

  // 5. Închide Tranzacție
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
        fetchPositions(token); // Reîncărcăm tabelul
      } else {
        const err = await res.json();
        toast.error(err.message || 'Eroare la închidere.', { id: toastId });
      }
    } catch (error) {
      toast.error('Eroare server.', { id: toastId });
    }
  };

  const filteredCatalog = catalog.filter(item => 
    item.name && item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 font-sans selection:bg-[#2997ff]/30">
      <Navbar />
      
      <div className="max-w-7xl mx-auto mt-20 space-y-8">
        
        {/* PARTEA DE SUS: Selector, Grafic și Execuție */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Coloana Stângă: Selector Skin-uri */}
          <div className="lg:col-span-1 bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5 h-[600px] flex flex-col">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#86868b] mb-4">Select Asset</h2>
            <input 
              type="text"
              placeholder="Caută skin-uri..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 mb-4 text-sm focus:outline-none focus:border-[#2997ff] transition-colors"
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {filteredCatalog.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setAsset(item.name)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${asset === item.name ? 'bg-[#2997ff] text-white shadow-lg' : 'hover:bg-white/5 text-[#86868b]'}`}
                >
                  <div className="truncate font-medium">{item.name}</div>
                  <div className="text-[10px] opacity-70 mt-1 font-mono">${item.currentPrice?.toLocaleString()}</div>
                </button>
              ))}
              {filteredCatalog.length === 0 && (
                <div className="text-center text-[#86868b] text-sm mt-10">Nu am găsit skin-ul.</div>
              )}
            </div>
          </div>

          {/* Coloana Centrală: Grafic & Live Data */}
          <div className="lg:col-span-2 bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5 h-[600px] flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{asset}</h1>
                <p className="text-[#32d74b] text-sm font-mono tracking-wider uppercase flex items-center gap-2 mt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#32d74b] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#32d74b]"></span>
                  </span>
                  Live Market Data
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black tracking-tighter">
                  ${liveData ? liveData.currentPrice.toLocaleString() : '---'}
                </p>
                <p className="text-[10px] text-[#86868b] uppercase tracking-widest mt-1">Market Price</p>
              </div>
            </div>

            <div className="flex bg-black border border-white/10 rounded-full p-1 gap-1 mb-4 w-fit">
              {['1H', '1D', '1W', 'ALL'].map(tf => (
                <button 
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                    timeframe === tf ? 'bg-white text-black shadow-md' : 'text-[#86868b] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="flex-1 w-full bg-black/20 rounded-2xl overflow-hidden border border-white/5 relative">
              {chartData.length > 0 ? (
                <PriceChart 
                  data={chartData} 
                  colors={{ backgroundColor: 'transparent', lineColor: '#2997ff', areaTopColor: 'rgba(41, 151, 255, 0.2)', areaBottomColor: 'rgba(41, 151, 255, 0.0)' }} 
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#86868b] text-sm font-medium animate-pulse">
                  Se desenează graficul...
                </div>
              )}
            </div>
          </div>

          {/* Coloana Dreaptă: Terminalul de Execuție */}
          <div className="lg:col-span-1 bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5 flex flex-col h-[600px]">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-6 border-b border-white/5 pb-4">Order Execution</h2>
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              
              <div>
                <label className="text-xs uppercase text-[#86868b] tracking-wider mb-2 block font-semibold ml-1">Position Size (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#86868b] font-medium">$</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-black border border-white/10 pl-10 pr-4 py-4 rounded-xl text-xl font-bold focus:outline-none focus:border-[#2997ff] text-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-4 border-t border-white/5">
                <button 
                  onClick={() => handleTrade('LONG')}
                  className="bg-[#32d74b]/10 border border-[#32d74b]/30 hover:bg-[#32d74b] text-[#32d74b] hover:text-black font-black py-5 rounded-xl transition-all active:scale-95 flex flex-col items-center group shadow-lg"
                >
                  <span className="text-lg tracking-wide">BUY / LONG</span>
                  <span className="text-[10px] opacity-80 uppercase tracking-widest mt-1 group-hover:text-black/80 font-mono">
                    Ask: ${liveData?.askPrice || '---'}
                  </span>
                </button>
                <button 
                  onClick={() => handleTrade('SHORT')}
                  className="bg-[#ff453a]/10 border border-[#ff453a]/30 hover:bg-[#ff453a] text-[#ff453a] hover:text-white font-black py-5 rounded-xl transition-all active:scale-95 flex flex-col items-center group shadow-lg"
                >
                  <span className="text-lg tracking-wide">SELL / SHORT</span>
                  <span className="text-[10px] opacity-80 uppercase tracking-widest mt-1 group-hover:text-white/80 font-mono">
                    Bid: ${liveData?.bidPrice || '---'}
                  </span>
                </button>
              </div>
              
              <p className="text-[10px] text-[#86868b] text-center italic font-medium mt-auto">
                Execuția include spread-ul brokerului.
              </p>
            </div>
          </div>

        </div>

        {/* PARTEA DE JOS: Tabelul cu Poziții Active */}
        <div className="bg-[#1c1c1e] rounded-[24px] border border-white/5 overflow-hidden shadow-2xl">
          <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h3 className="text-lg font-bold text-white tracking-tight">Active Market Exposures</h3>
            <span className="bg-[#2997ff]/10 border border-[#2997ff]/20 text-[#2997ff] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              {positions.length} Open
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[#86868b] text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="px-6 py-4 font-semibold">Asset Name</th>
                  <th className="px-6 py-4 font-semibold">Direction</th>
                  <th className="px-6 py-4 font-semibold">Entry Price</th>
                  <th className="px-6 py-4 font-semibold">Live Market</th>
                  <th className="px-6 py-4 font-semibold">Current P&L</th>
                  <th className="px-6 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {positions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#86868b] font-medium">
                      Nicio poziție activă momentan. Găsește un trade!
                    </td>
                  </tr>
                ) : (
                  positions.map((pos) => {
                    const pnl = Number(pos.liveProfit || 0);
                    const isPositive = pnl >= 0;
                    
                    return (
                      <tr key={pos.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 font-semibold text-white">{pos.assetName}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[10px] font-bold uppercase ${pos.type === 'LONG' ? 'bg-[#32d74b]/10 text-[#32d74b]' : 'bg-[#ff453a]/10 text-[#ff453a]'}`}>
                            {pos.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#86868b] font-mono">${Number(pos.entryPrice).toFixed(2)}</td>
                        <td className="px-6 py-4 text-white font-mono">${Number(pos.currentPrice || pos.entryPrice).toFixed(2)}</td>
                        <td className={`px-6 py-4 font-bold font-mono transition-colors ${isPositive ? 'text-[#32d74b]' : 'text-[#ff453a]'}`}>
                          {isPositive ? '+' : ''}{pnl.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleClose(pos.id)} 
                            className="bg-[#333336] text-white px-5 py-1.5 rounded-full text-xs font-bold hover:bg-white hover:text-black transition-all active:scale-95 shadow-md"
                          >
                            Close
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function TradePage() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen flex items-center justify-center text-white">Loading Terminal...</div>}>
      <TradeContent />
    </Suspense>
  );
}