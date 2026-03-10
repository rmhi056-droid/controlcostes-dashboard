import React, { useMemo } from 'react';
import { Lead, Metrics } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import { Clock, Calendar, Zap, AlertCircle } from 'lucide-react';
import { format, startOfWeek, parseISO } from 'date-fns';

interface CohortsTabProps {
  data: Lead[];
  metrics: Metrics;
}

export function CohortsTab({ data, metrics }: CohortsTabProps) {
  const weeklyVelocity = useMemo(() => {
    const weeksMap = new Map<string, { week: string, avgTime: number, count: number }>();
    
    data.filter(l => l.estado === 'Ganado' && l.tiempoGanarse > 0).forEach(l => {
      const date = l.fechaCierre || l.fechaRegistro;
      if (!date) return;
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekStr = format(weekStart, 'yyyy-MM-dd');
      
      if (!weeksMap.has(weekStr)) {
        weeksMap.set(weekStr, { week: weekStr, avgTime: 0, count: 0 });
      }
      const w = weeksMap.get(weekStr)!;
      w.avgTime += l.tiempoGanarse;
      w.count += 1;
    });

    return Array.from(weeksMap.values())
      .map(w => ({
        week: w.week,
        time: (w.avgTime / w.count).toFixed(1)
      }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Tiempo Medio a Ganar</h3>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-500"><Clock size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{metrics.tiempoMedioGanar.toFixed(1)} <span className="text-sm font-normal text-slate-500">días</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Leads con +15 días</h3>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-500"><AlertCircle size={20} /></div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{metrics.agingLeads['+15 días']} <span className="text-sm font-normal text-slate-500">leads abiertos</span></p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Velocidad de Cierre: Evolución Semanal</h3>
        <p className="text-sm text-slate-500 mb-6">Media de días desde registro a cierre por cohorte de semana.</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyVelocity}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="week" 
                tickFormatter={(v) => format(parseISO(v), 'dd MMM')}
                axisLine={false}
                tickLine={false}
              />
              <YAxis axisLine={false} tickLine={false} unit=" d" />
              <Tooltip 
                labelFormatter={(v) => format(parseISO(v as string), 'dd MMM yyyy')}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="time" name="Tiempo Medio" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
