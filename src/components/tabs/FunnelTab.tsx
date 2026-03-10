import React, { useMemo } from 'react';
import { Lead, Metrics } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, PieChart, Pie, ComposedChart, Line
} from 'recharts';
import { Filter, TrendingDown, Clock, AlertCircle, DollarSign, ArrowDownRight } from 'lucide-react';

interface FunnelTabProps {
  data: Lead[];
  metrics: Metrics;
}

export function FunnelTab({ data, metrics }: FunnelTabProps) {
  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

  const funnelData = useMemo(() => {
    const stages = ['Primer contacto', 'Cualificación', 'Negociación', 'Cierre'];
    return stages.map(stage => ({
      name: stage,
      value: metrics.conteoPorEtapa[stage] || 0,
      conversion: ((metrics.conversionPorEtapa[stage] || 0) * 100).toFixed(1)
    }));
  }, [metrics]);

  const agingTable = Object.entries(metrics.agingLeads).map(([range, count]) => ({
    range,
    count,
    percentage: ((count / (metrics.abiertos || 1)) * 100).toFixed(1)
  }));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Filter size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">No hay datos de embudo para mostrar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title="Valor Pipeline" 
          value={metrics.valorPipelineAbierto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} 
          icon={<DollarSign className="text-teal-500" />} 
          subtitle={`${metrics.abiertos} leads abiertos`}
        />
        <MetricCard 
          title="Win Rate Global" 
          value={`${(metrics.winRate * 100).toFixed(1)}%`} 
          icon={<TrendingDown className="text-emerald-500 transform rotate-180" />} 
          subtitle="Ganados vs Cerrados"
        />
        <MetricCard 
          title="Leads en 'Cierre'" 
          value={metrics.conteoPorEtapa['Cierre'] || 0} 
          icon={<ArrowDownRight className="text-blue-500" />} 
          subtitle="Etapa final"
        />
        <MetricCard 
          title="Drop Rate" 
          value={`${((1 - metrics.winRate) * 100).toFixed(1)}%`} 
          icon={<AlertCircle className="text-rose-500" />} 
          subtitle="Perdidos vs Cerrados"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Chart with Conversion Line */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Embudo de Conversión</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={funnelData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" name="Leads" radius={[0, 4, 4, 0]} barSize={30}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <Bar dataKey="conversion" name="% Conversión" fill="#94a3b8" barSize={10} hide />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {funnelData.map((d, i) => (
              <div key={i}>
                <p className="text-[10px] text-slate-400 uppercase font-bold">{d.name}</p>
                <p className="text-sm font-bold text-slate-700">{d.conversion}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Aging Table Component */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Aging de Pipeline</h3>
            <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">Leads Abiertos</span>
          </div>
          <div className="space-y-4">
            {agingTable.map((item, index) => (
              <div key={item.range} className="relative">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-medium text-slate-600">{item.range}</span>
                  <span className="text-sm font-bold text-slate-900">{item.count} leads ({item.percentage}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs text-slate-400 italic font-medium">
            * El aging mide los días transcurridos desde el registro para todos los leads en estado 'Abierto'.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, subtitle }: { title: string, value: string | number, icon: React.ReactNode, subtitle?: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
      </div>
    </div>
  );
}
