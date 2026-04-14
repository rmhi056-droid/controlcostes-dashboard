import React, { useState, useRef, useEffect } from 'react';
import { Lead, Filters, AppConfig } from '../types';
import { isWithinInterval, startOfWeek, startOfMonth, startOfDay, endOfDay, parseISO } from 'date-fns';
import { Send, ChevronDown, Loader2, CheckCircle } from 'lucide-react';

interface SendReportButtonProps {
  data: Lead[];
  filters: Filters;
  filterOptions: { comerciales: string[] };
  config?: AppConfig;
}

export function SendReportButton({ data, filters, filterOptions, config }: SendReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getEmail = (comercial: string) => config?.comercialesEmails?.[comercial] || '';

  const handleSend = async (comercial: string) => {
    setIsSending(true);
    setIsOpen(false);
    try {
      const now = new Date();
      let startDate: Date;
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

      const comercialData = data.filter(lead => {
        if (lead.comercial !== comercial) return false;
        const dateToUse = lead.fechaCierre || lead.fechaRegistro;
        if (dateToUse && !isWithinInterval(dateToUse, { start: startDate, end: endDate })) return false;
        return true;
      });

      const ganados = comercialData.filter(l => l.estado === 'Ganado').length;
      const perdidos = comercialData.filter(l => l.estado === 'Perdido').length;
      const winRate = ganados + perdidos > 0 ? (ganados / (ganados + perdidos)) * 100 : 0;
      const ingresosTotales = comercialData.reduce((sum, l) => sum + (l.estado === 'Ganado' ? l.ingresos : 0), 0);
      const ticketMedio = ganados > 0 ? ingresosTotales / ganados : 0;
      const callsOutTotal = comercialData.reduce((sum, l) => sum + l.llamadasSalientes, 0);
      const callsFailedInTotal = comercialData.reduce((sum, l) => sum + l.llamadasEntrantes, 0);
      const waTotal = comercialData.reduce((sum, l) => sum + l.whatsapp, 0);
      const callDurationTotal = comercialData.reduce((sum, l) => sum + l.duracionLlamada, 0);

      const html = `
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;border-radius:12px;">
          <div style="background:#fff;padding:30px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,.05);border:1px solid #e2e8f0;">
            <div style="text-align:center;margin-bottom:20px;">
              <h1 style="color:#0f172a;margin:0;font-size:24px;">Resumen de Desempeño</h1>
              <p style="color:#64748b;font-size:16px;margin-top:5px;">${comercial}</p>
              <p style="color:#94a3b8;font-size:13px;margin-top:5px;">Periodo: ${filters.dateRange}</p>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:15px;margin-top:25px;">
              <div style="flex:1;min-width:120px;background:#f0fdf4;padding:20px;border-radius:10px;text-align:center;border:1px solid #bbf7d0;">
                <p style="margin:0;color:#166534;font-size:12px;text-transform:uppercase;font-weight:bold;">Ingresos</p>
                <p style="margin:10px 0 0;color:#15803d;font-size:28px;font-weight:900;">${ingresosTotales.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</p>
              </div>
              <div style="flex:1;min-width:120px;background:#f0f9ff;padding:20px;border-radius:10px;text-align:center;border:1px solid #bae6fd;">
                <p style="margin:0;color:#075985;font-size:12px;text-transform:uppercase;font-weight:bold;">Win Rate</p>
                <p style="margin:10px 0 0;color:#0369a1;font-size:28px;font-weight:900;">${winRate.toFixed(1)}%</p>
              </div>
            </div>
            <table style="width:100%;border-collapse:collapse;margin-top:25px;font-size:15px;">
              <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;">Leads</td><td style="text-align:right;font-weight:bold;">${comercialData.length}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;">Ganados</td><td style="text-align:right;font-weight:bold;color:#10b981;">${ganados}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;">Perdidos</td><td style="text-align:right;font-weight:bold;color:#ef4444;">${perdidos}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;">Ticket Medio</td><td style="text-align:right;font-weight:bold;">${ticketMedio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;">Llamadas salientes</td><td style="text-align:right;">${callsOutTotal}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;">Llamadas fallidas</td><td style="text-align:right;">${callsFailedInTotal}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;color:#475569;">WhatsApp</td><td style="text-align:right;">${waTotal}</td></tr>
              <tr><td style="padding:10px 0;color:#475569;">Duración total llamadas (min)</td><td style="text-align:right;">${callDurationTotal}</td></tr>
            </table>
            <div style="margin-top:30px;text-align:center;color:#94a3b8;font-size:12px;border-top:1px solid #f1f5f9;padding-top:20px;">
              Generado automáticamente desde el Dashboard Comercial
            </div>
          </div>
        </div>`;

      const email = getEmail(comercial);
      await fetch('https://controlcostes-u67301.vm.elestio.app/webhook/email-resumen-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: comercial, email, html }),
      });

      setSuccessMsg(`Informe enviado a ${comercial}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error('Error sending report:', error);
      alert('Hubo un error al enviar el informe.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSending}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm disabled:opacity-50"
      >
        {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        Enviar informe
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {successMsg && (
        <div className="absolute top-full right-0 mt-2 whitespace-nowrap bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg z-50 border border-emerald-200">
          <CheckCircle size={16} className="text-emerald-600" />
          {successMsg}
        </div>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Seleccionar Comercial
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filterOptions.comerciales.map(c => (
              <button
                key={c}
                onClick={() => handleSend(c)}
                className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors flex items-center justify-between group font-medium"
              >
                <span>{c}</span>
                <span className="text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">Enviar</span>
              </button>
            ))}
            {filterOptions.comerciales.length === 0 && (
              <div className="px-3 py-4 text-sm text-slate-500 text-center">No hay comerciales</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}