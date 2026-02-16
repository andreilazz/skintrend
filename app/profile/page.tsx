'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function Profile() {
  const [token, setToken] = useState<string | null>(null);
  const [tradeLink, setTradeLink] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      window.location.href = '/login';
      return;
    }
    setToken(savedToken);

    // Profile Data
    fetch('http://localhost:3001/auth/profile', {
      headers: { 'Authorization': `Bearer ${savedToken}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.tradeLink) setTradeLink(data.tradeLink);
      if (data.email) setEmail(data.email);
      setIsEmailVerified(data.isEmailVerified || false);
    });

    // Transactions History
    fetch('http://localhost:3001/trading/transactions', {
      headers: { 'Authorization': `Bearer ${savedToken}` }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) setTransactions(data);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Saving preferences...');
    
    const body: any = { tradeLink, email };
    if (newPassword) body.newPassword = newPassword;

    try {
      const res = await fetch('http://localhost:3001/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Profile updated successfully.', { id: toastId });
        setNewPassword(''); 
      } else {
        toast.error(data.message || 'Error saving profile.', { id: toastId });
      }
    } catch (err) {
      toast.error('Connection error.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!email) return toast.error('Please enter an email first.');
    const toastId = toast.loading('Sending verification link...');
    try {
      // Vom crea această rută în backend imediat
      const res = await fetch('http://localhost:3001/auth/send-verification', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      if (res.ok) toast.success('Check your inbox (and spam folder)!', { id: toastId });
      else toast.error('Failed to send email.', { id: toastId });
    } catch (err) {
      toast.error('Server error.', { id: toastId });
    }
  };

  if (!token) return null;

  return (
    <main className="min-h-screen bg-black text-[#f5f5f7] p-4 md:p-8 font-sans selection:bg-[#2997ff]/30">
      <div className="max-w-5xl mx-auto space-y-12">
        <Navbar />

        {/* --- HEADER --- */}
        <div className="pt-8 px-2 text-center">
          <div className="w-20 h-20 bg-[#1c1c1e] border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f5f5f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Account Settings.</h1>
          <p className="text-[#86868b] text-lg font-medium">Manage your security and Steam integration.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-10">
          
          {/* --- FORM SECTION --- */}
          <div className="bg-[#1c1c1e] p-8 rounded-[32px] border border-white/5 shadow-2xl">
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* EMAIL VERIFICATION */}
              <div className="bg-black/30 p-6 rounded-[24px] border border-white/5">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider ml-1">
                    Email Address
                  </label>
                  {isEmailVerified ? (
                    <span className="text-[10px] font-bold text-[#32d74b] bg-[#32d74b]/10 px-2 py-0.5 rounded-full uppercase">Verified</span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#ff453a] bg-[#ff453a]/10 px-2 py-0.5 rounded-full uppercase">Unverified</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="flex-1 bg-black p-4 rounded-[16px] text-sm outline-none border border-white/10 text-white focus:border-[#2997ff] transition-colors"
                  />
                  {!isEmailVerified && (
                    <button 
                      type="button"
                      onClick={handleVerifyEmail}
                      className="bg-[#2997ff]/10 text-[#2997ff] px-4 rounded-[16px] text-xs font-bold hover:bg-[#2997ff] hover:text-white transition-all"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>

              {/* STEAM TRADE LINK */}
              <div className="bg-black/30 p-6 rounded-[24px] border border-white/5">
                <div className="flex justify-between items-end mb-3">
                  <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider ml-1">Steam Trade Link</label>
                  <a href="https://steamcommunity.com/id/me/tradeoffers/privacy#trade_url" target="_blank" className="text-[10px] font-bold text-[#2997ff] hover:underline">Find my link</a>
                </div>
                <input 
                  type="text" 
                  value={tradeLink}
                  onChange={e => setTradeLink(e.target.value)}
                  className="w-full bg-black p-4 rounded-[16px] text-sm outline-none border border-white/10 text-[#2997ff] font-mono focus:border-[#2997ff]"
                />
              </div>

              <div className="bg-black/30 p-6 rounded-[24px] border border-white/5">
                <label className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3 block ml-1">Security</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password (leave blank to keep current)"
                  className="w-full bg-black p-4 rounded-[16px] text-sm outline-none border border-white/10 text-white focus:border-[#2997ff]"
                />
              </div>

              <button type="submit" disabled={loading} className="w-full py-4 rounded-full font-bold text-sm bg-white text-black hover:bg-gray-200 transition-all active:scale-95">
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          </div>

          {/* --- TRANSACTION HISTORY SECTION --- */}
          <div className="bg-[#1c1c1e] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-white/5 bg-white/[0.01]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Transaction History</h3>
            </div>
            
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#86868b] text-[10px] uppercase tracking-wider border-b border-white/5">
                    <th className="px-8 py-4 font-semibold">Date</th>
                    <th className="px-8 py-4 font-semibold">Type</th>
                    <th className="px-8 py-4 font-semibold">Amount</th>
                    <th className="px-8 py-4 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-8 py-4 text-xs text-[#86868b]">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="px-8 py-4">
                        <span className={`text-[10px] font-bold uppercase ${tx.type === 'DEPOSIT' ? 'text-[#2997ff]' : 'text-[#bf5af2]'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm font-semibold text-white">${Number(tx.amount).toFixed(2)}</td>
                      <td className="px-8 py-4 text-right">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                          tx.status === 'COMPLETED' ? 'text-[#32d74b] bg-[#32d74b]/10' : 
                          tx.status === 'PENDING' ? 'text-[#ff9500] bg-[#ff9500]/10' : 'text-[#ff453a] bg-[#ff453a]/10'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-10 text-center text-[#86868b] text-sm">No transactions yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}