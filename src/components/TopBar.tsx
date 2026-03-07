import React from 'react';
import { Filters, Estado, Lead } from '../types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { RefreshCw, Upload, Filter, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { SendReportButton } from './SendReportButton';

interface TopBarProps {
  data: Lead[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filterOptions: any;
  lastUpdated: Date | null;
  onRefresh: () => void;
  onUpload: (file: File) => void;
}

export function TopBar({
  data,
  filters,
  setFilters,
  filterOptions,
  lastUpdated,
  onRefresh,
  onUpload,
}: TopBarProps) {
  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setFilters((prev) => ({
      ...prev,
      customStartDate: start ? start.toISOString() : undefined,
      customEndDate: end ? end.toISOString() : undefined,
    }));
  };

  return (
    <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-40 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800">Dashboard Comercial</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500 flex items-center gap-2">
            {lastUpdated && (
              <span>Actualizado: {format(lastUpdated, 'HH:mm:ss')}</span>
            )}
            <button onClick={onRefresh} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors" title="Actualizar datos">
              <RefreshCw size={16} className="text-slate-600" />
            </button>
          </div>
          
          <SendReportButton 
            data={data} 
            filters={filters} 
            comerciales={filterOptions.comerciales} 
          />

          <label className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg cursor-pointer hover:bg-teal-100 transition-colors text-sm font-semibold shadow-sm border border-teal-100">
            <Upload size={16} />
            Subir CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2 text-slate-500 font-semibold px-2">
          <Filter size={16} />
          FILTROS
        </div>

        <div className="flex items-center gap-2 bg-slate-800 text-white rounded-full px-4 py-1.5 shadow-sm">
          <Calendar size={14} className="text-teal-400" />
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="bg-transparent text-white font-medium outline-none cursor-pointer"
          >
            <option value="Hoy" className="text-slate-800">Hoy</option>
            <option value="Semana" className="text-slate-800">Esta Semana</option>
            <option value="Mes" className="text-slate-800">Este Mes</option>
            <option value="Custom" className="text-slate-800">Personalizado</option>
            <option value="Todo" className="text-slate-800">Todo el tiempo</option>
          </select>
        </div>

        {filters.dateRange === 'Custom' && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm relative z-50">
            <DatePicker
              selectsRange={true}
              startDate={filters.customStartDate ? parseISO(filters.customStartDate) : null}
              endDate={filters.customEndDate ? parseISO(filters.customEndDate) : null}
              onChange={handleDateChange}
              locale={es}
              dateFormat="dd/MM/yyyy"
              placeholderText="Selecciona fechas"
              className="text-sm outline-none text-slate-700 bg-transparent w-48 text-center cursor-pointer"
              isClearable={true}
            />
          </div>
        )}

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        <select
          value={filters.comerciales[0] || ''}
          onChange={(e) => handleFilterChange('comerciales', e.target.value ? [e.target.value] : [])}
          className="border border-slate-200 rounded-full px-4 py-1.5 bg-white text-slate-700 shadow-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <option value="">Comerciales</option>
          {filterOptions.comerciales.map((c: string) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filters.soluciones[0] || ''}
          onChange={(e) => handleFilterChange('soluciones', e.target.value ? [e.target.value] : [])}
          className="border border-slate-200 rounded-full px-4 py-1.5 bg-white text-slate-700 shadow-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <option value="">Tratamientos</option>
          {filterOptions.soluciones.map((c: string) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filters.canales[0] || ''}
          onChange={(e) => handleFilterChange('canales', e.target.value ? [e.target.value] : [])}
          className="border border-slate-200 rounded-full px-4 py-1.5 bg-white text-slate-700 shadow-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <option value="">Fuentes</option>
          {filterOptions.canales.map((c: string) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filters.subcuentas[0] || ''}
          onChange={(e) => handleFilterChange('subcuentas', e.target.value ? [e.target.value] : [])}
          className="border border-slate-200 rounded-full px-4 py-1.5 bg-white text-slate-700 shadow-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <option value="">Ubicaciones</option>
          {filterOptions.subcuentas.map((c: string) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={() => setFilters({
            dateRange: 'Mes',
            subcuentas: [],
            canales: [],
            comerciales: [],
            soluciones: [],
            etapas: [],
            estados: [],
          })}
          className="text-slate-400 hover:text-teal-600 underline text-xs ml-auto font-medium transition-colors"
        >
          Resetear filtros
        </button>
      </div>
    </div>
  );
}


