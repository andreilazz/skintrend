'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import toast from 'react-hot-toast';

// IMPORT EXTREM DE IMPORTANT PENTRU GRAFICE ÎN NEXT.JS (Dezactivează SSR)
const PriceChart = dynamic(() => import('@/components/PriceChart'), { ssr: false });

function TradeContent() {
  const searchParams = useSearchParams();
  const [asset, setAsset] = useState(searchParams.get('asset') || '★ Butterfly Knife | Doppler (Factory New)');
  const [catalog, setCatalog] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [amount, setAmount] = useState(10);
  const [liveData, setLiveData] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  // STATE PENTRU GRAFIC
  const [chartData, setChartData] = useState<{ time: number; value: number }[]>([]);
  const [timeframe, setTimeframe] = useState('1H');

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    
    fetch('https://api.skintrend.skin/prices/catalog')
      .then(res => res.json())
      .then(data => setCatalog(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Eroare la încărcarea catalogului"));
  }, []);

  // Fetch Live Data & History pentru grafic
  useEffect(() => {
    const fetchLive = () => {
      fetch(`https://api.skintrend.skin/prices/live?item=${encodeURIComponent(asset)}`)
        .then(res => res.json())
        .then(data => setLiveData(data));
    };

    const fetchHistory = () => {
      fetch(`https://api.skintrend.skin/prices/history?item=${encodeURIComponent(asset)}&timeframe=${timeframe}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setChartData(data);
        });
    };

    fetchLive();
    fetchHistory(); // Tragem pozele salvate din DB pentru a desena graficul

    const interval = setInterval(fetchLive, 5000);
    return () => clearInterval(interval);
  }, [asset, timeframe]);

  const handleTrade = async (type: 'LONG' | 'SHORT') => {
    if (!token) return toast.error('Trebuie să fii logat!');
    if (amount <= 0) return toast.error('Suma trebuie să fie mai mare ca 0.');
    
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
      } else {
        const err = await res.json();
        toast.error(err.message || 'Eroare la tranzacție', { id: loadingToast });
      }
    } catch (e) {
      toast.error('Eroare conexiune server', { id: loadingToast });
    }
  };

  const filteredCatalog = catalog.filter(item => 
    item.name && item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <Navbar />
      <div className="max-w-7xl mx-auto mt-20 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Coloana Stângă: Selector Skin-uri */}
        <div className="lg:col-span-1 bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5 h-fit">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#86868b] mb-4">Select Asset</h2>
          <input 
            type="text"
            placeholder="Caută skin-uri..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 mb-4 text-sm focus:outline-none focus:border-[#2997ff]"
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredCatalog.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setAsset(item.name)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${asset === item.name ? 'bg-[#2997ff] text-white shadow-lg' : 'hover:bg-white/5 text-[#86868b]'}`}
              >
                <div className="truncate">{item.name}</div>
                <div className="text-[10px] opacity-70 mt-1">${item.currentPrice?.toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Coloana Centrală: Grafic & Live Data */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold">{asset}</h1>
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

            {/* Butoane Timeframe */}
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

            {/* Graficul Randat */}
            <div className="h-[400px] w-full bg-black/20 rounded-2xl overflow-hidden border border-white/5 relative">
              {chartData.length > 0 ? (
                <PriceChart 
                  data={chartData} 
                  colors={{ 
                    backgroundColor: 'transparent', 
                    lineColor: '#2997ff', 
                    areaTopColor: 'rgba(41, 151, 255, 0.2)', 
                    areaBottomColor: 'rgba(41, 151, 255, 0.0)' 
                  }} 
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#86868b] text-sm font-medium animate-pulse">
                  Se descarcă istoricul prețurilor...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coloana Dreaptă: Terminalul de Execuție */}
        <div className="lg:col-span-1 bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5 flex flex-col gap-6 h-fit">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-6 border-b border-white/5 pb-4">Order Execution</h2>
            <div className="space-y-6">
              
              <div>
                <label className="text-xs uppercase text-[#86868b] tracking-wider mb-2 block font-semibold">Position Size (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#86868b] font-medium">$</span>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-black border border-white/10 pl-10 pr-4 py-4 rounded-xl text-xl font-bold focus:outline-none focus:border-[#2997ff] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-4 border-t border-white/5">
                <button 
                  onClick={() => handleTrade('LONG')}
                  className="bg-[#32d74b]/10 border border-[#32d74b]/30 hover:bg-[#32d74b] text-[#32d74b] hover:text-black font-black py-4 rounded-xl transition-all active:scale-95 flex flex-col items-center group"
                >
                  <span className="text-lg tracking-wide">BUY / LONG</span>
                  <span className="text-[10px] opacity-80 uppercase tracking-widest mt-1 group-hover:text-black/80">
                    Ask: ${liveData?.askPrice || '---'}
                  </span>
                </button>
                <button 
                  onClick={() => handleTrade('SHORT')}
                  className="bg-[#ff453a]/10 border border-[#ff453a]/30 hover:bg-[#ff453a] text-[#ff453a] hover:text-white font-black py-4 rounded-xl transition-all active:scale-95 flex flex-col items-center group"
                >
                  <span className="text-lg tracking-wide">SELL / SHORT</span>
                  <span className="text-[10px] opacity-80 uppercase tracking-widest mt-1 group-hover:text-white/80">
                    Bid: ${liveData?.bidPrice || '---'}
                  </span>
                </button>
              </div>
              
              <p className="text-[10px] text-[#86868b] text-center italic font-medium">
                Execuția include spread-ul brokerului (2.0%) conform cotei live de piață HFT.
              </p>
            </div>
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