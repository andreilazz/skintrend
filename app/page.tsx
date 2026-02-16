'use client';

import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-[#f5f5f7] font-sans selection:bg-[#2997ff]/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow effect pe fundal */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#2997ff] opacity-[0.05] blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-[#86868b] text-xs font-semibold uppercase tracking-widest mb-8">
          <span className="w-2 h-2 rounded-full bg-[#32d74b] animate-pulse" />
          Skinport API Live
        </div>

        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 leading-tight">
          Invest in <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#86868b]">
            Digital Assets.
          </span>
        </h1>
        
        <p className="text-lg md:text-2xl text-[#86868b] max-w-2xl font-medium tracking-tight mb-10">
          The cleanest, most advanced CS2 trading platform. 
          Real-time market data, secure transactions, and instant liquidity.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            href="/trade" 
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:scale-105 transition-transform duration-300"
          >
            Enter Terminal
          </Link>
          <Link 
            href="/market" 
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#1c1c1e] text-white border border-white/10 font-semibold text-lg hover:bg-white/10 transition-colors duration-300"
          >
            View Marketplace
          </Link>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-[#1c1c1e] p-10 rounded-[32px] border border-white/5 flex flex-col items-start hover:border-white/10 transition-colors duration-300 group">
            <div className="w-12 h-12 rounded-full bg-[#2997ff]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-[#2997ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-3 tracking-tight">Real-Time Data</h3>
            <p className="text-[#86868b] leading-relaxed">
              Track thousands of CS2 items with millisecond precision. Our custom charting engine delivers Wall Street level analytics.
            </p>
          </div>

          <div className="bg-[#1c1c1e] p-10 rounded-[32px] border border-white/5 flex flex-col items-start hover:border-white/10 transition-colors duration-300 group">
            <div className="w-12 h-12 rounded-full bg-[#32d74b]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-[#32d74b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-3 tracking-tight">Bank-Grade Security</h3>
            <p className="text-[#86868b] leading-relaxed">
              Your inventory and balance are protected by advanced encryption and strict withdrawal protocols. 
            </p>
          </div>

          <div className="bg-[#1c1c1e] p-10 rounded-[32px] border border-white/5 flex flex-col items-start hover:border-white/10 transition-colors duration-300 group">
            <div className="w-12 h-12 rounded-full bg-[#bf5af2]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-[#bf5af2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold mb-3 tracking-tight">Instant Liquidity</h3>
            <p className="text-[#86868b] leading-relaxed">
              Buy and sell instantly at market price. No waiting for buyers, no peer-to-peer scam risks. Just pure trading.
            </p>
          </div>

        </div>
      </section>

      <footer className="border-t border-white/5 py-12 text-center text-[#86868b] text-sm">
        <p>© 2026 SkinTrend. Built for the modern trader.</p>
      </footer>
    </main>
  );
}