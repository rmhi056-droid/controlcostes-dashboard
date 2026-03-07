import React, { useMemo } from 'react';
import { Lead } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

interface ComercialesTabProps {
  data: Lead[];
}

export function ComercialesTab({ data }: ComercialesTabProps) {
  const comData = useMemo(() => {
    const map = new Map<string, any>();
    
    data.forEach(lead => {
      if (!map.has(lead.comercial)) {
        map.set(lead.comercial, { comercial: lead.comercial, leads: 0, ganados: 0, perdidos: 0, abiertos: 0, ingresos: 0, actividad: 0 });
      }
      const c = map.get(lead.comercial);
      c.leads += 1;
      if (lead.estado === 'Ganado') {
        c.ganados += 1;
        c.ingresos += lead.ingresos;
      } else if (lead.estado === 'Perdido') {
        c.perdidos += 1;
      } else {
        c.abiertos += 1;
      }
      c.actividad += lead.llamadasSalientes + lead.whatsapp;
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
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ingresos por Comercial</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comData} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" tickFormatter={(v) => `${v / 1000}k`} />
                <YAxis dataKey="comercial" type="category" width={100} />
                <Tooltip formatter={(v: number) => v.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} />
                <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Actividad vs Win Rate</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" dataKey="actividad" name="Actividad (Calls+WA)" />
                <YAxis type="number" dataKey="winRate" name="Win Rate" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <ZAxis type="category" dataKey="comercial" name="Comercial" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v: any, name: string) => name === 'Win Rate' ? `${(v * 100).toFixed(1)}%` : v} />
                <Scatter name="Comerciales" data={comData} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Rendimiento Detallado por Comercial</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider bg-gray-50">
                <th className="p-4 rounded-tl-lg">Comercial</th>
                <th className="p-4 text-right">Leads</th>
                <th className="p-4 text-right">Ganados</th>
                <th className="p-4 text-right">Perdidos</th>
                <th className="p-4 text-right">Abiertos</th>
                <th className="p-4 text-right">Win Rate</th>
                <th className="p-4 text-right">Ingresos</th>
                <th className="p-4 text-right">Ticket Medio</th>
                <th className="p-4 text-right rounded-tr-lg">Actividad Total</th>
              </tr>
            </thead>
            <tbody>
              {comData.map((c, i) => (
                <tr key={c.comercial} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{c.comercial}</td>
                  <td className="p-4 text-right text-gray-600">{c.leads}</td>
                  <td className="p-4 text-right text-emerald-600 font-medium">{c.ganados}</td>
                  <td className="p-4 text-right text-rose-600 font-medium">{c.perdidos}</td>
                  <td className="p-4 text-right text-blue-600 font-medium">{c.abiertos}</td>
                  <td className="p-4 text-right font-medium text-gray-900">{(c.winRate * 100).toFixed(1)}%</td>
                  <td className="p-4 text-right font-bold text-emerald-600">{c.ingresos.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</td>
                  <td className="p-4 text-right text-gray-600">{c.ticketMedio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</td>
                  <td className="p-4 text-right text-gray-600">{c.actividad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
