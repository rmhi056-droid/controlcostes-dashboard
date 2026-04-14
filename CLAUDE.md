# CLAUDE.md — controlcostes-dashboard

## What
Dashboard comercial React/TypeScript desplegado en Vercel que consume leads de un Google Sheet vía CSV público.
Permite filtrar, analizar y enviar informes de rendimiento comercial por webhook.

## Stack
- React 19 + TypeScript 5.8
- Vite 6 (bundler) + Tailwind 4 (estilos)
- Recharts (gráficas) + Lucide (iconos) + Motion (animaciones)
- PapaParse (parse CSV) + date-fns (fechas)
- Vercel (deploy automático desde main)

## Structure
```
src/
  App.tsx              # Router de tabs + estado global via useData()
  types.ts             # Tipos canónicos: RawLead, Lead, Filters, Metrics, AppConfig
  hooks/useData.ts     # Único hook de estado: fetch, filtros, métricas calculadas
  services/dataService.ts  # Fetch Google Sheets CSV + parseCSV + deduplicación por ID
  components/
    tabs/              # Un componente por pestaña del dashboard (13 tabs)
    Sidebar.tsx        # Navegación + TabId enum
    TopBar.tsx         # Filtros globales + upload CSV + refresh
    ArenaMode.tsx      # Vista gamificada "La Arena"
    SendReportButton.tsx  # Envío por webhook
```

## Rules
- **Fuente de datos**: Google Sheets CSV hardcodeado en `dataService.ts`. No hay backend propio.
- **Estado global**: solo en `useData.ts`. Los tabs reciben `data`, `metrics` y `filters` como props, nunca llaman fetch directamente.
- **Sin localStorage** salvo `appConfig` (metas e fotos de comerciales).
- **Deploy**: push a `main` → Vercel despliega automáticamente. No hay rama de staging.
- **Tipos**: cualquier nuevo campo del CSV debe añadirse primero en `types.ts` (RawLead → Lead).

## Conventions
- Componentes en PascalCase, hooks en camelCase con prefijo `use`
- Métricas calculadas solo en `useData.ts` → `useMemo`
- Nuevos tabs: crear en `src/components/tabs/`, registrar en `Sidebar.tsx` (TabId) y en `App.tsx` (switch)
- Fechas: siempre `date-fns`, nunca `new Date()` directo para cálculos
- Datos del CSV: normalizar en `parseCSV()`, nunca en los componentes
