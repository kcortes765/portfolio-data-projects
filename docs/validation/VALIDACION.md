# Validación ejecutada · 2026-09-12

## Datos y software

- Pipeline sobre 91.538 filas originales: 2.539 grupos mensuales; conciliación completa. Véase `pipeline-run.json` para tiempo observado, versión y hashes. El tiempo medido cubre transformación local, no descarga ni un benchmark entre motores.
- 11 pruebas Python aprobadas: contrato, esquema, nulos/filas truncadas, fechas/categorías, meses ausentes, decimales inválidos, negativos/duplicados preservados, host permitido, SQL con expectativa independiente, reconstrucción idéntica y conservación de la última publicación cuando el hash falla.
- TypeScript `tsc --noEmit`: aprobado. ESLint del código de aplicación: aprobado. Los componentes vendorizados conservan sus reglas originales.
- `scripts/test-metrics.mjs`: aprobado; suma independiente conocida, conversión MWh/GWh, clasificación ERNC, fechas inválidas, CSV escapado y protección de fórmulas con negativos numéricos preservados.
- API JSON y CSV contrastados contra una suma Decimal independiente de 765 filas solares de SING en 2025: **7.961.754,9109883368 MWh**. Tres consultas inválidas devolvieron 400; selección solar/Convencional devolvió cero filas. Comprobación real de CKAN devolvió metadata sin cambios. Véase `http-checks.json`.

## Navegador

Recorridos comprobados en la aplicación local: portada → GridOps → caso técnico; filtros solares/SING/2025; comparación interanual; persistencia de filtros al recargar; reinicio; búsqueda sin coincidencias; búsqueda Solar con 24 resultados y segunda página 21–24; selección sin datos; período invertido con mensaje y descarga deshabilitada; comprobación del catálogo con respuesta real.

WebMCP se descubrió en el navegador, no solo en el código: `set_gridops_filters` y `get_gridops_summary` devolvieron las mismas 12 filas solares y suma de la API. `start: 2099-01` se rechazó y el resumen posterior conservó la selección válida.

Se revisaron capturas de portada, explorador, tabla móvil y caso técnico. A viewport 390 × 844, el ancho del documento fue 375 px (scrollbar aparte), sin desbordamiento global; gráfico 339 × 240 px. Tabla y navegación desplazan dentro de su contenedor. Se restauró el viewport original.

Durante el desarrollo se corrigieron: tipos desconocidos al leer JSON, actualización de ref durante render, importación desde `public`, dimensiones iniciales del gráfico y conflicto del watcher de Windows con Parquet temporal. La actualización en caliente produjo avisos transitorios de React/Vite al cambiar hooks o dependencias; se recargó antes de continuar. No se interpretan esos avisos históricos como una prueba fallida del build final.

## Límites de la verificación

No es una certificación WCAG ni una prueba con lectores de pantalla/usuarios reales. Los controles tienen nombres accesibles y alternativa tabular; no se afirma auditoría exhaustiva de accesibilidad. Tampoco se ejecutaron Docker, Actions remoto, pruebas de carga ni una auditoría externa de seguridad. No se midió contratación ni retorno comercial.

La construcción y publicación se verifican como último paso, sobre el código definitivo; los resultados operativos del hosting se entregan fuera del ZIP para evitar un artefacto autorreferente. Una receta de CI o un contenedor configurado no cuentan como ejecuciones observadas.

## Revisión de cierre

Se corrigió el reinicio para limpiar búsqueda/página y comparación, incluso cuando los filtros superiores ya estaban en su valor inicial. La navegación por teclado comprobó el salto al contenido y el uso de controles. El historial conserva su estado al reflejar filtros. El resumen WebMCP rechaza estados de período inválidos. Se retiraron metadatos de previsualización y ejemplos/logos sin uso.

La variación interanual ahora exige todos los meses de ambas selecciones. Prueba real: Concentración Solar de Potencia en 2022 tiene 10 meses con datos y muestra un porcentaje vacío con explicación; no compara un año parcial como completo. Tests independientes cubren faltantes actuales, previos y base cero.

Los 11 tests Python volvieron a pasar en carpetas temporales con espacios y apóstrofes. Se escapó la ruta SQL de exportación para admitir esos nombres de usuario/directorio. El comando de verificación de release contrasta API y CSV con agregación independiente de cinco selecciones, comprueba las tres páginas y verifica archivos/manifest descargados. Los resultados efectivos de cada publicación se conservan fuera del ZIP.

La primera revisión pública detectó un error de navegación del Link RSC de Vinext que no se reproducía en desarrollo. Se reemplazó por enlaces HTML nativos entre las tres páginas; el cierre exige comprobar clics reales sobre la nueva publicación. La API y descargas públicas pasaron las 12 verificaciones con curl, sin cookies ni credenciales. Cloudflare rechaza con 1010 el cliente urllib predeterminado; el verificador conserva sus mismas aserciones usando un adaptador curl externo, registrado con el acta de cierre.

El navegador integrado confirmó la descarga del ZIP por HTTP, pero no generó un evento de descarga para el CSV Blob. Los botones CSV se conectaron al endpoint del mismo origen que responde como archivo adjunto; el botón corregido produjo el evento de descarga en desarrollo y se exige repetirlo en producción. Se añadió un enlace al portfolio en el pie del explorador para mantener esa salida visible en móvil.
