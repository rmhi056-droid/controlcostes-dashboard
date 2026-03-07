import React, { useMemo } from 'react';
import { Lead, Metrics } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format, startOfWeek, parseISO } from 'date-fns';

interface OverviewTabProps {
  data: Lead[];
  metrics: Metrics;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function OverviewTab({ data, metrics }: OverviewTabProps) {
  const trendData = useMemo(() => {
    const weeksMap = new Map<string, { week: string, leads: number, ganados: number, ingresos: number }>();
    
    data.forEach(lead => {
      const date = lead.fechaRegistro || lead.fechaCierre;
      if (!date) return;
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekStr = format(weekStart, 'yyyy-MM-dd');
      
      if (!weeksMap.has(weekStr)) {
        weeksMap.set(weekStr, { week: weekStr, leads: 0, ganados: 0, ingresos: 0 });
      }
      const w = weeksMap.get(weekStr)!;
      w.leads += 1;
      if (lead.estado === 'Ganado') {
        w.ganados += 1;
        w.ingresos += lead.ingresos;
      }
    });

    return Array.from(weeksMap.values()).sort((a, b) => a.week.localeCompare(b.week));
  }, [data]);

  const statusData = [
    { name: 'Ganado', value: metrics.ganados },
    { name: 'Perdido', value: metrics.perdidos },
    { name: 'Abierto', value: metrics.abiertos },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Leads Totales</h3>
          <p className="text-3xl font-bold text-gray-900">{metrics.leadsTotales}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Win Rate</h3>
          <p className="text-3xl font-bold text-blue-600">{(metrics.winRate * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Ingresos Totales</h3>
          <p className="text-3xl font-bold text-emerald-600">{metrics.ingresosTotales.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Ticket Medio</h3>
          <p className="text-3xl font-bold text-gray-900">{metrics.ticketMedio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Tendencia Semanal (Leads y Ganados)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="week" tickFormatter={(v) => format(parseISO(v), 'dd MMM')} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip labelFormatter={(v) => format(parseISO(v as string), 'dd MMM yyyy')} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="leads" stroke="#8884d8" name="Leads" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="ganados" stroke="#10b981" name="Ganados" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución por Estado</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
