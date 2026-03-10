import React, { useMemo } from 'react';
import { Lead, Metrics } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart, Line
} from 'recharts';
import { Phone, MessageSquare, Clock, Zap } from 'lucide-react';

interface ActivityTabProps {
  data: Lead[];
  metrics: Metrics;
}

export function ActivityTab({ data, metrics }: ActivityTabProps) {
  const activityByStatus = useMemo(() => {
    const stats = {
      Ganado: { calls: 0, wa: 0, count: 0 },
      Perdido: { calls: 0, wa: 0, count: 0 },
      Abierto: { calls: 0, wa: 0, count: 0 }
    };

    data.forEach(l => {
      if (stats[l.estado]) {
        stats[l.estado].calls += l.llamadasSalientes;
        stats[l.estado].wa += l.whatsapp;
        stats[l.estado].count++;
      }
    });

    return Object.entries(stats).map(([name, s]) => ({
      name,
      avgCalls: s.count > 0 ? (s.calls / s.count).toFixed(1) : 0,
      avgWa: s.count > 0 ? (s.wa / s.count).toFixed(1) : 0
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ActivityKpi title="Total Llamadas" value={metrics.callsOutTotal} icon={<Phone className="text-blue-500" />} />
        <ActivityKpi title="Total WhatsApp" value={metrics.waTotal} icon={<MessageSquare className="text-emerald-500" />} />
        <ActivityKpi title="Media Actividad" value={metrics.actividadMediaPorLead.toFixed(1)} icon={<Zap className="text-amber-500" />} />
        <ActivityKpi title="Llamadas Fallidas" value={metrics.callsFailedInTotal} icon={<Clock className="text-rose-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Actividad Media por Estado del Lead</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityByStatus}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Bar dataKey="avgCalls" name="Media Llamadas" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgWa" name="Media WhatsApp" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Eficacia: Esfuerzo vs Resultado</h3>
          <p className="text-sm text-slate-500 mb-4">Comparativa de actividad en leads ganados vs perdidos.</p>
          <div className="space-y-4">
            {activityByStatus.slice(0, 2).map(item => (
              <div key={item.name} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-700">{item.name}</span>
                  <span className="text-xs font-medium px-2 py-1 bg-white rounded border border-slate-200 uppercase tracking-tighter">
                   Promedio: {Number(item.avgCalls) + Number(item.avgWa)} toques
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block uppercase">Llamadas</span>
                    <span className="text-lg font-bold text-slate-900">{item.avgCalls}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block uppercase">WhatsApp</span>
                    <span className="text-lg font-bold text-slate-900">{item.avgWa}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityKpi({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 border-b-4 border-b-slate-100 transition-all hover:border-b-blue-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-900 leading-none mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}
