# Investigación aplicada · 12 de septiembre de 2026

## Conclusión

La mejor elección para esta entrega es **Python + SQL/DuckDB + Parquet + TypeScript/React**, con un producto verificable y ligero. Esta es una decisión de ingeniería para los datos observados y el objetivo del candidato; no una afirmación de que exista un stack universalmente superior o preferido por Astra.

## Disponibilidad real de datos

Se revisaron CNE/Energía Abierta y datos.gob.cl. La ruta de [API de Energía Abierta](https://energiaabierta.cl/visualizaciones/en-mantencion/) estaba en mantenimiento; las descargas exploradas desde su sitio no proporcionaron una ruta pública directa utilizable. Se eligió el [catálogo oficial de generación bruta](https://datos.gob.cl/dataset/generacion-bruta) y se descargó el CSV mediante el [recurso CKAN](https://datos.gob.cl/api/3/action/package_show?id=generacion-bruta).

La evidencia conservada es el archivo, sus metadatos y su hash, no solamente una descripción de una API. Hallazgos del archivo: 6.731.181 bytes, 91.538 filas, 146 meses consecutivos entre 2014-01 y 2026-02, 13 tecnologías. Revisión interna 2026-03-16; recurso modificado 2026-04-01; consulta/descarga 2026-09-12. Esta diferencia impide llamarlo «datos actuales en vivo».

Las claves aparentes no son únicas, existe una repetición exacta y un negativo. Conservarlas permite reconciliar la energía publicada sin inventar reglas de limpieza. El significado de SIC/SING y ERNC exige documentación visible. Estos riesgos tienen más impacto que elegir un nuevo framework.

## Comparación tecnológica

| Alternativa | Evaluación aplicada | Decisión |
|---|---|---|
| DuckDB + SQL | Consulta columnar local y exportación de datos tipados; suficiente para 91k filas | Implementado, versión 1.4.4 fijada; no se afirma que sea la última versión |
| pandas/Polars | Útiles para transformaciones complejas en Python; duplicarían aquí el motor analítico | Python estándar inspecciona contratos, SQL transforma |
| Postgres | Excelente para estado transaccional/concurrencia; no hay escrituras de usuarios | No añadir servicio para este caso |
| dbt | Pruebas/modelos y documentación de dependencias útiles al crecer | Dos modelos SQL y controles directos en esta entrega; no se declara experiencia dbt implementada |
| Airflow/Dagster | Operación de múltiples trabajos y backfills | No hay scheduler operado; script explícito y CI preparado |
| Spark/Kafka | Distribución/streaming con costo operacional | Sin requisito que los justifique |
| React/TypeScript | Interacción, contratos y componentes reutilizables | Implementado con controles shadcn y Recharts |
| Vinext/Workers | Compatible con la ruta de hosting Sites | Implementado; beta fijada y build probado |
| GPU/LLM | Útiles para inferencia/modelos pesados, no necesarios para estas sumas | Sin dependencia en ejecución |

Documentación primaria consultada: [DuckDB y Parquet](https://duckdb.org/docs/current/data/parquet/overview), [optimizaciones lazy de Polars](https://docs.pola.rs/user-guide/lazy/optimizations/), [pruebas de datos en dbt](https://docs.getdbt.com/docs/build/data-tests). Las capacidades de esas herramientas no constituyen un benchmark comparativo ejecutado en GridOps.

El proyecto muestra habilidades transferibles: grano, SQL, ingestión, contratos, API, pruebas, formatos columnares y publicación. No se inventa un nuevo análisis del mercado laboral ni frecuencias de vacantes a partir de estas decisiones técnicas.

## Astra y uso eficiente de contexto

La [documentación oficial de GPT-6 Astra](https://developers.openai.com/api/docs/guides/latest-model) describe capacidades de programación, razonamiento y herramientas; documenta Responses para tool calling, compacción, caché y continuidad de razonamiento. También distingue configuraciones de esfuerzo de parámetros de muestreo no compatibles. Estas funciones de API no implican que todos sus controles estén expuestos en Codex. No se afirmó haber cambiado modelo/esfuerzo ni se estimaron ahorros sin medición.

Aplicación propia: mantener brief/contratos/decisiones estables; leer fragmentos necesarios; usar scripts para filas, hashes y agregaciones; llevar errores precisos a la IA; evitar volcar 91.538 filas al contexto. La prueba de calidad es independiente del costo del modelo. No existe evidencia oficial consultada de que Astra funcione mejor con un framework específico.

### Flujo de trabajo aplicado

1. Especificación concreta y criterios de cierre antes de ampliar componentes.
2. Transformaciones deterministas para volumen; IA para decisiones y diagnóstico.
3. Pruebas con valores esperados independientes y fallos deliberados.
4. Revisión de interfaz con datos reales; corregir un defecto material antes de repetir pruebas.
5. Contexto persistido en documentos; no depender de una conversación extensa para mantener el sistema.

No se necesitan varios agentes o modelos para cada revisión. La concurrencia añade costo de contexto y no sustituye una suma independiente o un test de corrupción. No se agregaron llamadas LLM en producción ni se requiere una clave API.

## UX/UI y accesibilidad

Las [guías de dashboards de GOV.UK](https://brand.design-system.service.gov.uk/data/dashboards/) y sus [guías de gráficos](https://brand.design-system.service.gov.uk/data/charts/) orientan una jerarquía de preguntas, controles y comparaciones comprensibles. Aquí se aplican unidades visibles, fuente/cobertura junto a la vista, pocos indicadores definidos y el mismo conjunto de datos detrás de gráficos y tabla.

La [guía W3C sobre imágenes complejas](https://www.w3.org/WAI/tutorials/images/complex/) respalda descripciones y alternativas de datos. GridOps usa etiquetas, leyenda, tabla inspeccionable, CSV y lectura por tecnologías. No se confía únicamente en color para comunicar estados: hay textos «Verificado»/«Revisar», iconos y notas. La comparación previa usa línea discontinua.

Se revisaron jerarquía de títulos, contraste visual, controles etiquetados, foco, navegación y ancho móvil. Las [comprobaciones preliminares W3C](https://www.w3.org/WAI/test-evaluate/preliminary/) son una referencia, no una certificación WCAG: no se realizó una auditoría exhaustiva con usuarios o lectores de pantalla.

### Decisiones visuales

Fondo claro, tipografía legible, azul para serie principal y verde para ERNC, márgenes amplios en portfolio y mayor densidad en explorador. Las superficies comunican procedencia, filtros y resultados; no contienen porcentajes decorativos de confianza ni estados «live» falsos. Navegación/tablas desplazan horizontalmente dentro de su contenedor en móvil.

## Límites de la investigación

No es una revisión sistemática académica de todas las herramientas disponibles. Es una investigación aplicada con fuentes primarias, verificación del origen y decisiones llevadas a código. No se midieron rendimiento entre motores, costos cloud bajo carga ni tasa de contratación. La fuente histórica y sus ambigüedades permanecen documentadas; ningún framework elimina esos límites.
