# Encargo maestro: GridOps y portfolio de Sebastián Cortés

## Resultado que debes entregar
Construye y deja desplegada una aplicación completa de datos de energía de Chile, GridOps, integrada en un portfolio profesional de Sebastián Cortés Hernández. El resultado debe poder abrirse, explorarse, verificarse y mostrarse a un recruiter. Entrega también código, datos redistribuibles, documentación de arquitectura, pruebas y comandos reproducibles. Un plan, una maqueta, una colección de metadatos o botones sin implementación no completan el encargo.

Este documento amplía el encargo del usuario; no sustituye las instrucciones de sistema, las autorizaciones efectivamente recibidas ni futuras correcciones. Ejecuta el plan sin pedir aprobación de elecciones técnicas rutinarias. Conserva el avance en archivos para continuar después de una interrupción o compactación. No reinicies investigaciones o componentes ya verificados.

## Contexto y posicionamiento
Sebastián vive en Antofagasta y cursa el último año de Ingeniería Civil en la UCN, con dos asignaturas pendientes. Busca su primera experiencia profesional en Data Engineering / Analytics Engineering, con Python, SQL, automatización y validación. No presentar proyectos personales como empleos, una carrera en progreso como título obtenido, ni proyectos propuestos como productos terminados. La tesis computacional es un diferenciador y podrá incorporarse después; este encargo publica GridOps como primer proyecto terminado.

## Investigación previa aplicada
1. Investiga fuentes oficiales de electricidad de Chile: CNE/Energía Abierta y Coordinador Eléctrico Nacional. Comprueba accesibilidad real, autenticación, licencia o condiciones de uso, granularidad, unidades, cobertura, actualización y estructura antes de elegir los datos. No asumas que una API documentada funciona sin credenciales.
2. Consulta documentación oficial de GPT-6 Astra y prácticas actuales de desarrollo y gestión del contexto. Distingue características documentadas de decisiones propias. No inventes benchmarks, precios, límites ni una preferencia del modelo por un framework concreto. No digas haber cambiado el modelo o esfuerzo si la herramienta no lo ha confirmado.
3. Compara tecnologías proporcionadas al volumen real y al objetivo de empleabilidad: Python, SQL, Parquet, DuckDB, validaciones, TypeScript/React, visualización accesible y hosting. Justifica simplificaciones; no agregues Kafka, Kubernetes, GPU o un LLM en producción solo para ampliar el stack.
4. Investiga UX/UI de exploradores analíticos y accesibilidad con fuentes primarias. Aplica jerarquía, unidades explícitas, filtros claros, estados vacíos y de error, navegación por teclado, contraste, tablas alternativas y diseño móvil.
5. Guarda las fuentes y decisiones en documentación técnica separada del flujo principal del producto. Las decisiones deben conducir a implementación, no prolongar indefinidamente la investigación.

## Producto funcional
El usuario de GridOps debe poder comprender la evolución de la generación eléctrica, comparar períodos o tecnologías, inspeccionar las cifras y descargar el resultado de su consulta. La pregunta exacta y la granularidad final dependen de los datos oficiales disponibles y verificables.

La aplicación debe incluir:
- Una vista útil desde el primer acceso, con controles y resultados reales.
- Filtros de período y categorías pertinentes al dataset, con valores por defecto coherentes y reinicio.
- Indicadores con unidades y denominadores definidos; comparación temporal solo entre períodos compatibles.
- Gráficos legibles y una tabla de los mismos datos, con exportación CSV que respete los filtros.
- Fuentes enlazadas, cobertura del dataset y fecha de extracción visibles. Diferenciar fecha de extracción, fecha del dato y fecha de publicación de la fuente.
- Un estado de calidad calculado por controles ejecutados, sin porcentajes decorativos ni promesas de exactitud absoluta.
- Una explicación técnica del caso: problema, arquitectura implementada, decisiones, limitaciones y evidencia de validación.
- Portfolio con identidad profesional correcta y acceso directo a GridOps. Publicar exclusivamente contactos y enlaces confirmados; omitir los que no estén disponibles.

