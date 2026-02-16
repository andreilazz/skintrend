'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function Deposit() {
  const [token, setToken] = useState<string | null>(null);
  const [method, setMethod] = useState<'card' | 'crypto' | 'skins'>('card');
  const [amount, setAmount] = useState<number>(100);
  const [loading, setLoading] = useState(false);

  // Stări pentru formularele dummy
  const [cryptoCoin, setCryptoCoin] = useState('USDT');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      window.location.href = '/login';
      return;
    }
    setToken(savedToken);
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return toast.error('Suma trebuie să fie mai mare ca 0!');
    setLoading(true);
    const toastId = toast.loading('Processing payment...');

    try {
      const res = await fetch('https://api.skintrend.skin/trading/deposit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: Number(amount) })
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Successfully deposited $${amount.toFixed(2)}`, { id: toastId });
        
        // Actualizăm balanța salvată local
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          parsed.balance = data.balance;
          localStorage.setItem('user', JSON.stringify(parsed));
        }
        setAmount(100);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(data.message || 'Eroare la depunere', { id: toastId });
      }
    } catch (err) {
      toast.error('Eroare de conexiune cu serverul.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <main className="min-h-screen bg-black text-[#f5f5f7] p-4 md:p-8 font-sans selection:bg-[#2997ff]/30">
      <div className="max-w-5xl mx-auto space-y-8">
        <Navbar />

        <div className="pt-8 px-2">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Add Funds.</h1>
          <p className="text-[#86868b] text-lg">Select your preferred deposit method.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Partea stângă - Selectare Metodă (Apple Style) */}
          <div className="md:col-span-1 space-y-3">
            
            <button 
              onClick={() => setMethod('card')}
              className={`w-full text-left p-5 rounded-[24px] border transition-all flex items-center gap-4 ${
                method === 'card' 
                  ? 'bg-[#2c2c2e] border-[#2997ff] text-white shadow-[0_0_20px_rgba(41,151,255,0.1)]' 
                  : 'bg-[#1c1c1e] border-white/5 text-[#86868b] hover:bg-white/[0.04] hover:border-white/10'
              }`}
            >
              <span className="text-2xl grayscale opacity-80">💳</span>
              <div>
                <p className={`font-semibold text-sm ${method === 'card' ? 'text-white' : 'text-[#f5f5f7]'}`}>Credit Card</p>
                <p className="text-xs mt-0.5 opacity-70">Visa, Mastercard</p>
              </div>
            </button>

            <button 
              onClick={() => setMethod('crypto')}
              className={`w-full text-left p-5 rounded-[24px] border transition-all flex items-center gap-4 ${
                method === 'crypto' 
                  ? 'bg-[#2c2c2e] border-[#2997ff] text-white shadow-[0_0_20px_rgba(41,151,255,0.1)]' 
                  : 'bg-[#1c1c1e] border-white/5 text-[#86868b] hover:bg-white/[0.04] hover:border-white/10'
              }`}
            >
              <span className="text-2xl grayscale opacity-80">🪙</span>
              <div>
                <p className={`font-semibold text-sm ${method === 'crypto' ? 'text-white' : 'text-[#f5f5f7]'}`}>Cryptocurrency</p>
                <p className="text-xs mt-0.5 opacity-70">BTC, ETH, USDT</p>
              </div>
            </button>

            <button 
              onClick={() => setMethod('skins')}
              className={`w-full text-left p-5 rounded-[24px] border transition-all flex items-center gap-4 ${
                method === 'skins' 
                  ? 'bg-[#2c2c2e] border-[#2997ff] text-white shadow-[0_0_20px_rgba(41,151,255,0.1)]' 
                  : 'bg-[#1c1c1e] border-white/5 text-[#86868b] hover:bg-white/[0.04] hover:border-white/10'
              }`}
            >
              <span className="text-2xl grayscale opacity-80">📦</span>
              <div>
                <p className={`font-semibold text-sm ${method === 'skins' ? 'text-white' : 'text-[#f5f5f7]'}`}>CS2 Skins</p>
                <p className="text-xs mt-0.5 opacity-70">P2P Trade (0% Fee)</p>
              </div>
            </button>
          </div>

          {/* Partea dreaptă - Formularul specific */}
          <div className="md:col-span-2">
            <div className="bg-[#1c1c1e] p-8 rounded-[32px] border border-white/5 shadow-xl h-full">
              
              {/* --- FORMULAR CARD --- */}
              {method === 'card' && (
                <form onSubmit={handleDeposit} className="space-y-5 animate-in fade-in duration-300">
                  <h3 className="text-lg font-semibold text-white mb-6">Credit Card Details</h3>
                  
                  <div>
                    <label className="text-xs text-[#86868b] font-medium mb-2 block uppercase tracking-wider ml-1">Card Number (Test)</label>
                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-black p-4 rounded-[16px] text-sm outline-none border border-white/10 text-white focus:border-[#2997ff] transition-colors font-mono placeholder:text-[#333336]" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#86868b] font-medium mb-2 block uppercase tracking-wider ml-1">Expiry</label>
                      <input type="text" placeholder="MM/YY" className="w-full bg-black p-4 rounded-[16px] text-sm outline-none border border-white/10 text-white focus:border-[#2997ff] transition-colors font-mono placeholder:text-[#333336]" />
                    </div>
                    <div>
                      <label className="text-xs text-[#86868b] font-medium mb-2 block uppercase tracking-wider ml-1">CVV</label>
                      <input type="text" placeholder="123" className="w-full bg-black p-4 rounded-[16px] text-sm outline-none border border-white/10 text-white focus:border-[#2997ff] transition-colors font-mono placeholder:text-[#333336]" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-xs text-[#86868b] font-medium mb-2 block uppercase tracking-wider ml-1">Amount (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#86868b] font-medium">$</span>
                      <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min="1" className="w-full bg-black p-4 pl-10 rounded-[16px] text-xl font-semibold outline-none border border-white/10 text-white focus:border-[#2997ff] transition-colors" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className={`w-full py-4 rounded-full font-bold text-sm transition-all mt-6 ${loading ? 'bg-[#333336] text-[#86868b] cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200 active:scale-[0.98]'}`}>
                    {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
                  </button>
                </form>
              )}

              {/* --- FORMULAR CRYPTO --- */}
              {method === 'crypto' && (
                <form onSubmit={handleDeposit} className="space-y-5 animate-in fade-in duration-300">
                  <h3 className="text-lg font-semibold text-white mb-6">Cryptocurrency</h3>
                  
                  <div>
                    <label className="text-xs text-[#86868b] font-medium mb-2 block uppercase tracking-wider ml-1">Select Asset</label>
                    <select value={cryptoCoin} onChange={(e) => setCryptoCoin(e.target.value)} className="w-full bg-black p-4 rounded-[16px] text-sm outline-none border border-white/10 text-white focus:border-[#2997ff] transition-colors appearance-none font-medium">
                      <option value="USDT">Tether (USDT - TRC20)</option>
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH - ERC20)</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <label className="text-xs text-[#86868b] font-medium mb-2 block uppercase tracking-wider ml-1">Amount (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#86868b] font-medium">$</span>
                      <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min="1" className="w-full bg-black p-4 pl-10 rounded-[16px] text-xl font-semibold outline-none border border-white/10 text-white focus:border-[#2997ff] transition-colors" />
                    </div>
                  </div>

                  <div className="bg-[#1c1c1e] border border-white/10 p-5 rounded-[16px] mt-2">
                    <p className="text-xs text-[#86868b] font-medium mb-1">Deposit Address ({cryptoCoin})</p>
                    <p className="text-white font-mono text-sm break-all select-all">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</p>
                    <p className="text-[10px] text-[#86868b] mt-3">* This is a simulated address. Funds will be credited automatically.</p>
                  </div>

                  <button type="submit" disabled={loading} className={`w-full py-4 rounded-full font-bold text-sm transition-all mt-6 ${loading ? 'bg-[#333336] text-[#86868b] cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200 active:scale-[0.98]'}`}>
                    {loading ? 'Processing...' : `Confirm Deposit: $${amount.toFixed(2)}`}
                  </button>
                </form>
              )}

              {/* --- FORMULAR SKINS --- */}
              {method === 'skins' && (
                <form onSubmit={handleDeposit} className="space-y-5 animate-in fade-in duration-300">
                  <h3 className="text-lg font-semibold text-white mb-6">CS2 Skins (P2P)</h3>
                  
                  <div className="bg-black border border-white/10 p-6 rounded-[24px] text-center">
                    <div className="text-3xl mb-3 grayscale opacity-80">📦</div>
                    <p className="text-sm font-semibold text-white">Steam inventory sync is disabled.</p>
                    <p className="text-xs text-[#86868b] mt-2">For this simulation, manually enter the estimated value of the skin you wish to deposit.</p>
                  </div>

                  <div className="pt-2">
                    <label className="text-xs text-[#86868b] font-medium mb-2 block uppercase tracking-wider ml-1">Estimated Value (USD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#86868b] font-medium">$</span>
                      <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min="1" className="w-full bg-black p-4 pl-10 rounded-[16px] text-xl font-semibold outline-none border border-white/10 text-white focus:border-[#2997ff] transition-colors" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className={`w-full py-4 rounded-full font-bold text-sm transition-all mt-6 ${loading ? 'bg-[#333336] text-[#86868b] cursor-not-allowed' : 'bg-white text-black hover:bg-gray-200 active:scale-[0.98]'}`}>
                    {loading ? 'Processing...' : `Deposit Skin Value: $${amount.toFixed(2)}`}
                  </button>
                </form>
              )}

            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}