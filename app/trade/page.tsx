'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import PriceChart from '@/components/PriceChart';
import toast from 'react-hot-toast';

function TradeContent() {
  const searchParams = useSearchParams();
  const [asset, setAsset] = useState(searchParams.get('asset') || '★ Butterfly Knife | Doppler (Factory New)');
  const [catalog, setCatalog] = useState<any[]>([]); // Array de obiecte acum
  const [search, setSearch] = useState('');
  const [amount, setAmount] = useState(10);
  const [liveData, setLiveData] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
    
    // 1. Luăm catalogul nou (obiecte)
    fetch('https://api.skintrend.skin/prices/catalog')
      .then(res => res.json())
      .then(data => setCatalog(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Eroare la încărcarea catalogului"));
  }, []);

  // 2. Sync Live cu prețurile HFT din RAM
  useEffect(() => {
    const fetchLive = () => {
      fetch(`https://api.skintrend.skin/prices/live?item=${encodeURIComponent(asset)}`)
        .then(res => res.json())
        .then(data => setLiveData(data));
    };
    fetchLive();
    const interval = setInterval(fetchLive, 5000);
    return () => clearInterval(interval);
  }, [asset]);

  const handleTrade = async (type: 'LONG' | 'SHORT') => {
    if (!token) return toast.error('Trebuie să fii logat!');
    
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
        toast.success(`Poziție ${type} deschisă!`, { id: loadingToast });
      } else {
        const err = await res.json();
        toast.error(err.message || 'Eroare la tranzacție', { id: loadingToast });
      }
    } catch (e) {
      toast.error('Eroare conexiune server', { id: loadingToast });
    }
  };

  // Filtrare inteligentă pentru noul format de catalog
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
            placeholder="Search skins..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 mb-4 text-sm focus:outline-none focus:border-blue-500"
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredCatalog.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setAsset(item.name)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${asset === item.name ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-[#86868b]'}`}
              >
                {item.name}
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
                <p className="text-[#32d74b] text-sm font-mono tracking-wider uppercase">Live Market Data</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black tracking-tighter">
                  ${liveData ? liveData.currentPrice.toLocaleString() : '---'}
                </p>
                <p className="text-[10px] text-[#86868b] uppercase">Price per unit</p>
              </div>
            </div>
            <div className="h-[400px] w-full bg-black/20 rounded-2xl overflow-hidden border border-white/5">
              <PriceChart asset={asset} />
            </div>
          </div>
        </div>

        {/* Coloana Dreaptă: Terminalul de Execuție */}
        <div className="lg:col-span-1 bg-[#1c1c1e] p-6 rounded-[24px] border border-white/5 flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#86868b] mb-4">Execution</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase text-[#86868b] ml-1">Order Amount ($)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-xl font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Spread-ul de Broker în butoane */}
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => handleTrade('LONG')}
                  className="bg-[#32d74b] hover:bg-[#28ad3d] text-black font-black py-4 rounded-xl transition-all active:scale-95 flex flex-col items-center"
                >
                  <span className="text-lg uppercase">Buy / Long</span>
                  <span className="text-[10px] opacity-70">Price: ${liveData?.askPrice || '---'}</span>
                </button>
                <button 
                  onClick={() => handleTrade('SHORT')}
                  className="bg-[#ff453a] hover:bg-[#d63a31] text-white font-black py-4 rounded-xl transition-all active:scale-95 flex flex-col items-center"
                >
                  <span className="text-lg uppercase">Sell / Short</span>
                  <span className="text-[10px] opacity-70">Price: ${liveData?.bidPrice || '---'}</span>
                </button>
              </div>
              
              <p className="text-[10px] text-[#86868b] text-center italic">
                *Prices include 2.0% broker spread and HFT adjustment.
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
    <Suspense fallback={<div className="bg-black min-h-screen"></div>}>
      <TradeContent />
    </Suspense>
  );
}