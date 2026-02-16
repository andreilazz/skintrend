'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Withdraw() {
  const [token, setToken] = useState<string | null>(null);
  const [method, setMethod] = useState<'bank' | 'crypto' | 'skins'>('bank');
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  
  // Datele utilizatorului pentru validare
  const [balance, setBalance] = useState<number>(0);
  const [tradeLink, setTradeLink] = useState<string>('');
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false); // Stare nouă

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      window.location.href = '/login';
      return;
    }
    setToken(savedToken);

    // Luăm profilul complet (email status inclus)
    fetch('http://localhost:3001/auth/profile', {
      headers: { 'Authorization': `Bearer ${savedToken}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.tradeLink) setTradeLink(data.tradeLink);
      setIsEmailVerified(data.isEmailVerified); // Preluăm statusul verificării
    });

    fetch('http://localhost:3001/trading/balance', {
      headers: { 'Authorization': `Bearer ${savedToken}` }
    })
    .then(res => res.json())
    .then(data => setBalance(data.balance || 0));

  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificăm și aici, de siguranță
    if (!isEmailVerified) return toast.error('Please verify your email first!');
    if (amount <= 0) return toast.error('Amount must be greater than 0.');
    if (amount > balance) return toast.error('Insufficient funds.');
    
    if (method === 'skins' && !tradeLink) {
      return toast.error('You must set your Steam Trade Link in your profile first.');
    }

    setLoading(true);
    const toastId = toast.loading('Submitting request...');

    try {
      const res = await fetch('http://localhost:3001/trading/withdraw', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: Number(amount) })
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Withdrawal requested: $${amount.toFixed(2)}`, { id: toastId });
        setBalance(data.balance); 
        
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          parsed.balance = data.balance;
          localStorage.setItem('user', JSON.stringify(parsed));
        }
        setAmount(0);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        // Aici va prinde eroarea de "Email not verified" de la backend dacă e cazul
        toast.error(data.message || 'Withdrawal failed.', { id: toastId });
      }
    } catch (err) {
      toast.error('Connection error.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <main className="min-h-screen bg-black text-[#f5f5f7] p-4 md:p-8 font-sans selection:bg-[#2997ff]/30">
      <div className="max-w-5xl mx-auto space-y-8">
        <Navbar />

        <div className="pt-8 px-2 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Withdraw.</h1>
            <p className="text-[#86868b] text-lg font-medium">Transfer funds from your trading account.</p>
          </div>
          
          <div className="text-right bg-[#1c1c1e] border border-white/5 rounded-[20px] px-6 py-3">
            <p className="text-xs text-[#86868b] font-semibold uppercase tracking-wider mb-0.5">Available Balance</p>
            <p className="text-2xl font-bold text-white">${balance.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Metodă de plată */}
          <div className="md:col-span-1 space-y-3">
            {[
              { id: 'bank', icon: '🏦', title: 'Bank Transfer', subtitle: 'IBAN / SEPA' },
              { id: 'crypto', icon: '🪙', title: 'Crypto Wallet', subtitle: 'USDT / BTC / ETH' },
              { id: 'skins', icon: '📦', title: 'CS2 Skins', subtitle: 'Steam P2P Trade' }
            ].map((opt) => (
              <button 
                key={opt.id}
                onClick={() => setMethod(opt.id as any)}
                className={`w-full text-left p-5 rounded-[24px] border transition-all flex items-center gap-4 ${
                  method === opt.id 
                    ? 'bg-[#2c2c2e] border-[#2997ff] text-white shadow-[0_0_20px_rgba(41,151,255,0.1)]' 
                    : 'bg-[#1c1c1e] border-white/5 text-[#86868b] hover:bg-white/[0.04] hover:border-white/10'
                }`}
              >
                <span className="text-2xl grayscale opacity-80">{opt.icon}</span>
                <div>
                  <p className={`font-semibold text-sm ${method === opt.id ? 'text-white' : 'text-[#f5f5f7]'}`}>{opt.title}</p>
                  <p className="text-xs mt-0.5 opacity-70">{opt.subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="md:col-span-2">
            <div className="bg-[#1c1c1e] p-8 rounded-[32px] border border-white/5 shadow-xl h-full flex flex-col justify-between">
              
              <div>
                <div className="mb-8 border-b border-white/5 pb-6">
                  <h3 className="text-xl font-semibold text-white">
                    {method === 'bank' && 'Bank Transfer Details'}
                    {method === 'crypto' && 'Crypto Withdrawal Details'}
                    {method === 'skins' && 'Steam Inventory Withdrawal'}
                  </h3>
                </div>

                {/* Formulare specifice */}
                {method === 'bank' && (
                  <form id="withdraw-form" onSubmit={handleWithdraw} className="space-y-5">
                    <div>
                      <label className="text-xs text-[#86868b] font-bold mb-2 block uppercase tracking-wider ml-1">Account Holder Name</label>
                      <input type="text" required placeholder="John Doe" className="w-full bg-black p-4 rounded-[16px] text-sm outline-none border border-white/10 text-white focus:border-[#2997ff]" />
                    </div>
                    <div>
                      <label className="text-xs text-[#86868b] font-bold mb-2 block uppercase tracking-wider ml-1">IBAN Account</label>
                      <input type="text" required placeholder="RO00 XXXX ..." className="w-full bg-black p-4 rounded-[16px] text-sm outline-none border border-white/10 text-white focus:border-[#2997ff] font-mono" />
                    </div>
                  </form>
                )}

                {method === 'crypto' && (
                  <form id="withdraw-form" onSubmit={handleWithdraw} className="space-y-5">
                    <div>
                      <label className="text-xs text-[#86868b] font-bold mb-2 block uppercase tracking-wider ml-1">Crypto Network</label>
                      <select className="w-full bg-black p-4 rounded-[16px] text-sm outline-none border border-white/10 text-white focus:border-[#2997ff]">
                        <option>USDT (TRC20)</option>
                        <option>BTC</option>
                        <option>ETH (ERC20)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#86868b] font-bold mb-2 block uppercase tracking-wider ml-1">Wallet Address</label>
                      <input type="text" required placeholder="Paste address..." className="w-full bg-black p-4 rounded-[16px] text-sm outline-none border border-white/10 text-white focus:border-[#2997ff] font-mono" />
                    </div>
                  </form>
                )}

                {method === 'skins' && (
                  <form id="withdraw-form" onSubmit={handleWithdraw} className="space-y-5">
                    <div className="bg-black border border-white/10 p-5 rounded-[16px]">
                      <p className="text-xs text-[#86868b] font-bold mb-1 uppercase tracking-widest">Active Trade Link</p>
                      {tradeLink ? <p className="font-mono text-sm text-[#2997ff] break-all">{tradeLink}</p> : <p className="text-sm text-[#ff453a] font-bold">No Trade Link set.</p>}
                    </div>
                  </form>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <label className="text-xs text-[#86868b] font-bold mb-2 block uppercase tracking-wider ml-1">Amount (USD)</label>
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#86868b] font-bold">$</span>
                    <input 
                      type="number" 
                      value={amount || ''} 
                      onChange={(e) => setAmount(Number(e.target.value))} 
                      className="w-full bg-black p-4 pl-10 rounded-[16px] text-xl font-bold border border-white/10 text-white outline-none focus:border-[#2997ff]" 
                    />
                  </div>
                  <button onClick={() => setAmount(balance)} className="bg-[#333336] text-white hover:bg-white hover:text-black px-6 py-4 rounded-[16px] text-xs font-bold transition-all h-[60px]">MAX</button>
                </div>

                {/* --- WARNING: EMAIL NOT VERIFIED --- */}
                {!isEmailVerified && (
                  <div className="bg-[#ff453a]/10 border border-[#ff453a]/20 rounded-[20px] p-4 text-xs text-[#ff453a] flex gap-3 mt-6 items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p className="font-medium">
                      Email verification required. Please check <Link href="/profile" className="font-bold underline">Settings</Link> to withdraw.
                    </p>
                  </div>
                )}

                <button 
                  type="submit" 
                  form="withdraw-form"
                  disabled={loading || !isEmailVerified || amount > balance || amount <= 0 || (method === 'skins' && !tradeLink)} 
                  className={`w-full py-5 rounded-full font-bold text-sm transition-all mt-6 ${
                    loading || !isEmailVerified || amount > balance || amount <= 0 || (method === 'skins' && !tradeLink) 
                    ? 'bg-[#333336] text-[#86868b] cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-gray-200 active:scale-95 shadow-xl'
                  }`}
                >
                  {loading ? 'Processing...' : 'Submit Withdrawal Request'}
                </button>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}