## Ingeniería y datos
- Descarga real desde una fuente oficial accesible. Retén archivos originales sin modificaciones y manifiestos con URL, fecha y hash.
- Implementa transformación determinista, contratos de esquema, claves de grano explícitas, normalización de fechas/categorías y manejo deliberado de nulos.
- Usa SQL para los modelos analíticos y Parquet cuando corresponda. Evita duplicar lógica de métricas entre capas.
- Valida claves únicas, rangos y cobertura; verifica reconciliación de sumas entre origen normalizado y resultados. No conviertas potencia MW en energía MWh sin una metodología temporal válida. No cuentes SIC, SING y SEN como sistemas coexistentes sin interpretar su historia.
- La misma entrada debe producir los mismos datos analíticos. Guarda revisiones nuevas como nuevas capturas; no sobreescribas silenciosamente evidencia.
- Un fallo de descarga o un cambio de esquema debe ser identificable y no producir una publicación aparentemente correcta. Mantén la última versión validada cuando resulte aplicable.
- No inventes datos ante fuentes caídas. Si se usa una captura histórica verificada, informa claramente su corte temporal. No llames «en vivo» a una carga estática ni «actualización automática» a un script que aún no está programado en un servicio real.
- Incluye interfaz de consulta o descarga estructurada adecuada a la arquitectura, documentación del contrato, dependencias reproducibles y contenedor para el pipeline si aporta portabilidad.

## Uso de Astra y presupuesto de contexto
Usa Astra para decisiones, implementación y diagnóstico; usa scripts para descargas, conteos, hashes, transformaciones y comprobaciones. Mantén un contexto estable con brief, contratos, decisiones y estado; consulta solo los archivos y fragmentos pertinentes. Devuelve resúmenes de herramientas y fallos concretos, no volcados repetidos de datasets o documentación.

No añadas revisiones con varios modelos por defecto. La evidencia final es el comportamiento del programa, pruebas independientes y métricas reproducibles, no que varias IAs coincidan. Ajusta la profundidad de comprobación al riesgo: mucha atención a datos, unidades, cifras, seguridad y rutas principales; no repitas tests verdes sin cambios o dudas nuevas. No se necesita una clave de OpenAI ni inferencia de pago para que un explorador determinista funcione.

## Autonomía y límites
La investigación, implementación, instalaciones necesarias, verificación y despliegue del sitio están autorizados. La audiencia pública y los datos de contacto dependen de la respuesta del usuario; avanza con todo el trabajo independiente y conserva privacidad si no existe autorización para ampliarla. No compres servicios, registres dominios, modifiques DNS, publiques credenciales ni envíes mensajes a terceros sin autorización específica suficiente. No modifiques proyectos ajenos a este encargo.

## Plan de ejecución
1. Investigar y registrar decisiones; verificar al menos una fuente de datos utilizable.
2. Preparar el proyecto y escribir una primera experiencia coherente para previsualizar temprano.
3. Completar ingestión, modelos SQL, controles, exportaciones y manifiestos.
4. Integrar explorador, portfolio y explicación del caso con datos reales.
5. Comprobar cifras, errores, filtros, navegación, exportación, móvil y accesibilidad; corregir defectos materiales.
6. Construir, publicar, comprobar URL desplegada y entregar código/documentación descargables.

## Criterios de cierre
- Build satisfactorio y rutas esenciales utilizables.
- Dataset real trazable, transformaciones repetibles y controles ejecutados.
- Filtros, gráficos, tabla y CSV coherentes entre sí.
- Sin datos falsos, botones muertos, credenciales expuestas o afirmaciones profesionales inventadas.
- Pruebas apropiadas del pipeline y recorridos principales; revisión visual de escritorio y móvil.
- Prompt mejorado, plan, PRD, arquitectura, investigación, README y resultado de validación guardados.
- Sitio desplegado y comprobado; audiencia y limitaciones residuales comunicadas con exactitud.

Trabaja hasta completar estos resultados. Comunica avances breves sobre decisiones y evidencia. Si una integración externa falla, resuelve con una alternativa legítima que preserve el propósito del producto y documenta la limitación concreta.
