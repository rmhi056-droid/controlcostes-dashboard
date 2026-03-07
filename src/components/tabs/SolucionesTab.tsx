import React, { useMemo } from 'react';
import { Lead } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SolucionesTabProps {
  data: Lead[];
}

export function SolucionesTab({ data }: SolucionesTabProps) {
  const solData = useMemo(() => {
    const map = new Map<string, any>();
    
    data.forEach(lead => {
      if (!map.has(lead.solucion)) {
        map.set(lead.solucion, { solucion: lead.solucion, leads: 0, ganados: 0, perdidos: 0, ingresos: 0 });
      }
      const c = map.get(lead.solucion);
      c.leads += 1;
      if (lead.estado === 'Ganado') {
        c.ganados += 1;
        c.ingresos += lead.ingresos;
      } else if (lead.estado === 'Perdido') {
        c.perdidos += 1;
      }
    });

    return Array.from(map.values()).map(c => ({
      ...c,
      winRate: c.ganados + c.perdidos > 0 ? c.ganados / (c.ganados + c.perdidos) : 0,
      ticketMedio: c.ganados > 0 ? c.ingresos / c.ganados : 0,
    })).sort((a, b) => b.ingresos - a.ingresos);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ingresos por Solución</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={solData} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" tickFormatter={(v) => `${v / 1000}k`} />
                <YAxis dataKey="solucion" type="category" width={100} />
                <Tooltip formatter={(v: number) => v.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} />
                <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Win Rate por Solución</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={solData} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis dataKey="solucion" type="category" width={100} />
                <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                <Bar dataKey="winRate" fill="#3b82f6" name="Win Rate" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Rendimiento Detallado por Solución</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider bg-gray-50">
                <th className="p-4 rounded-tl-lg">Solución</th>
                <th className="p-4 text-right">Leads</th>
                <th className="p-4 text-right">Ganados</th>
                <th className="p-4 text-right">Win Rate</th>
                <th className="p-4 text-right">Ingresos</th>
                <th className="p-4 text-right rounded-tr-lg">Ticket Medio</th>
              </tr>
            </thead>
            <tbody>
              {solData.map((c, i) => (
                <tr key={c.solucion} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{c.solucion}</td>
                  <td className="p-4 text-right text-gray-600">{c.leads}</td>
                  <td className="p-4 text-right text-gray-600">{c.ganados}</td>
                  <td className="p-4 text-right font-medium text-blue-600">{(c.winRate * 100).toFixed(1)}%</td>
                  <td className="p-4 text-right font-medium text-emerald-600">{c.ingresos.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</td>
                  <td className="p-4 text-right text-gray-600">{c.ticketMedio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
