import React, { useMemo } from 'react';
import { Lead } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerdidasTabProps {
  data: Lead[];
}

export function PerdidasTab({ data }: PerdidasTabProps) {
  const perdidosData = useMemo(() => {
    const perdidos = data.filter(l => l.estado === 'Perdido');
    const map = new Map<string, number>();
    
    perdidos.forEach(lead => {
      const motivo = lead.motivoPerdida || 'Sin motivo';
      map.set(motivo, (map.get(motivo) || 0) + 1);
    });

    return Array.from(map.entries()).map(([motivo, count]) => ({
      motivo,
      count,
      porcentaje: perdidos.length > 0 ? (count / perdidos.length) * 100 : 0
    })).sort((a, b) => b.count - a.count);
  }, [data]);

  const canalMotivoData = useMemo(() => {
    const perdidos = data.filter(l => l.estado === 'Perdido');
    const map = new Map<string, any>();
    
    perdidos.forEach(lead => {
      if (!map.has(lead.atribucion)) {
        map.set(lead.atribucion, { canal: lead.atribucion, total: 0 });
      }
      const c = map.get(lead.atribucion);
      const motivo = lead.motivoPerdida || 'Sin motivo';
      c[motivo] = (c[motivo] || 0) + 1;
      c.total += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [data]);

  const topMotivos = perdidosData.slice(0, 5).map(m => m.motivo);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Motivos de Pérdida</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perdidosData.slice(0, 10)} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" />
                <YAxis dataKey="motivo" type="category" width={150} />
                <Tooltip formatter={(v: number, n: string, props: any) => [`${v} (${props.payload.porcentaje.toFixed(1)}%)`, 'Pérdidas']} />
                <Bar dataKey="count" fill="#ef4444" name="Pérdidas" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Motivos por Canal (Top 5 Motivos)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={canalMotivoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="canal" />
                <YAxis />
                <Tooltip />
                <Legend />
                {topMotivos.map((motivo, i) => (
                  <Bar key={motivo} dataKey={motivo} stackId="a" fill={['#ef4444', '#f97316', '#eab308', '#84cc16', '#06b6d4'][i % 5]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
