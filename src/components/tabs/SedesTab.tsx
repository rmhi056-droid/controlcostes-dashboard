import React, { useMemo } from 'react';
import { Lead, Metrics } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import { MapPin, TrendingUp, Users } from 'lucide-react';

interface SedesTabProps {
  data: Lead[];
  metrics: Metrics;
}

export function SedesTab({ data, metrics }: SedesTabProps) {
  const sedeData = useMemo(() => {
    return Object.entries(metrics.ingresosPorSubcuenta)
      .map(([name, ingresos]) => {
        const leads = data.filter(l => l.subcuenta === name).length;
        const ganados = data.filter(l => l.subcuenta === name && l.estado === 'Ganado').length;
        const perdidos = data.filter(l => l.subcuenta === name && l.estado === 'Perdido').length;
        return {
          name,
          ingresos,
          leads,
          winRate: ganados + perdidos > 0 ? (ganados / (ganados + perdidos) * 100).toFixed(1) : 0
        };
      })
      .sort((a, b) => b.ingresos - a.ingresos);
  }, [data, metrics]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <MapPin className="text-rose-500" /> Rendimiento por Subcuenta / Sede
        </h3>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sedeData} margin={{ bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" orientation="left" stroke="#6366f1" axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="top" height={36}/>
              <Bar yAxisId="left" dataKey="ingresos" name="Ingresos (€)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="winRate" name="Win Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
