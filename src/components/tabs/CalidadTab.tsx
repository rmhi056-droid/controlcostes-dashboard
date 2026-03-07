import React, { useMemo } from 'react';
import { Lead } from '../../types';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface CalidadTabProps {
  data: Lead[];
}

export function CalidadTab({ data }: CalidadTabProps) {
  const { errors, stats } = useMemo(() => {
    const errs: any[] = [];
    let noIngresos = 0;
    let noMotivo = 0;
    let noFechaCierre = 0;
    
    data.forEach(lead => {
      if (lead.hasErrorIngresos) {
        noIngresos++;
        errs.push({ ...lead, tipoError: 'Ganado sin ingresos' });
      }
      if (lead.hasErrorMotivo) {
        noMotivo++;
        errs.push({ ...lead, tipoError: 'Perdido sin motivo' });
      }
      if (lead.hasErrorFechaCierre) {
        noFechaCierre++;
        errs.push({ ...lead, tipoError: 'Cerrado sin fecha de cierre' });
      }
    });

    return {
      errors: errs,
      stats: {
        noIngresos,
        noMotivo,
        noFechaCierre,
        totalErrores: noIngresos + noMotivo + noFechaCierre,
        porcentajeSano: data.length > 0 ? ((data.length - (noIngresos + noMotivo + noFechaCierre)) / data.length) * 100 : 100
      }
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className={`p-3 rounded-full ${stats.porcentajeSano > 90 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
            {stats.porcentajeSano > 90 ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Salud de Datos</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.porcentajeSano.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Ganados sin Ingresos</h3>
          <p className="text-2xl font-bold text-rose-600">{stats.noIngresos}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Perdidos sin Motivo</h3>
          <p className="text-2xl font-bold text-rose-600">{stats.noMotivo}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Sin Fecha Cierre</h3>
          <p className="text-2xl font-bold text-rose-600">{stats.noFechaCierre}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Registros con Inconsistencias</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider bg-gray-50">
                <th className="p-4 rounded-tl-lg">ID Contacto</th>
                <th className="p-4">Nombre</th>
                <th className="p-4">Comercial</th>
                <th className="p-4">Estado</th>
                <th className="p-4 rounded-tr-lg">Tipo de Error</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((e, i) => (
                <tr key={`${e.id}-${i}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-gray-600">{e.id}</td>
                  <td className="p-4 font-medium text-gray-900">{e.nombre}</td>
                  <td className="p-4 text-gray-600">{e.comercial}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      e.estado === 'Ganado' ? 'bg-emerald-100 text-emerald-700' :
                      e.estado === 'Perdido' ? 'bg-rose-100 text-rose-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {e.estado}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-rose-600 flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {e.tipoError}
                  </td>
                </tr>
              ))}
              {errors.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <CheckCircle className="mx-auto mb-2 text-emerald-500" size={32} />
                    No se encontraron inconsistencias en los datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
