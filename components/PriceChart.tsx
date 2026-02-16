'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

export default function PriceChart({ data, colors }: any) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Curățăm containerul la fiecare randare
    chartContainerRef.current.innerHTML = '';

    // Creăm graficul cu design Apple
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth || 800,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: colors?.backgroundColor || 'transparent' },
        textColor: '#86868b',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      timeScale: {
        timeVisible: true,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }
    });

    // Acum această funcție EXISTĂ 100%
    const areaSeries = chart.addAreaSeries({
      lineColor: colors?.lineColor || '#2997ff',
      topColor: colors?.areaTopColor || 'rgba(41, 151, 255, 0.2)',
      bottomColor: 'transparent',
      lineWidth: 2,
    });

    if (data && data.length > 0) {
      // Sortăm datele pentru a preveni crash-urile de la timp duplicat
      const cleanData = [...data]
        .sort((a: any, b: any) => a.time - b.time)
        .filter((v: any, i: number, a: any[]) => i === 0 || v.time > a[i - 1].time);
      
      areaSeries.setData(cleanData);
      chart.timeScale().fitContent();
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, colors]);

  return <div ref={chartContainerRef} className="w-full h-full min-h-[400px]" />;
}