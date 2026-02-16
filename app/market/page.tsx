'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import toast from 'react-hot-toast';

export default function Market() {
  const router = useRouter();
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMarkets = async () => {
    try {
      const res = await fetch('http://localhost:3001/prices/movers');
      const data = await res.json();
      if (res.ok) {
        // Pentru fiecare market, aducem și istoricul scurt pentru mini-grafic
        const enrichedData = await Promise.all(data.map(async (item: any) => {
          const histRes = await fetch(`http://localhost:3001/prices/history?assetName=${encodeURIComponent(item.assetName)}`);
          const history = await histRes.json();
          return { ...item, history: history.slice(-20) }; // Ultimele 20 de puncte pentru sparkline
        }));
        setMarkets(enrichedData);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync market data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 10000); // Refresh la 10 secunde
    return () => clearInterval(interval);
  }, []);

  const handleTradeNavigate = (assetName: string) => {
    // Schimbăm din /terminal în /trade
    router.push(`/trade?asset=${encodeURIComponent(assetName)}`);
  };
  return (
    <main className="min-h-screen bg-black text-[#f5f5f7] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        <Navbar />

        {/* Header Section */}
        <div className="pt-8 px-2">
          <h1 className="text-5xl font-bold tracking-tight mb-4 text-white">Markets.</h1>
          <p className="text-[#86868b] text-xl font-medium max-w-2xl">
            Real-time performance of high-end CS2 assets. Select a market to open the trading terminal.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-[#86868b] text-sm animate-pulse tracking-widest uppercase font-bold">
              Loading Market Ticks...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {markets.map((market) => {
              const isPositive = market.change >= 0;
              return (
                <div 
                  key={market.assetName}
                  onClick={() => handleTradeNavigate(market.assetName)}
                  className="bg-[#1c1c1e] rounded-[32px] border border-white/5 p-6 hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between h-[240px] shadow-2xl active:scale-[0.98]"
                >
                  {/* Top Info */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#86868b] uppercase tracking-wider group-hover:text-white transition-colors truncate">
                      {market.assetName}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">${Number(market.currentPrice).toFixed(2)}</span>
                      <span className={`text-xs font-bold ${isPositive ? 'text-[#32d74b]' : 'text-[#ff453a]'}`}>
                        {isPositive ? '▲' : '▼'} {Math.abs(market.change).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Sparkline Chart */}
                  <div className="h-20 w-full mt-4 -ml-2 pointer-events-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={market.history}>
                        <YAxis domain={['auto', 'auto']} hide />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={isPositive ? '#32d74b' : '#ff453a'} 
                          strokeWidth={2.5} 
                          dot={false} 
                          animationDuration={1000}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Footer Action */}
                  <div className="mt-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#2997ff]">Open Terminal</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2997ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}