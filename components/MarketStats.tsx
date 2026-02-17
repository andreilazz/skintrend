'use client';

import { useEffect, useState } from 'react';

export default function MarketStats() {
  const [stats, setStats] = useState({ totalAssetsTracked: 0, liquidMarketCap: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.skintrend.skin/prices/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Eroare la preluarea Market Stats:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 py-6 px-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] mt-12 w-full max-w-4xl mx-auto transition-all duration-500 hover:border-white/20 hover:bg-white/10">
      
      {/* Liquid Market Cap */}
      <div className="flex-1 text-center sm:text-left">
        <p className="text-xs text-[#86868b] uppercase tracking-widest font-semibold mb-2">
          Liquid Market Cap
        </p>
        <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          {loading ? (
            <span className="animate-pulse text-gray-600">Calculăm...</span>
          ) : (
            `$${stats.liquidMarketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
          )}
        </h3>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-16 bg-white/10"></div>

      {/* Tracked Assets */}
      <div className="flex-1 text-center">
        <p className="text-xs text-[#86868b] uppercase tracking-widest font-semibold mb-2">
          Active Assets (HFT)
        </p>
        <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
          {loading ? (
            <span className="animate-pulse text-gray-600">...</span>
          ) : (
            stats.totalAssetsTracked.toLocaleString()
          )}
        </h3>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-16 bg-white/10"></div>

      {/* System Status */}
      <div className="flex-1 text-center sm:text-right">
        <p className="text-xs text-[#86868b] uppercase tracking-widest font-semibold mb-2">
          Engine Status
        </p>
        <div className="flex items-center justify-center sm:justify-end gap-2 mt-2 md:mt-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#32d74b] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#32d74b]"></span>
          </span>
          <span className="text-sm font-bold text-[#32d74b] tracking-wide uppercase">
            Optimal
          </span>
        </div>
      </div>

    </div>
  );
}