import Papa from 'papaparse';
import { parse, isValid, parseISO } from 'date-fns';
import { Lead, RawLead, Estado } from '../types';

const GOOGLE_SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1KffZz6DOA2WHUxe-2bpV7BBZrzMskjrmKWPWpAVMByo/export?format=csv';

function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  // Try parsing DD/MM/YYYY HH:mm:ss
  let d = parse(dateStr, 'd/M/yyyy H:mm:ss', new Date());
  if (isValid(d)) return d;
  
  // Try parsing DD/MM/YYYY
  d = parse(dateStr, 'd/M/yyyy', new Date());
  if (isValid(d)) return d;

  // Try parsing ISO
  d = parseISO(dateStr);
  if (isValid(d)) return d;

  return null;
}

function parseNumber(numStr?: string): number {
  if (!numStr) return 0;
  const cleaned = numStr.replace(/[^\d.,-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export async function fetchAndParseData(): Promise<Lead[]> {
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export function parseCSV(csvText: string): Lead[] {
  const result = Papa.parse<RawLead>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const rawData = result.data;
  const leadsMap = new Map<string, Lead>();

  rawData.forEach((row) => {
    const id = row['ID contacto']?.trim() || Math.random().toString(36).substring(7);
    const estadoRaw = row['Estado']?.trim() || 'Abierto';
    let estado: Estado = 'Abierto';
    if (estadoRaw.toLowerCase() === 'ganado') estado = 'Ganado';
    if (estadoRaw.toLowerCase() === 'perdido') estado = 'Perdido';

    const solucionRaw1 = row['Solución']?.trim();
    const solucionRaw2 = row['Solucion']?.trim();
    const solucion = solucionRaw1 || solucionRaw2 || 'Sin Solución';

    const fechaRegistro = parseDate(row['Fecha Registro']);
    const fechaCierre = parseDate(row['Fecha ganado/perdido']);
    
    const ingresos = parseNumber(row['Ingresos']);
    const motivoPerdida = row['Motivo perdida']?.trim() || '';

    const lead: Lead = {
      id,
      subcuenta: row['Subcuenta']?.trim() || 'Desconocida',
      fechaRegistro,
      nombre: row['Nombre completo']?.trim() || 'Desconocido',
      telefono: row['teléfono']?.trim() || '',
      solucion,
      estado,
      atribucion: row['Atribucion']?.trim() || 'Desconocido',
      comercial: row['Comercial']?.trim() || 'Sin Asignar',
      etapa: row['Etapa']?.trim() || 'Sin Etapa',
      fechaCierre,
      tiempoGanarse: parseNumber(row['Tiempo en ganarse (dias)']),
      llamadasSalientes: parseNumber(row['Nº de llamadas salientes']),
      llamadasEntrantes: parseNumber(row['Nº de llamadas entrantes (fallidas)']),
      whatsapp: parseNumber(row['Nº de whatsapp contestados']),
      duracionLlamada: parseNumber(row['Duración llamada']),
      motivoPerdida,
      ingresos,
      
      hasErrorIngresos: estado === 'Ganado' && ingresos <= 0,
      hasErrorMotivo: estado === 'Perdido' && !motivoPerdida,
      hasErrorFechaCierre: (estado === 'Ganado' || estado === 'Perdido') && !fechaCierre,
    };

    // Deduplication strategy: keep most recent by fechaRegistro or fechaCierre
    if (leadsMap.has(id)) {
      const existing = leadsMap.get(id)!;
      const existingDate = existing.fechaCierre || existing.fechaRegistro || new Date(0);
      const newDate = lead.fechaCierre || lead.fechaRegistro || new Date(0);
      if (newDate > existingDate) {
        leadsMap.set(id, lead);
      }
    } else {
      leadsMap.set(id, lead);
    }
  });

  return Array.from(leadsMap.values());
}
