'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async (savedToken: string) => {
    try {
      const res = await fetch('http://localhost:3001/trading/admin/stats', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      });
      const data = await res.json();
      if (res.ok) setStats(data);
      else toast.error(data.message || 'Error fetching stats.');
    } catch (error) {
      toast.error('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async () => {
    try {
      const res = await fetch('http://localhost:3001/prices/movers');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setPrices(data);
      }
    } catch (err) {
      console.error('Error loading live prices:', err);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) { window.location.href = '/login'; return; }
    setToken(savedToken);
    
    fetchStats(savedToken);
    fetchPrices();

    const interval = setInterval(() => fetchPrices(), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (txId: number, action: 'approve' | 'reject') => {
    if (!token) return;
    const toastId = toast.loading('Processing action...');
    try {
      const res = await fetch(`http://localhost:3001/trading/admin/withdraw/${txId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message, { id: toastId });
        fetchStats(token); 
      } else {
        toast.error(data.message, { id: toastId });
      }
    } catch (err) {
      toast.error('Server error.', { id: toastId });
    }
  };

  if (!token) return null;

  return (
    <main className="min-h-screen bg-black text-[#f5f5f7] p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <Navbar />

        <div className="pt-4 px-2 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Admin.</h1>
            <p className="text-[#86868b] text-lg font-medium">System overview and transaction management.</p>
          </div>
          <div className="px-4 py-1.5 bg-[#ff453a]/10 text-[#ff453a] border border-[#ff453a]/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Restricted Access
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#86868b] text-sm animate-pulse tracking-widest uppercase font-bold">
            Synchronizing Core Systems...
          </div>
        ) : !stats || !stats.users ? (
          <div className="text-center py-20 text-[#ff453a] text-sm font-bold uppercase tracking-widest">
            Critical Error: Failed to load statistics.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KPI Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1c1c1e] p-7 rounded-[28px] border border-white/5 hover:border-white/10 transition-colors">
                <h3 className="text-[10px] text-[#86868b] font-bold uppercase tracking-widest mb-3">Total Registered Users</h3>
                <p className="text-4xl font-bold text-white tracking-tighter">{stats.totalUsers || 0}</p>
              </div>
              <div className="bg-[#1c1c1e] p-7 rounded-[28px] border border-white/5 hover:border-white/10 transition-colors">
                <h3 className="text-[10px] text-[#86868b] font-bold uppercase tracking-widest mb-3">Total Platform Liquidity</h3>
                <p className="text-4xl font-bold text-[#32d74b] tracking-tighter">${Number(stats.totalPlatformBalance || 0).toLocaleString()}</p>
              </div>
              <div className="bg-[#1c1c1e] p-7 rounded-[28px] border border-white/5 hover:border-white/10 transition-colors">
                <h3 className="text-[10px] text-[#86868b] font-bold uppercase tracking-widest mb-3">Pending Withdrawals</h3>
                <p className="text-4xl font-bold text-[#2997ff] tracking-tighter">{stats.pendingWithdrawals || 0}</p>
              </div>
            </div>

            {/* User Database Table with Email Verification Status */}
            <div className="lg:col-span-1 bg-[#1c1c1e] rounded-[28px] border border-white/5 overflow-hidden flex flex-col max-h-[600px] shadow-2xl">
              <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01]">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">User Database</h3>
              </div>
              <div className="overflow-y-auto divide-y divide-white/5 scrollbar-hide">
                {stats.users?.map((u: any) => (
                  <div key={u.id} className="p-4 flex justify-between items-center hover:bg-white/[0.03] transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-[#333336] overflow-hidden flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all">
                          {u.avatar ? (
                            <img src={u.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-white uppercase">{u.username ? u.username[0] : '?'}</span>
                          )}
                        </div>
                        {/* Status Email Indicator */}
                        <div 
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-[#1c1c1e] rounded-full ${u.isEmailVerified ? 'bg-[#32d74b]' : 'bg-[#ff453a]'}`}
                          title={u.isEmailVerified ? 'Email Verified' : 'Email Unverified'}
                        ></div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-none mb-1">{u.username}</p>
                        <p className="text-[10px] text-[#86868b] font-mono uppercase tracking-tighter">UID: {u.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#32d74b] tracking-tight">${Number(u.balance).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions Monitor */}
            <div className="lg:col-span-2 bg-[#1c1c1e] rounded-[28px] border border-white/5 overflow-hidden flex flex-col max-h-[600px] shadow-2xl">
              <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01]">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">Global Transaction Monitor</h3>
              </div>
              <div className="overflow-y-auto scrollbar-hide">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[#86868b] text-[10px] uppercase tracking-widest border-b border-white/5">
                      <th className="px-6 py-5 font-bold">Date</th>
                      <th className="px-6 py-5 font-bold">Account</th>
                      <th className="px-6 py-5 font-bold">Type</th>
                      <th className="px-6 py-5 font-bold">Volume</th>
                      <th className="px-6 py-5 text-right font-bold">Authorization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stats.transactions?.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-[11px] text-[#86868b] font-medium">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-bold text-white">{tx.username}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${tx.type === 'DEPOSIT' ? 'bg-[#2997ff]/10 text-[#2997ff]' : 'bg-[#bf5af2]/10 text-[#bf5af2]'}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-white">${Number(tx.amount).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          {tx.status === 'PENDING' ? (
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => handleAction(tx.id, 'approve')} 
                                className="bg-[#32d74b] text-black px-4 py-1.5 rounded-full text-[10px] font-bold hover:bg-white transition-all active:scale-95 shadow-lg shadow-[#32d74b]/20"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleAction(tx.id, 'reject')} 
                                className="bg-[#333336] text-[#ff453a] hover:bg-[#ff453a] hover:text-white px-4 py-1.5 rounded-full text-[10px] font-bold transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${tx.status === 'COMPLETED' ? 'text-[#86868b]' : 'text-[#ff453a]'}`}>
                              {tx.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Market Watcher */}
            <div className="lg:col-span-3 bg-[#1c1c1e] rounded-[28px] border border-white/5 overflow-hidden flex flex-col shadow-2xl">
              <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest">Real-Time Market Data</h3>
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#32d74b] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#32d74b]"></span>
                    </span>
                    <span className="text-[10px] text-[#86868b] font-bold uppercase tracking-tighter">Market Sync Active</span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[#86868b] text-[10px] uppercase tracking-widest border-b border-white/5">
                      <th className="px-6 py-5 font-bold">Asset Identifier</th>
                      <th className="px-6 py-5 font-bold">Spot Price</th>
                      <th className="px-6 py-5 font-bold">Previous (24H)</th>
                      <th className="px-6 py-5 text-right font-bold">Market Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {prices.map((p: any, idx: number) => {
                      const isPositive = p.change >= 0;
                      return (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4 text-sm font-bold text-white group-hover:text-[#2997ff] transition-colors">{p.assetName}</td>
                          <td className="px-6 py-4 text-sm font-bold text-white">${Number(p.currentPrice).toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-[#86868b] font-medium">${Number(p.oldPrice).toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black ${isPositive ? 'bg-[#32d74b]/10 text-[#32d74b]' : 'bg-[#ff453a]/10 text-[#ff453a]'}`}>
                              {isPositive ? '▲' : '▼'} {Number(Math.abs(p.change)).toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}