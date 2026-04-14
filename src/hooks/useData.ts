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
  comercialesEmails: {},
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
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate = new Date(0);
    let endDate = endOfDay(now);

    switch (filters.dateRange) {
      case 'Hoy': startDate = startOfDay(now); break;
      case 'Semana': startDate = startOfWeek(now, { weekStartsOn: 1 }); break;
      case 'Mes': startDate = startOfMonth(now); break;
      case 'Custom':
        startDate = filters.customStartDate ? parseISO(filters.customStartDate) : new Date(0);
        endDate = filters.customEndDate ? endOfDay(parseISO(filters.customEndDate)) : endOfDay(now);
        break;
      default: startDate = new Date(0);
    }

    return (Array.isArray(data) ? data : []).filter((lead: any) => {
      const raw = lead.fechaCierre || lead.fechaRegistro;
      const date = raw instanceof Date ? raw : (typeof raw === 'string' ? new Date(raw) : null);
      if (date && !isNaN(date.getTime()) && !isWithinInterval(date, { start: startDate, end: endDate })) return false;
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
    const tiempoMedioGanar = ganadosConTiempo.length > 0 ? ganadosConTiempo.reduce((sum, l) => sum + l.tiempoGanarse, 0) / ganadosConTiempo.length : 0;
    const callsOutTotal = filteredData.reduce((sum, l) => sum + l.llamadasSalientes, 0);
    const callsFailedInTotal = filteredData.reduce((sum, l) => sum + l.llamadasEntrantes, 0);
    const waTotal = filteredData.reduce((sum, l) => sum + l.whatsapp, 0);
    const callDurationTotal = filteredData.reduce((sum, l) => sum + l.duracionLlamada, 0);
    const actividadTotalSimple = callsOutTotal + waTotal;
    const actividadMediaPorLead = leadsTotales > 0 ? actividadTotalSimple / leadsTotales : 0;

    const leadsPorCanal: Record<string, number> = {};
    const ingresosPorCanal: Record<string, number> = {};
    const ganadosPorCanal: Record<string, number> = {};
    const perdidosPorCanal: Record<string, number> = {};
    const actividadPorCanal: Record<string, number> = {};
    const conteoPorEtapa: Record<string, number> = {};
    const ingresosPorSolucion: Record<string, number> = {};
    const ingresosPorSubcuenta: Record<string, number> = {};
    const ingresosPorComercial: Record<string, number> = {};
    const agingLeads = { '0-2 días': 0, '3-7 días': 0, '8-14 días': 0, '+15 días': 0 };
    const statsComerciales: Record<string, any> = {};
    const now = new Date();
    let valorPipelineAbierto = 0;
    const ingresosMensuales: Record<string, number> = {};

    filteredData.forEach(l => {
      const canal = l.atribucion || 'Desconocido';
      leadsPorCanal[canal] = (leadsPorCanal[canal] || 0) + 1;
      actividadPorCanal[canal] = (actividadPorCanal[canal] || 0) + (l.llamadasSalientes + l.whatsapp);
      if (l.estado === 'Ganado') {
        ingresosPorCanal[canal] = (ingresosPorCanal[canal] || 0) + l.ingresos;
        ganadosPorCanal[canal] = (ganadosPorCanal[canal] || 0) + 1;
        const d = l.fechaCierre || l.fechaRegistro;
        if (d) {
          const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          ingresosMensuales[monthKey] = (ingresosMensuales[monthKey] || 0) + l.ingresos;
        }
      } else if (l.estado === 'Perdido') {
        perdidosPorCanal[canal] = (perdidosPorCanal[canal] || 0) + 1;
      }
      const etapa = l.etapa || 'Sin Etapa';
      conteoPorEtapa[etapa] = (conteoPorEtapa[etapa] || 0) + 1;
      if (l.estado === 'Ganado') {
        ingresosPorSolucion[l.solucion] = (ingresosPorSolucion[l.solucion] || 0) + l.ingresos;
        ingresosPorSubcuenta[l.subcuenta] = (ingresosPorSubcuenta[l.subcuenta] || 0) + l.ingresos;
        ingresosPorComercial[l.comercial] = (ingresosPorComercial[l.comercial] || 0) + l.ingresos;
      }
      if (l.estado === 'Abierto') {
        valorPipelineAbierto += (l.ingresos || 0);
        if (l.fechaRegistro) {
          const diffDays = Math.floor((now.getTime() - l.fechaRegistro.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 2) agingLeads['0-2 días']++;
          else if (diffDays <= 7) agingLeads['3-7 días']++;
          else if (diffDays <= 14) agingLeads['8-14 días']++;
          else agingLeads['+15 días']++;
        }
      }
      const c = l.comercial || 'Sin Asignar';
      if (!statsComerciales[c]) statsComerciales[c] = { ganados: 0, perdidos: 0, abiertos: 0, ingresos: 0, tiempos: [], calls: 0, wa: 0, leads: 0 };
      const s = statsComerciales[c];
      s.leads++;
      s.calls += l.llamadasSalientes;
      s.wa += l.whatsapp;
      if (l.estado === 'Ganado') { s.ganados++; s.ingresos += l.ingresos; if (l.tiempoGanarse > 0) s.tiempos.push(l.tiempoGanarse); }
      else if (l.estado === 'Perdido') s.perdidos++;
      else s.abiertos++;
    });

    const rplPorCanal: Record<string, number> = {};
    const winRatePorCanal: Record<string, number> = {};
    const calidadPorCanal: Record<string, any> = {};
    Object.keys(leadsPorCanal).forEach(canal => {
      rplPorCanal[canal] = ingresosPorCanal[canal] / leadsPorCanal[canal];
      const g = ganadosPorCanal[canal] || 0;
      const p = perdidosPorCanal[canal] || 0;
      winRatePorCanal[canal] = g + p > 0 ? g / (g + p) : 0;
      calidadPorCanal[canal] = { mediaActividad: actividadPorCanal[canal] / leadsPorCanal[canal], tiempoMedioCierre: 0, pctCualificacion: 0 };
    });

    const finalStatsComerciales: Record<string, any> = {};
    Object.keys(statsComerciales).forEach(c => {
      const s = statsComerciales[c];
      const wr = s.ganados + s.perdidos > 0 ? s.ganados / (s.ganados + s.perdidos) : 0;
      finalStatsComerciales[c] = {
        ganados: s.ganados, perdidos: s.perdidos, abiertos: s.abiertos, ingresos: s.ingresos,
        winRate: wr,
        tiempoMedioVenta: s.tiempos.length > 0 ? s.tiempos.reduce((a: any, b: any) => a + b, 0) / s.tiempos.length : 0,
        llamadasPorLead: s.leads > 0 ? s.calls / s.leads : 0,
        whatsappPorLead: s.leads > 0 ? s.wa / s.leads : 0,
      };
    });

    const motivosPorCanal: Record<string, Record<string, number>> = {};
    const motivosPorComercial: Record<string, Record<string, number>> = {};
    const motivosConteos: Record<string, number> = {};
    filteredData.forEach(l => {
      if (l.estado === 'Perdido' && l.motivoPerdida) {
        const canal = l.atribucion || 'Desconocido';
        const comercial = l.comercial || 'Sin Asignar';
        const motivo = l.motivoPerdida;
        motivosConteos[motivo] = (motivosConteos[motivo] || 0) + 1;
        if (!motivosPorCanal[canal]) motivosPorCanal[canal] = {};
        motivosPorCanal[canal][motivo] = (motivosPorCanal[canal][motivo] || 0) + 1;
        if (!motivosPorComercial[comercial]) motivosPorComercial[comercial] = {};
        motivosPorComercial[comercial][motivo] = (motivosPorComercial[comercial][motivo] || 0) + 1;
      }
    });

    const topMotivos = Object.entries(motivosConteos).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
    const conversionPorEtapa: Record<string, number> = {};
    Object.keys(conteoPorEtapa).forEach(e => { conversionPorEtapa[e] = conteoPorEtapa[e] / leadsTotales; });
    const serieTemporalIngresos = Object.entries(ingresosMensuales).map(([date, value]) => ({ date, value })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      leadsTotales, ganados, perdidos, abiertos, winRate, ingresosTotales, ticketMedio, ingresoPorLead,
      tiempoMedioGanar, callsOutTotal, callsFailedInTotal, waTotal, callDurationTotal,
      actividadTotalSimple, actividadMediaPorLead, leadsPorCanal, ingresosPorCanal, rplPorCanal,
      winRatePorCanal, calidadPorCanal, conteoPorEtapa, conversionPorEtapa, valorPipelineAbierto,
      agingLeads, ingresosPorSolucion, ingresosPorSubcuenta, ingresosPorComercial,
      serieTemporalIngresos, statsComerciales: finalStatsComerciales,
      motivosPorCanal, motivosPorComercial, topMotivos,
    };
  }, [filteredData]);

  const filterOptions = useMemo(() => ({
    subcuentas: Array.from(new Set(data.map(l => l.subcuenta))).filter(Boolean),
    canales: Array.from(new Set(data.map(l => l.atribucion))).filter(Boolean),
    comerciales: Array.from(new Set(data.map(l => l.comercial))).filter(Boolean),
    soluciones: Array.from(new Set(data.map(l => l.solucion))).filter(Boolean),
    etapas: Array.from(new Set(data.map(l => l.etapa))).filter(Boolean),
    estados: ['Ganado', 'Perdido', 'Abierto'] as const,
  }), [data]);

  return { data, filteredData, loading, error, lastUpdated, filters, setFilters, metrics, filterOptions, handleFileUpload, loadData, config, setConfig };
}
