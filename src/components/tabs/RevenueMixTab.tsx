import React, { useMemo } from 'react';
import { Lead, Metrics } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Briefcase, TrendingUp, DollarSign, Building2, User } from 'lucide-react';

interface RevenueMixTabProps {
  metrics: Metrics;
  data: Lead[];
}

export function RevenueMixTab({ metrics, data }: RevenueMixTabProps) {
  const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

  const solutionPareto = useMemo(() => {
    const sorted = Object.entries(metrics.ingresosPorSolucion)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    let cumulative = 0;
    return sorted.map(s => {
      cumulative += s.value;
      return {
        ...s,
        percentage: ((cumulative / (metrics.ingresosTotales || 1)) * 100).toFixed(0)
      };
    });
  }, [metrics]);

  const subcuentaData = useMemo(() => {
    return Object.entries(metrics.ingresosPorSubcuenta)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [metrics]);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Ingresos Totales</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {metrics.ingresosTotales.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">Ganados</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Ticket Medio</p>
          <p className="text-2xl font-bold text-slate-900">
            {metrics.ticketMedio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Subcuenta Top</p>
          <p className="text-lg font-bold text-slate-900 truncate">{subcuentaData[0]?.name || '-'}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Solución Estratégica</p>
          <p className="text-lg font-bold text-slate-900 truncate">{solutionPareto[0]?.name || '-'}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pareto Soluciones */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Pareto: Concentración por Solución</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={solutionPareto}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} hide />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(val: any) => typeof val === 'number' ? val.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : val + '%'}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" name="Ingreso" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            {solutionPareto.slice(0, 3).map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span className="text-xs font-bold text-slate-600">{s.name}: {s.percentage}% acum.</span>
              </div>
            ))}
          </div>
        </div>

        {/* Temporal Series */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Evolución Mensual de Ingresos</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.serieTemporalIngresos}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                   formatter={(val: number) => val.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="value" name="Ingresos" stroke="#6366f1" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution by Subcuenta */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Building2 size={18} className="text-slate-400" /> Ingresos por Subcuenta (Top 8)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subcuentaData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} fontSize={10} />
                <Tooltip 
                  formatter={(val: number) => val.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" name="Ingreso" radius={[0, 4, 4, 0]} barSize={20}>
                  {subcuentaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mix Ingresos Pie */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Briefcase size={18} className="text-slate-400" /> Mix de Cartera (Soluciones)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={solutionPareto.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {solutionPareto.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => val.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
