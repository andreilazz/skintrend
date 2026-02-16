'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [balance, setBalance] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3001/trading/balance', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json()).then(data => setBalance(data.balance || 0));

      fetch('http://localhost:3001/auth/profile', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json()).then(data => setUser(data));
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <nav className="bg-[#1c1c1e]/60 border border-white/10 backdrop-blur-2xl rounded-[24px] px-6 py-3 flex justify-between items-center shadow-sm sticky top-4 z-50 mx-4 md:mx-0">
      
      <div className="flex items-center gap-10">
        {/* Logo-ul duce mereu la Landing Page */}
        <Link href="/">
          <h2 className="text-xl font-bold text-white tracking-tight">
            SkinTrend.
          </h2>
        </Link>
        
        <div className="hidden md:flex gap-6 text-sm font-medium text-[#86868b]">
          {/* AICI AM MODIFICAT RUTA SPRE /trade */}
          <Link href="/trade" className="hover:text-white transition-colors">Terminal</Link>
          <Link href="/market" className="hover:text-white transition-colors">Market</Link>
          <Link href="/portfolio" className="hover:text-white transition-colors">Portfolio</Link> 
          <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        <Link href="/withdraw" className="hidden sm:block text-sm font-medium text-[#86868b] hover:text-white transition-colors mr-2">
          Withdraw
        </Link>

        {/* Balanță minimalistă Apple */}
        <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-full px-4 py-1.5">
          <span className="text-white font-semibold text-sm">${Number(balance).toFixed(2)}</span>
        </div>

        {/* Buton Deposit Clean */}
        <Link href="/deposit" className="bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-full text-sm font-bold transition-all">
          Deposit
        </Link>

        <div className="relative ml-2" ref={dropdownRef}>
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 outline-none">
            <div className="w-9 h-9 rounded-full bg-[#333336] overflow-hidden flex items-center justify-center border border-white/10 transition-transform active:scale-95">
              {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-white">{user?.username?.[0] || '?'}</span>}
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-[#1c1c1e]/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-3xl p-1">
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <p className="text-sm font-semibold text-white">{user?.username || 'Trader'}</p>
              </div>
              <Link href="/portfolio" onClick={() => setIsDropdownOpen(false)} className="block px-3 py-2 text-sm text-[#86868b] hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                Portfolio
              </Link>
              <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-3 py-2 text-sm text-[#86868b] hover:text-white hover:bg-white/5 rounded-xl transition-colors">Settings</Link>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-[#ff453a] hover:bg-[#ff453a]/10 rounded-xl transition-colors mt-1">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}