# Dashboard Commercial - Implementation Plan

## 📊 Evaluación de pestañas propuestas

| Pestaña | Estado actual | Cobertura (%) | Mejoras necesarias |
| :--- | :--- | :--- | :--- |
| **1. Control de campañas (Marketing)** | ✅ Completo | 100% | Ajustes sutiles en leyendas y Tooltips. |
| **2. Embudo y conversión (Pipeline)** | 🟡 Parcial | 15% | Implementar Funnel Chart y lógica de "aging". |
| **3. Ingresos & mix** | 🟡 Parcial | 10% | Crear análisis de Pareto y segmentación por solución. |
| **4. Rendimiento de comerciales** | 🟡 Parcial | 10% | Desarrollar Leaderboard y ratios de eficiencia. |
| **5. Actividad & contacto** | 🟡 Parcial | 10% | Implementar histogramas de duración y "sweet spot". |
| **6. Motivos de pérdida** | 🟡 Parcial | 10% | Crear Heatmap de motivos por canal/comercial. |
| **7. Subcuentas / sedes** | 🟡 Parcial | 10% | Programar comparativa regional y top soluciones. |
| **8. Cohortes y tiempos** | 🟡 Parcial | 10% | Desarrollar Cohort Heatmap y tiempo medio a ganar. |

## Hallazgos clave
- **Infraestructura lista**: La estructura de navegación (Sidebar/Routing) ya soporta orgánicamente las 8 secciones sin conflictos.
- **Motor de datos avanzado**: `useData.ts` ya procesa métricas agregadas (RPL, Win Rate) que sirven de base para el resto de pestañas.
- **Identidad visual coherente**: La paleta de colores actual es sólida; se recomienda mantenerla evitando rediseños disruptivos.
- **Disponibilidad de datos**: El CSV actual contiene toda la información necesaria para los indicadores técnicos (llamadas, whatsapp, duraciones).
- **Escalabilidad**: El uso de componentes `Tabs` independientes facilita la implementación modular de cada sección restante.

## Próximos pasos
1. **Implementación de Pipeline**: Desarrollar el componente `FunnelTab` con visualización de tasas de caída entre etapas.
2. **Expansión de Métricas**: Añadir en `useData.ts` los cálculos de Pareto (80/20) para soluciones e ingresos.
3. **Optimización de Actividad**: Crear el sistema de "Score de contacto" para predecir la probabilidad de éxito según la actividad.

> [!NOTE]
> Este plan prioriza la funcionalidad técnica y la precisión de los datos. Se mantendrá el diseño actual (sin glassmorphism) realizando solo mejoras de UX sutiles.
