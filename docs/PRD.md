# PRD · GridOps 1.0

Un analista necesita comparar generación por tecnología y período con cifras inspeccionables. Un evaluador técnico necesita rastrear un indicador hasta su origen y probar la transformación.

| Recorrido | Comportamiento requerido |
|---|---|
| Portfolio | Identidad y carrera en progreso correctas; acceso directo al proyecto |
| Explorador | Últimos 12 meses disponibles, cobertura histórica visible |
| Filtros | Cinco dimensiones, presets, reinicio y URL reproducible |
| Comparación | Mismos meses del año anterior; sin porcentaje cuando falta base |
| Investigación | Series, mix, tabla con búsqueda, orden y páginas |
| Exportación | CSV con todas las filas de los filtros superiores |
| Auditoría | Controles reales, anomalías, fuentes, hash y Parquet |
| Estado del origen | Consulta de metadatos con carga, éxito y fallo |
| Implementación | Caso técnico y código/documentos/datos descargables |

La búsqueda de la tabla es local: no modifica indicadores ni CSV del período, tal como indican el caption y el control. Tabla/API en MWh; gráficos/KPI en GWh. El mix compara energía, no capacidad instalada.

## Calidad

Datos reales; contratos antes de publicar; originales preservados; controles etiquetados; teclado; tablas alternativas; estados vacíos/error; móvil sin desbordamiento global; scroll horizontal contenido en tabla/nav. Sin secretos ni inferencia pagada en ejecución.

## Alcance

Exploración histórica mensual y reproducción de datos. Ingestión anterior a la publicación; no durante una petición del usuario. Sin control de activos, tiempo real, predicciones o clientes/SLA reales. Las pruebas corresponden a esta escala, no certifican carga empresarial ni exactitud del proveedor.

## Aceptación

91.538 observaciones, 2.539 grupos, 146 meses y 13 tecnologías. Reconciliación raw → observaciones → mensual con tolerancia 0,00001 MWh. Fixtures independientes, hash corrupto rechazado, reconstrucción idéntica, API/CSV coherentes, rutas útiles y descarga de código válida. Validación separa pruebas ejecutadas de configuración pendiente de operar.

El cierre para recruiters requiere enlace público y comprobación anónima de las rutas principales. El dominio personal y los datos de contacto solo se añaden si están confirmados; no se inventan correo, GitHub o LinkedIn.
