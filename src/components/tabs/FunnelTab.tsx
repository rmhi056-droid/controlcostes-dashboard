import React, { useMemo } from 'react';
import { Lead } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FunnelTabProps {
  data: Lead[];
}

export function FunnelTab({ data }: FunnelTabProps) {
  const funnelData = useMemo(() => {
    const etapasMap = new Map<string, { etapa: string, ganados: number, perdidos: number, abiertos: number, total: number }>();
    
    data.forEach(lead => {
      if (!etapasMap.has(lead.etapa)) {
        etapasMap.set(lead.etapa, { etapa: lead.etapa, ganados: 0, perdidos: 0, abiertos: 0, total: 0 });
      }
      const e = etapasMap.get(lead.etapa)!;
      e.total += 1;
      if (lead.estado === 'Ganado') e.ganados += 1;
      else if (lead.estado === 'Perdido') e.perdidos += 1;
      else e.abiertos += 1;
    });

    return Array.from(etapasMap.values()).sort((a, b) => b.total - a.total);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Volumen por Etapa</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" />
              <YAxis dataKey="etapa" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="ganados" stackId="a" fill="#10b981" name="Ganados" />
              <Bar dataKey="abiertos" stackId="a" fill="#3b82f6" name="Abiertos" />
              <Bar dataKey="perdidos" stackId="a" fill="#ef4444" name="Perdidos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
