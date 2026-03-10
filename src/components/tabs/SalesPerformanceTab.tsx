import React, { useMemo } from 'react';
import { Metrics } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Trophy, Users, Zap, Award } from 'lucide-react';

interface SalesPerformanceTabProps {
  metrics: Metrics;
}

export function SalesPerformanceTab({ metrics }: SalesPerformanceTabProps) {
  const rankingData = useMemo(() => {
    return Object.entries(metrics.statsComerciales)
      .map(([name, stats]) => ({
        name,
        ingresos: stats.ingresos,
        ganados: stats.ganados,
        winRate: (stats.winRate * 100).toFixed(1),
        calls: stats.llamadasPorLead.toFixed(1)
      }))
      .sort((a, b) => b.ingresos - a.ingresos);
  }, [metrics]);

  return (
    <div className="space-y-6">
      {/* Ranking Leaderboard */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Trophy className="text-amber-500" />
          <h3 className="text-lg font-bold text-slate-800">Leaderboard Comercial</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm uppercase">
                <th className="px-6 py-4 font-semibold">Comercial</th>
                <th className="px-6 py-4 font-semibold text-right">Ingresos</th>
                <th className="px-6 py-4 font-semibold text-right">Ganados</th>
                <th className="px-6 py-4 font-semibold text-right">Win Rate</th>
                <th className="px-6 py-4 font-semibold text-right">Llamadas/Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankingData.map((item, index) => (
                <tr key={item.name} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-xs text-slate-500 font-bold">
                      {index + 1}
                    </span>
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-600">
                    {item.ingresos.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-6 py-4 text-right">{item.ganados}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-sm font-medium">
                      {item.winRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">{item.calls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Ingresos por Comercial</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide Bos />
                <Tooltip 
                  formatter={(val: number) => val.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="ingresos" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Llamadas vs Win Rate</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="calls" name="Llamadas" unit=" ll" axisLine={false} tickLine={false} />
                <YAxis type="number" dataKey="winRate" name="Win Rate" unit="%" axisLine={false} tickLine={false} />
                <ZAxis type="number" dataKey="ingresos" range={[100, 1000]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Comerciales" data={rankingData} fill="#f59e0b" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
