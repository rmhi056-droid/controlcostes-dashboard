export type Estado = 'Ganado' | 'Perdido' | 'Abierto';

export interface RawLead {
  'ID contacto'?: string;
  'Subcuenta'?: string;
  'Fecha Registro'?: string;
  'Nombre completo'?: string;
  'teléfono'?: string;
  'Solucion'?: string;
  'Solución'?: string;
  'Estado'?: string;
  'Atribucion'?: string;
  'Comercial'?: string;
  'Etapa'?: string;
  'Fecha ganado/perdido'?: string;
  'Tiempo en ganarse (dias)'?: string;
  'Nº de llamadas salientes'?: string;
  'Nº de llamadas entrantes (fallidas)'?: string;
  'Nº de whatsapp contestados'?: string;
  'Duración llamada'?: string;
  'Motivo perdida'?: string;
  'Ingresos'?: string;
  [key: string]: string | undefined;
}

export interface Lead {
  id: string;
  subcuenta: string;
  fechaRegistro: Date | null;
  nombre: string;
  telefono: string;
  solucion: string;
  estado: Estado;
  atribucion: string;
  comercial: string;
  etapa: string;
  fechaCierre: Date | null;
  tiempoGanarse: number;
  llamadasSalientes: number;
  llamadasEntrantes: number;
  whatsapp: number;
  duracionLlamada: number;
  motivoPerdida: string;
  ingresos: number;
  
  // Quality flags
  hasErrorIngresos: boolean;
  hasErrorMotivo: boolean;
  hasErrorFechaCierre: boolean;
}

export interface Filters {
  dateRange: 'Hoy' | 'Semana' | 'Mes' | 'Custom' | 'Todo';
  customStartDate?: string;
  customEndDate?: string;
  subcuentas: string[];
  canales: string[];
  comerciales: string[];
  soluciones: string[];
  etapas: string[];
  estados: Estado[];
}

export interface Metrics {
  leadsTotales: number;
  ganados: number;
  perdidos: number;
  abiertos: number;
  winRate: number;
  ingresosTotales: number;
  ticketMedio: number;
  ingresoPorLead: number;
  tiempoMedioGanar: number;
  
  callsOutTotal: number;
  callsFailedInTotal: number;
  waTotal: number;
  callDurationTotal: number;
  actividadTotalSimple: number;
  actividadMediaPorLead: number;
}

export interface AppConfig {
  metas: {
    ingresos: number;
    ganados: number;
  };
  comercialesPhotos: Record<string, string>;
}

