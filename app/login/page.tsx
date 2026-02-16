'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = isLogin ? 'https://api.skintrend.skin/auth/login' : 'https://api.skintrend.skin/auth/register';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.access_token);
          toast.success('Successfully authenticated.');
          router.push('/trade'); 
        } else {
          toast.success('Account initialized. You can now sign in.');
          setIsLogin(true);
          setPassword('');
        }
      } else {
        toast.error(data.message || 'Authentication error.');
      }
    } catch (err) {
      toast.error('Server connection failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSteamLogin = () => {
    window.location.href = 'https://api.skintrend.skin/auth/steam';
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 font-sans selection:bg-[#2997ff]/30">
      <div className="w-full max-w-md">
        
        {/* Header (Logo + Subtitle) */}
        <div className="text-center mb-10">
          {/* Logo text curat, alb */}
          <h1 className="text-4xl font-bold text-white tracking-tighter mb-2">
            SkinTrend.
          </h1>
          <p className="text-[#86868b] text-sm font-medium">
            Sign in to access the trading terminal.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#1c1c1e] border border-white/5 rounded-[32px] p-8 shadow-2xl">
          
          <h2 className="text-xl font-bold text-white text-center mb-8">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-black border border-white/10 rounded-[16px] px-5 py-4 text-base font-medium text-white placeholder:text-[#86868b] focus:outline-none focus:border-[#2997ff] transition-colors"
                required
              />
            </div>
            
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-black border border-white/10 rounded-[16px] px-5 py-4 text-base font-medium text-white placeholder:text-[#86868b] focus:outline-none focus:border-[#2997ff] transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-2 rounded-[16px] font-bold text-sm transition-all active:scale-95 flex justify-center items-center ${
                loading 
                  ? 'bg-white/10 text-[#86868b] cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-[#f5f5f7] shadow-lg shadow-white/5'
              }`}
            >
              {loading ? (
                 <span className="flex items-center gap-2">
                   <svg className="animate-spin h-4 w-4 text-[#86868b]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Processing
                 </span>
              ) : (
                isLogin ? 'Sign In' : 'Continue'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-[#2997ff] hover:text-[#1c7cd6] transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
          
          {/* Steam Login Divider cu logo oficial ALB */}
          <div className="mt-8 pt-8 border-t border-white/5 relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1c1c1e] px-4 text-xs font-bold text-[#86868b] uppercase tracking-widest">
                Or
             </div>
             <button 
               onClick={handleSteamLogin}
               type="button"
               className="w-full flex items-center justify-center gap-3 py-4 rounded-[16px] bg-[#171a21] hover:bg-[#2a475e] text-white transition-colors text-sm font-bold shadow-lg group"
             >
               {/* AICI E SCHIMBAREA: Imagine cu logo-ul Steam deja alb */}
               <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Steam_Logo.png/640px-Steam_Logo.png" 
                alt="Steam Logo" 
                className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity"
               />
               Continue with Steam
             </button>
          </div>

        </div>
        
        {/* Footer */}
        <p className="text-center text-[11px] text-[#86868b] mt-8 font-medium">
          By signing in, you agree to our Terms of Service. <br/>
          Secure connection established.
        </p>
      </div>
    </main>
  );
}