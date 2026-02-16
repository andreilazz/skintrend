'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

const PriceChart = dynamic(() => import('../../components/PriceChart'), { ssr: false });
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast'; 

export default function TradePage() {
  const [user, setUser] = useState<{ username: string; balance: number; avatar?: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [data, setData] = useState<{ time: number; value: number }[]>([]);
  const [tradeAmount, setTradeAmount] = useState<number>(100);
  const [positions, setPositions] = useState<any[]>([]); 
  const [catalog, setCatalog] = useState<Record<string, string[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('');
  
  const [timeframe, setTimeframe] = useState<string>('1H');
  const [actionLoading, setActionLoading] = useState(false);

  const itemRef = useRef(selectedItem);
  const timeframeRef = useRef(timeframe);

  useEffect(() => { itemRef.current = selectedItem; }, [selectedItem]);
  useEffect(() => { timeframeRef.current = timeframe; }, [timeframe]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    if (urlToken) {
      localStorage.setItem('token', urlToken);
      setToken(urlToken);
      // Actualizat să curețe URL-ul pe /trade
      window.history.replaceState({}, document.title, "/trade");
      toast.success('Logged in securely via Steam.');
    } else {
      const savedToken = localStorage.getItem('token');
      if (savedToken) setToken(savedToken);
      else window.location.href = '/login'; 
    }
  }, []);

  const authFetch = (url: string, options: any = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
  };

  const updateAllData = async () => {
    if (!token || !itemRef.current) return;
    try {
      const pRes = await fetch(`https://api.skintrend.skin/prices/history?item=${encodeURIComponent(itemRef.current)}&timeframe=${timeframeRef.current}`);
      const pJson = await pRes.json();
      if (Array.isArray(pJson)) setData(pJson);

      const posRes = await authFetch('https://api.skintrend.skin/trading/positions');
      const posJson = await posRes.json();
      if (Array.isArray(posJson)) setPositions(posJson);

      const balRes = await authFetch('https://api.skintrend.skin/trading/balance');
      const balJson = await balRes.json();
      if (balJson && balJson.balance !== undefined) {
        const profileRes = await authFetch('https://api.skintrend.skin/auth/profile');
        const profileJson = await profileRes.json();
        const userData = { username: profileJson.username, balance: balJson.balance, avatar: profileJson.avatar };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (err) { console.error('Error updating trade data', err); }
  };

  const handleTrade = async (type: 'LONG' | 'SHORT') => {
    if (tradeAmount <= 0) return toast.error('Investment amount must be greater than zero.');
    
    setActionLoading(true);
    const toastId = toast.loading('Executing order...');
    
    try {
      const res = await authFetch('https://api.skintrend.skin/trading/order', {
        method: 'POST',
        body: JSON.stringify({ type, amount: tradeAmount, assetName: selectedItem }),
      });
      
      if (res.ok) {
        toast.success(`${type} position opened successfully.`, { id: toastId });
        await updateAllData();
      } else { 
        const err = await res.json(); 
        toast.error(err.message || 'Execution failed.', { id: toastId }); 
      }
    } catch(err) {
      toast.error('Network error.', { id: toastId }); 
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async (id: number) => {
    const toastId = toast.loading('Closing position...');
    try {
      const res = await authFetch(`https://api.skintrend.skin/trading/close/${id}`, { method: 'POST' });
      if (res.ok) {
        toast.success('Position closed and settled.', { id: toastId });
        await updateAllData();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Error closing position.', { id: toastId });
      }
    } catch(err) {
      toast.error('Network error.', { id: toastId }); 
    }
  };

  useEffect(() => {
    fetch('https://api.skintrend.skin/prices/catalog')
      .then(res => res.json())
      .then(json => {
        setCatalog(json);

        // --- SYNC CU MARKET ---
        const urlParams = new URLSearchParams(window.location.search);
        const assetFromUrl = urlParams.get('asset');

        if (assetFromUrl) {
          const category = Object.keys(json).find(cat => json[cat].includes(assetFromUrl));
          if (category) {
            setSelectedCategory(category);
            setSelectedItem(assetFromUrl);
            return;
          }
        }

        const firstCat = Object.keys(json)[0];
        if (firstCat && json[firstCat]) {
          setSelectedCategory(firstCat);
          setSelectedItem(json[firstCat][0]);
        }
      });
  }, []);

  useEffect(() => {
    if (token && selectedItem) {
      updateAllData();
      const interval = setInterval(updateAllData, 30000);
      return () => clearInterval(interval);
    }
  }, [token, selectedItem, timeframe]);

  if (!token) return null;

  return (
    <main className="min-h-screen bg-black text-[#f5f5f7] p-4 md:p-8 font-sans selection:bg-[#2997ff]/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <Navbar />

        <div className="flex justify-between items-end px-2 pt-2">
           <div>
             <h1 className="text-4xl font-bold tracking-tight mb-1 text-white">{selectedItem || 'Select an asset'}</h1>
             <p className="text-[#86868b] text-sm uppercase tracking-wider font-medium">CS2 Market • {selectedCategory || 'Loading...'}</p>
           </div>
           
           <div className="text-right">
              <p className="text-3xl font-bold text-white">
                {data.length > 0 ? `$${data[data.length - 1].value.toFixed(2)}` : '---'}
              </p>
              <p className="text-sm font-medium text-[#32d74b]">Live Feed Active</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <div className="lg:col-span-3 bg-[#1c1c1e] p-6 rounded-[32px] border border-white/5 flex flex-col h-[600px] shadow-2xl relative">
            <div className="flex justify-between items-center mb-6 z-10">
              <div className="flex bg-black border border-white/10 rounded-full p-1 gap-1">
                {['1H', '1D', '1W', 'ALL'].map(tf => (
                  <button 
                    key={tf}
                    onClick={() => { setTimeframe(tf); setTimeout(updateAllData, 0); }}
                    className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${
                      timeframe === tf ? 'bg-white text-black shadow-md' : 'text-[#86868b] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full h-[400px] relative mt-4">
              {data.length > 0 ? (
                <PriceChart 
                  data={data} 
                  colors={{ 
                    backgroundColor: 'transparent', 
                    lineColor: '#2997ff', 
                    areaTopColor: 'rgba(41, 151, 255, 0.2)', 
                    areaBottomColor: 'rgba(41, 151, 255, 0.0)' 
                  }} 
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#86868b] text-sm animate-pulse">Syncing market data...</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#1c1c1e] p-6 rounded-[32px] border border-white/5 shadow-xl h-full flex flex-col">
              <h3 className="text-lg font-semibold text-white mb-6 border-b border-white/5 pb-4">Order Execution</h3>
              
              <div className="space-y-5 flex-1">
                <div>
                  <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2 block ml-1">Market Category</label>
                  <select 
                    className="w-full bg-black border border-white/10 p-4 rounded-[16px] text-sm text-white outline-none focus:border-[#2997ff] appearance-none" 
                    value={selectedCategory} 
                    onChange={(e) => { 
                      setSelectedCategory(e.target.value); 
                      if(catalog[e.target.value]) setSelectedItem(catalog[e.target.value][0]); 
                    }}
                  >
                    {Object.keys(catalog).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2 block ml-1">Select Asset</label>
                  <select 
                    className="w-full bg-black border border-white/10 p-4 rounded-[16px] text-sm font-semibold text-[#2997ff] outline-none focus:border-[#2997ff] appearance-none" 
                    value={selectedItem} 
                    onChange={(e) => setSelectedItem(e.target.value)}
                  >
                    {catalog[selectedCategory]?.map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>

                <div className="pt-2">
                  <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-2 block ml-1">Position Size (USD)</label>
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#86868b] font-medium">$</span>
                     <input 
                       type="number" 
                       value={tradeAmount} 
                       onChange={e => setTradeAmount(Number(e.target.value))} 
                       className="w-full bg-black border border-white/10 pl-10 pr-4 py-4 rounded-[16px] text-xl font-bold text-white outline-none focus:border-[#2997ff]" 
                     />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button onClick={() => handleTrade('LONG')} disabled={actionLoading} className="bg-[#32d74b]/10 text-[#32d74b] hover:bg-[#32d74b] hover:text-black border border-[#32d74b]/30 py-4 rounded-[16px] font-bold text-sm transition-all active:scale-95 flex flex-col items-center justify-center gap-1">
                    <span>LONG</span>
                    <span className="text-[9px] uppercase tracking-widest opacity-80">(Buy)</span>
                  </button>
                  <button onClick={() => handleTrade('SHORT')} disabled={actionLoading} className="bg-[#ff453a]/10 text-[#ff453a] hover:bg-[#ff453a] hover:text-white border border-[#ff453a]/30 py-4 rounded-[16px] font-bold text-sm transition-all active:scale-95 flex flex-col items-center justify-center gap-1">
                    <span>SHORT</span>
                    <span className="text-[9px] uppercase tracking-widest opacity-80">(Sell)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Poziții Active */}
        <div className="bg-[#1c1c1e] rounded-[32px] border border-white/5 overflow-hidden">
          <div className="px-6 py-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Active Market Exposures</h3>
            <span className="bg-[#2997ff]/10 text-[#2997ff] text-xs font-bold px-3 py-1 rounded-full">{positions.length} Open</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[#86868b] text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="px-6 py-4 font-medium">Asset</th>
                  <th className="px-6 py-4 font-medium">Direction</th>
                  <th className="px-6 py-4 font-medium">Entry Price</th>
                  <th className="px-6 py-4 font-medium">Live Market Price</th>
                  <th className="px-6 py-4 font-medium">Current P&L</th>
                  <th className="px-6 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {positions.map((pos) => {
                  const pnl = Number(pos.liveProfit || 0);
                  const isPositive = pnl >= 0;
                  return (
                    <tr key={pos.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-white">{pos.assetName}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${pos.type === 'LONG' ? 'bg-[#32d74b]/10 text-[#32d74b]' : 'bg-[#ff453a]/10 text-[#ff453a]'}`}>
                          {pos.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#86868b]">${Number(pos.entryPrice).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-white">${Number(pos.currentPrice || pos.entryPrice).toFixed(2)}</td>
                      <td className={`px-6 py-4 text-sm font-semibold ${isPositive ? 'text-[#32d74b]' : 'text-[#ff453a]'}`}>
                        {isPositive ? '+' : ''}{pnl.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleClose(pos.id)} className="bg-[#333336] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-white hover:text-black transition-colors">Close</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}