import React, { useMemo } from 'react';
import { Lead, Metrics } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, ComposedChart, Area, Cell
} from 'recharts';
import { format, startOfDay, parseISO } from 'date-fns';
import { Users, Target, TrendingUp, Award } from 'lucide-react';

interface MarketingTabProps {
  data: Lead[];
  metrics: Metrics;
}

export function MarketingTab({ data, metrics }: MarketingTabProps) {
  const chartData = useMemo(() => {
    return Object.keys(metrics.leadsPorCanal).map(canal => ({
      name: canal,
      leads: metrics.leadsPorCanal[canal],
      ingresos: metrics.ingresosPorCanal[canal] || 0,
      rpl: metrics.rplPorCanal[canal] || 0,
      winRate: (metrics.winRatePorCanal[canal] || 0) * 100
    })).sort((a, b) => b.leads - a.leads);
  }, [metrics]);

  const dailyLeads = useMemo(() => {
    const dailyMap = new Map<string, Record<string, number>>();
    const canalesSet = new Set<string>();

    data.forEach(l => {
      if (!l.fechaRegistro) return;
      const day = format(l.fechaRegistro, 'yyyy-MM-dd');
      const canal = l.atribucion || 'Desconocido';
      canalesSet.add(canal);
      
      if (!dailyMap.has(day)) dailyMap.set(day, {});
      const dayData = dailyMap.get(day)!;
      dayData[canal] = (dayData[canal] || 0) + 1;
    });

    return Array.from(dailyMap.entries())
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  const canalColors: Record<string, string> = {
    'Meta': '#1877F2',
    'Google': '#4285F4',
    'TikTok': '#000000',
    'LinkedIn': '#0A66C2',
    'Organic': '#34A853',
    'Other': '#EA4335',
    'Desconocido': '#94a3b8'
  };

  const getCanalColor = (name: string) => canalColors[name] || '#8b5cf6';

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Target size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">No hay datos de campañas para mostrar</p>
        <p className="text-sm">Asegúrate de cargar un CSV con información de atribución.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Leads Totales" 
          value={metrics.leadsTotales} 
          icon={<Users className="text-blue-500" />} 
          subtitle="Registros en periodo"
        />
        <KpiCard 
          title="Ingreso Atribuido" 
          value={metrics.ingresosTotales.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} 
          icon={<TrendingUp className="text-emerald-500" />} 
          subtitle="Suma de ventas ganadas"
        />
        <KpiCard 
          title="RPL Global" 
          value={metrics.ingresoPorLead.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })} 
          icon={<Target className="text-purple-500" />} 
          subtitle="Ingresos / Leads totales"
        />
        <KpiCard 
          title="Win Rate Global" 
          value={`${(metrics.winRate * 100).toFixed(1)}%`} 
          icon={<Award className="text-amber-500" />} 
          subtitle="Ganados / (Ganados + Perdidos)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads por Canal */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Leads por Canal</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="leads" radius={[0, 4, 4, 0]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCanalColor(entry.name)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ingresos por Canal */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Ingresos por Canal</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  formatter={(val: number) => val.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Serie Temporal de Leads */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Tendencia de Leads por Canal</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyLeads}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(v) => format(parseISO(v), 'dd MMM')}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  labelFormatter={(v) => format(parseISO(v as string), 'dd MMMM yyyy')}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                {Object.keys(canalColors).map(canal => (
                  <Area 
                    key={canal}
                    type="monotone" 
                    dataKey={canal} 
                    stackId="1"
                    stroke={canalColors[canal]} 
                    fill={canalColors[canal]}
                    fillOpacity={0.6}
                    name={canal}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, subtitle }: { title: string, value: string | number, icon: React.ReactNode, subtitle: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

// Helper to use AreaChart since I forgot to import it above
import { AreaChart, Cell as ReCell } from 'recharts';
