import React, { useMemo } from 'react';
import { Lead, Metrics } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

interface ActividadTabProps {
  data: Lead[];
  metrics: Metrics;
}

export function ActividadTab({ data, metrics }: ActividadTabProps) {
  const actData = useMemo(() => {
    const map = new Map<string, any>();
    ['Ganado', 'Perdido', 'Abierto'].forEach(e => map.set(e, { estado: e, leads: 0, llamadas: 0, whatsapp: 0, duracion: 0 }));
    
    data.forEach(lead => {
      const c = map.get(lead.estado);
      c.leads += 1;
      c.llamadas += lead.llamadasSalientes;
      c.whatsapp += lead.whatsapp;
      c.duracion += lead.duracionLlamada;
    });

    return Array.from(map.values()).map(c => ({
      ...c,
      llamadasMedias: c.leads > 0 ? c.llamadas / c.leads : 0,
      whatsappMedios: c.leads > 0 ? c.whatsapp / c.leads : 0,
      duracionMedia: c.leads > 0 ? c.duracion / c.leads : 0,
    }));
  }, [data]);

  const scatterData = useMemo(() => {
    return data.filter(l => l.estado === 'Ganado').map(l => ({
      id: l.id,
      llamadas: l.llamadasSalientes,
      ingresos: l.ingresos,
      comercial: l.comercial
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Llamadas Salientes Totales</h3>
          <p className="text-3xl font-bold text-gray-900">{metrics.callsOutTotal}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">WhatsApp Contestados</h3>
          <p className="text-3xl font-bold text-gray-900">{metrics.waTotal}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Duración Total (min)</h3>
          <p className="text-3xl font-bold text-gray-900">{metrics.callDurationTotal}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Actividad Media / Lead</h3>
          <p className="text-3xl font-bold text-blue-600">{metrics.actividadMediaPorLead.toFixed(1)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Actividad Media por Estado</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="estado" />
                <YAxis />
                <Tooltip formatter={(v: number) => v.toFixed(1)} />
                <Legend />
                <Bar dataKey="llamadasMedias" name="Llamadas Medias" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="whatsappMedios" name="WhatsApp Medios" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Llamadas vs Ingresos (Ganados)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" dataKey="llamadas" name="Llamadas" />
                <YAxis type="number" dataKey="ingresos" name="Ingresos" tickFormatter={(v) => `${v / 1000}k`} />
                <ZAxis type="category" dataKey="comercial" name="Comercial" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v: any, name: string) => name === 'Ingresos' ? v.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }) : v} />
                <Scatter name="Ganados" data={scatterData} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
