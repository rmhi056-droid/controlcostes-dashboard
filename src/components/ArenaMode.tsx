import React, { useMemo } from 'react';
import { Lead, Metrics, AppConfig } from '../types';
import { Trophy, Target, AlertTriangle, Phone, MessageCircle, Clock, TrendingUp } from 'lucide-react';

interface ArenaModeProps {
  data: Lead[];
  metrics: Metrics;
  dateRange: string;
  config: AppConfig;
}

export function ArenaMode({ data, metrics, dateRange, config }: ArenaModeProps) {
  const { ingresos: META_INGRESOS, ganados: META_GANADOS } = config.metas;

  const ingresosProgress = Math.min((metrics.ingresosTotales / META_INGRESOS) * 100, 100);
  const ganadosProgress = Math.min((metrics.ganados / META_GANADOS) * 100, 100);

  // Calculate Leaderboard
  const leaderboard = useMemo(() => {
    const comMap = new Map<string, any>();

    data.forEach(lead => {
      if (!comMap.has(lead.comercial)) {
        comMap.set(lead.comercial, {
          comercial: lead.comercial,
          ganados: 0,
          perdidos: 0,
          abiertos: 0,
          ingresos: 0,
          llamadas: 0,
          whatsapp: 0,
          duracion: 0,
        });
      }
      const c = comMap.get(lead.comercial);
      if (lead.estado === 'Ganado') {
        c.ganados += 1;
        c.ingresos += lead.ingresos;
      } else if (lead.estado === 'Perdido') {
        c.perdidos += 1;
      } else {
        c.abiertos += 1;
      }
      c.llamadas += lead.llamadasSalientes;
      c.whatsapp += lead.whatsapp;
      c.duracion += lead.duracionLlamada;
    });

    return Array.from(comMap.values()).map(c => {
      const winRate = c.ganados + c.perdidos > 0 ? c.ganados / (c.ganados + c.perdidos) : 0;
      
      // Score calculation
      let score = (c.ganados * 10) + (c.ingresos / 1000) - (c.perdidos * 3);
      if (winRate > 0.3) score += 2; // Bonus

      return {
        ...c,
        winRate,
        score: Math.round(score * 10) / 10,
      };
    }).sort((a, b) => b.score - a.score);
  }, [data]);

  // Alerts
  const alerts = useMemo(() => {
    const a = [];
    const abiertosAntiguos = data.filter(l => l.estado === 'Abierto' && l.fechaRegistro && (new Date().getTime() - l.fechaRegistro.getTime()) / (1000 * 3600 * 24) > 7);
    if (abiertosAntiguos.length > 0) {
      a.push({ type: 'warning', text: `${abiertosAntiguos.length} leads abiertos > 7 días` });
    }
    if (metrics.winRate < 0.2) {
      a.push({ type: 'danger', text: `Win rate global bajo (${(metrics.winRate * 100).toFixed(1)}%)` });
    }
    return a;
  }, [data, metrics]);

  return (
    <div className="bg-[#0f172a] min-h-[calc(100vh-140px)] text-white p-6 font-sans flex flex-col gap-6">
      {/* Header: Metas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Target size={64} /></div>
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Meta Ingresos ({dateRange})</h3>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-5xl font-black tracking-tighter">{metrics.ingresosTotales.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
            <span className="text-slate-400 text-xl font-medium mb-1">/ {META_INGRESOS.toLocaleString('es-ES')}€</span>
          </div>
          <div className="h-4 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${ingresosProgress}%` }} />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Trophy size={64} /></div>
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Meta Cierres ({dateRange})</h3>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-5xl font-black tracking-tighter">{metrics.ganados}</span>
            <span className="text-slate-400 text-xl font-medium mb-1">/ {META_GANADOS}</span>
          </div>
          <div className="h-4 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${ganadosProgress}%` }} />
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><TrendingUp size={64} /></div>
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Win Rate Global</h3>
          <div className="flex items-end gap-3">
            <span className="text-6xl font-black tracking-tighter text-amber-400">{(metrics.winRate * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Center: Leaderboard */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Trophy className="text-amber-400" />
            Leaderboard Comercial
          </h2>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="pb-4 pl-2 w-16">Pos</th>
                  <th className="pb-4">Comercial</th>
                  <th className="pb-4 text-right">Score</th>
                  <th className="pb-4 text-right">Ganados</th>
                  <th className="pb-4 text-right">Ingresos</th>
                  <th className="pb-4 text-right">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((c, i) => {
                  const photoUrl = config.comercialesPhotos[c.comercial];
                  return (
                    <tr key={c.comercial} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="py-4 pl-2">
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                          i === 0 ? 'bg-amber-500 text-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]' :
                          i === 1 ? 'bg-slate-300 text-slate-800' :
                          i === 2 ? 'bg-amber-700 text-amber-100' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600 flex-shrink-0">
                            {photoUrl ? (
                              <img src={photoUrl} alt={c.comercial} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                {c.comercial.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="font-bold text-lg">{c.comercial}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right font-black text-2xl text-teal-400">{c.score.toFixed(1)}</td>
                      <td className="py-4 text-right font-medium">{c.ganados}</td>
                      <td className="py-4 text-right font-medium text-slate-300">{c.ingresos.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</td>
                      <td className="py-4 text-right font-medium text-slate-400">{(c.winRate * 100).toFixed(1)}%</td>
                    </tr>
                  );
                })}
                {leaderboard.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-500">No hay datos para el periodo seleccionado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel: Activity & Alerts */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 flex-1">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Phone className="text-blue-400" />
              Actividad (Hoy)
            </h2>
            <div className="space-y-6">
              {leaderboard.slice(0, 5).map(c => (
                <div key={c.comercial}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{c.comercial}</span>
                    <span className="text-slate-400">{c.llamadas} calls / {c.whatsapp} WA</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min((c.llamadas / 20) * 100, 100)}%` }} />
                    <div className="h-full bg-teal-500" style={{ width: `${Math.min((c.whatsapp / 20) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="text-rose-400" />
              Alertas Operativas
            </h2>
            <div className="space-y-3">
              {alerts.length > 0 ? alerts.map((a, i) => (
                <div key={i} className={`p-3 rounded-lg border flex items-start gap-3 ${
                  a.type === 'danger' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}>
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">{a.text}</span>
                </div>
              )) : (
                <div className="text-slate-500 text-sm italic">Todo en orden.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

