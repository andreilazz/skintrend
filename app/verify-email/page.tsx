'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Checking your verification token...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    // Apelăm backend-ul pentru confirmare
    fetch(`https://api.skintrend.skin/auth/confirm-email/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage('Your email has been successfully verified.');
          // Opțional: Redirecționăm după 3 secunde
          setTimeout(() => router.push('/profile'), 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. The token might be expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Could not connect to the server.');
      });
  }, [searchParams, router]);

  return (
    <div className="max-w-md mx-auto pt-32 px-4 text-center">
      <div className="bg-[#1c1c1e] p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
        
        {/* Decorare subtilă în funcție de status */}
        <div className={`absolute top-0 left-0 w-full h-1 ${
          status === 'loading' ? 'bg-[#2997ff] animate-pulse' : 
          status === 'success' ? 'bg-[#32d74b]' : 'bg-[#ff453a]'
        }`} />

        {/* Iconița */}
        <div className="mb-8 flex justify-center">
          {status === 'loading' && (
            <div className="w-16 h-16 border-4 border-[#2997ff]/20 border-t-[#2997ff] rounded-full animate-spin" />
          )}
          {status === 'success' && (
            <div className="w-16 h-16 bg-[#32d74b]/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#32d74b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 bg-[#ff453a]/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff453a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
          {status === 'loading' ? 'Verifying Email' : 
           status === 'success' ? 'Email Verified' : 'Verification Failed'}
        </h1>
        
        <p className="text-[#86868b] mb-8 text-sm font-medium leading-relaxed">
          {message}
        </p>

        {status !== 'loading' && (
          <Link 
            href="/profile" 
            className="inline-block w-full py-4 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-200 transition-all active:scale-95 shadow-lg"
          >
            Back to Profile
          </Link>
        )}
      </div>
    </div>
  );
}

// Next.js cere Suspense când folosim useSearchParams
export default function VerifyEmail() {
  return (
    <main className="min-h-screen bg-black text-[#f5f5f7] font-sans">
      <Navbar />
      <Suspense fallback={<div className="text-center pt-32 text-[#86868b]">Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}