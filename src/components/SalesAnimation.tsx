import React, { useEffect, useState, useRef } from 'react';
import { Lead, AppConfig } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SalesAnimationProps {
  data: Lead[];
  config: AppConfig;
}

export function SalesAnimation({ data, config }: SalesAnimationProps) {
  const [queue, setQueue] = useState<Lead[]>([]);
  const [currentSale, setCurrentSale] = useState<Lead | null>(null);
  const knownGanados = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (data.length === 0) return;

    if (isInitialLoad.current) {
      // First time loading data, just record existing sales
      data.forEach(lead => {
        if (lead.estado === 'Ganado') {
          knownGanados.current.add(lead.id);
        }
      });
      isInitialLoad.current = false;
    } else {
      // Look for new sales
      const newSales = data.filter(lead => lead.estado === 'Ganado' && !knownGanados.current.has(lead.id));
      
      if (newSales.length > 0) {
        newSales.forEach(lead => knownGanados.current.add(lead.id));
        setQueue(prev => [...prev, ...newSales]);
      }
    }
  }, [data]);

  useEffect(() => {
    if (!currentSale && queue.length > 0) {
      // Pop the next sale
      const nextSale = queue[0];
      setCurrentSale(nextSale);
      setQueue(prev => prev.slice(1));
      
      // Play sound
      const audio = new Audio('https://actions.google.com/sounds/v1/foley/cash_register_purchase.ogg');
      audio.play().catch(e => console.error("Audio play failed", e));

      // Hide after 5 seconds
      setTimeout(() => {
        setCurrentSale(null);
      }, 5000);
    }
  }, [queue, currentSale]);

  if (!currentSale) return null;

  const photoUrl = config.comercialesPhotos[currentSale.comercial];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Raining Bills Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -100, x: Math.random() * window.innerWidth, rotate: 0, opacity: 1 }}
            animate={{ 
              y: window.innerHeight + 100, 
              x: Math.random() * window.innerWidth,
              rotate: 360,
              opacity: 0
            }}
            transition={{ 
              duration: 2 + Math.random() * 2, 
              ease: "linear",
              delay: Math.random() * 0.5
            }}
            className="absolute text-5xl text-emerald-500"
          >
            💵
          </motion.div>
        ))}
      </div>

      {/* Sale Popup */}
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -50 }}
          className="bg-slate-900/95 border-2 border-amber-400 rounded-3xl p-10 shadow-[0_0_80px_rgba(251,191,36,0.4)] flex flex-col items-center text-center max-w-lg w-full relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-amber-400/20 to-transparent pointer-events-none" />
          
          <h2 className="text-4xl font-black text-amber-400 mb-8 uppercase tracking-widest animate-pulse drop-shadow-lg">
            ¡Nueva Venta!
          </h2>

          <div className="w-40 h-40 rounded-full border-4 border-amber-400 overflow-hidden mb-6 shadow-2xl bg-slate-800 flex items-center justify-center relative z-10">
            {photoUrl ? (
              <img src={photoUrl} alt={currentSale.comercial} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl font-bold text-slate-400">{currentSale.comercial.charAt(0)}</span>
            )}
          </div>

          <h3 className="text-5xl font-bold text-white mb-3 drop-shadow-md">{currentSale.comercial}</h3>
          <p className="text-2xl text-slate-300 mb-8 font-medium">{currentSale.solucion}</p>

          <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-2xl px-10 py-5 shadow-[0_0_30px_rgba(16,185,129,0.3)] relative z-10">
            <span className="text-6xl font-black text-emerald-400 tracking-tighter drop-shadow-md">
              {currentSale.ingresos.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
