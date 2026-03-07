import { useState, useEffect, useMemo } from 'react';
import { Lead, Filters, Metrics, AppConfig } from '../types';
import { fetchAndParseData, parseCSV } from '../services/dataService';
import { isWithinInterval, startOfWeek, startOfMonth, startOfDay, endOfDay, parseISO } from 'date-fns';

const DEFAULT_CONFIG: AppConfig = {
  metas: {
    ingresos: 100000,
    ganados: 50,
  },
  comercialesPhotos: {},
};

export function useData() {
  const [data, setData] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('appConfig');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('appConfig', JSON.stringify(config));
  }, [config]);

  const [filters, setFilters] = useState<Filters>({
    dateRange: 'Mes',
    subcuentas: [],
    canales: [],
    comerciales: [],
    soluciones: [],
    etapas: [],
    estados: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const leads = await fetchAndParseData();
      setData(leads);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const leads = parseCSV(text);
        setData(leads);
        setLastUpdated(new Date());
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    loadData();
    // Optional: Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate = endOfDay(now);

    switch (filters.dateRange) {
      case 'Hoy':
        startDate = startOfDay(now);
        break;
      case 'Semana':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'Mes':
        startDate = startOfMonth(now);
        break;
      case 'Custom':
        startDate = filters.customStartDate ? parseISO(filters.customStartDate) : new Date(0);
        endDate = filters.customEndDate ? endOfDay(parseISO(filters.customEndDate)) : endOfDay(now);
        break;
      case 'Todo':
      default:
        startDate = new Date(0);
        break;
    }

    return data.filter((lead) => {
      // Date filter (use fechaRegistro or fechaCierre)
      const dateToUse = lead.fechaCierre || lead.fechaRegistro;
      if (dateToUse && !isWithinInterval(dateToUse, { start: startDate, end: endDate })) {
        return false;
      }

      if (filters.subcuentas.length > 0 && !filters.subcuentas.includes(lead.subcuenta)) return false;
      if (filters.canales.length > 0 && !filters.canales.includes(lead.atribucion)) return false;
      if (filters.comerciales.length > 0 && !filters.comerciales.includes(lead.comercial)) return false;
      if (filters.soluciones.length > 0 && !filters.soluciones.includes(lead.solucion)) return false;
      if (filters.etapas.length > 0 && !filters.etapas.includes(lead.etapa)) return false;
      if (filters.estados.length > 0 && !filters.estados.includes(lead.estado)) return false;

      return true;
    });
  }, [data, filters]);

  const metrics = useMemo<Metrics>(() => {
    const leadsTotales = filteredData.length;
    const ganados = filteredData.filter((l) => l.estado === 'Ganado').length;
    const perdidos = filteredData.filter((l) => l.estado === 'Perdido').length;
    const abiertos = filteredData.filter((l) => l.estado === 'Abierto').length;
    const winRate = ganados + perdidos > 0 ? ganados / (ganados + perdidos) : 0;
    
    const ingresosTotales = filteredData.reduce((sum, l) => sum + (l.estado === 'Ganado' ? l.ingresos : 0), 0);
    const ticketMedio = ganados > 0 ? ingresosTotales / ganados : 0;
    const ingresoPorLead = leadsTotales > 0 ? ingresosTotales / leadsTotales : 0;
    
    const ganadosConTiempo = filteredData.filter(l => l.estado === 'Ganado' && l.tiempoGanarse > 0);
    const tiempoMedioGanar = ganadosConTiempo.length > 0 
      ? ganadosConTiempo.reduce((sum, l) => sum + l.tiempoGanarse, 0) / ganadosConTiempo.length 
      : 0;

    const callsOutTotal = filteredData.reduce((sum, l) => sum + l.llamadasSalientes, 0);
    const callsFailedInTotal = filteredData.reduce((sum, l) => sum + l.llamadasEntrantes, 0);
    const waTotal = filteredData.reduce((sum, l) => sum + l.whatsapp, 0);
    const callDurationTotal = filteredData.reduce((sum, l) => sum + l.duracionLlamada, 0);
    const actividadTotalSimple = callsOutTotal + waTotal;
    const actividadMediaPorLead = leadsTotales > 0 ? actividadTotalSimple / leadsTotales : 0;

    return {
      leadsTotales,
      ganados,
      perdidos,
      abiertos,
      winRate,
      ingresosTotales,
      ticketMedio,
      ingresoPorLead,
      tiempoMedioGanar,
      callsOutTotal,
      callsFailedInTotal,
      waTotal,
      callDurationTotal,
      actividadTotalSimple,
      actividadMediaPorLead,
    };
  }, [filteredData]);

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    return {
      subcuentas: Array.from(new Set(data.map(l => l.subcuenta))).filter(Boolean),
      canales: Array.from(new Set(data.map(l => l.atribucion))).filter(Boolean),
      comerciales: Array.from(new Set(data.map(l => l.comercial))).filter(Boolean),
      soluciones: Array.from(new Set(data.map(l => l.solucion))).filter(Boolean),
      etapas: Array.from(new Set(data.map(l => l.etapa))).filter(Boolean),
      estados: ['Ganado', 'Perdido', 'Abierto'] as const,
    };
  }, [data]);

  return {
    data,
    filteredData,
    loading,
    error,
    lastUpdated,
    filters,
    setFilters,
    metrics,
    filterOptions,
    handleFileUpload,
    loadData,
    config,
    setConfig
  };
}

