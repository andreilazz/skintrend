import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

// Importăm fontul stil Apple
const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'SkinTrend | Portfolio',
  description: 'Clean, secure, and advanced CS2 trading.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-[#f5f5f7] antialiased selection:bg-[#2997ff]/30`}>
        {children}
        <Toaster 
          position="bottom-center" 
          toastOptions={{ 
            style: { background: '#1c1c1e', color: '#f5f5f7', borderRadius: '16px', border: '1px solid #333336' },
          }} 
        />
      </body>
    </html>
  );
}