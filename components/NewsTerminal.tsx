'use client';

import { useEffect, useState } from 'react';

interface NewsItem {
  id: number;
  title: string;
  link: string;
  date: string;
  snippet: string;
}

export default function NewsTerminal() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.skintrend.skin/news')
      .then((res) => res.json())
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Eroare la preluarea știrilor:', err);
        setLoading(false);
      });
  }, []);

  return (
    /* Efectul de Glassmorphism (Apple) - blur pe fundal, margini rotunjite mari, umbră fină */
    <div className="bg-white/70 dark:bg-[#1c1c1e]/70 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-3xl p-6 w-full h-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex flex-col transition-all duration-300">
      
      {/* Header minimalist */}
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-black/5 dark:border-white/5">
        <h2 className="text-gray-900 dark:text-white text-lg font-semibold tracking-tight">
          Valve Updates
        </h2>
        {/* Punct albastru (stil indicator iOS) pentru live feed */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
        </span>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">
            Se încarcă noutățile...
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
          {news.map((item, idx) => (
            <a 
              key={idx} 
              href={item.link} 
              target="_blank" 
              rel="noreferrer" 
              className="group block p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
            >
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1 font-medium tracking-wide uppercase">
                {new Date(item.date).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' })}
              </p>
              <h3 className="text-sm text-gray-800 dark:text-gray-100 font-medium group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                {item.snippet}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}