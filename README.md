# Proyectos de datos · Sebastián Cortés

Código público de **OpsForge** y **GridOps**, dos proyectos personales para una candidatura junior de datos. Tesis y CEIC se incluyen sólo como páginas de presentación, no como repositorios de investigación o código privado.

- [Portafolio y demos](https://sebastian-cortes-gridops.sebastian-cortes-ing.chatgpt.site/)
- [Revisión rápida](docs/REVISAR_EN_5_MINUTOS.md)
- [Pruebas automatizadas](https://github.com/kcortes765/portfolio-data-projects/actions/workflows/review.yml): 22 tests aislados Python. No acredita PostgreSQL/dbt ni las aplicaciones web.

```sh
python -m pip install -r pipeline/requirements.txt
python scripts/review-projects.py
```

Este repositorio es una copia pública del código compartible. No contiene credenciales, historial privado, datos de usuarios, entornos locales o identificadores de publicación. Las apps web usan TypeScript/Workers; los pipelines, Python/SQL. OpsForge trabaja con datos sintéticos; GridOps, con una captura histórica oficial atribuida en la documentación. No se presenta como experiencia laboral ni servicio empresarial.

---

# Sistemas de datos · Sebastián Cortés

Portafolio de Sebastián Cortés, estudiante de último año de Ingeniería Civil UCN, Antofagasta. Reúne tres aplicaciones publicadas y una tesis en desarrollo: operaciones, energía, cómputo científico y comunidad universitaria. Los proyectos personales y la investigación académica no se presentan como experiencia laboral previa.

La portada `/` prioriza OpsForge y GridOps para una candidatura Data Engineer Jr; tesis y CEIC complementan el recorrido. Diseño y contenido revisados el **18 de octubre de 2026**. Estudiante, con egreso previsto en julio de 2027. [Guía de revisión rápida](docs/REVISAR_EN_5_MINUTOS.md).

## OpsForge

Plataforma funcional de conciliación de operaciones, con datos sintéticos. Web persistente D1, pipeline Python/PostgreSQL/dbt, versiones, cuarentena, trazabilidad y recuperación transaccional. [Guía completa](opsforge/README.md), [plan y arquitectura](docs/opsforge/PLAN_PRD_ARQUITECTURA.md). Rutas `/opsforge` y `/opsforge/caso`. Las instrucciones siguientes documentan GridOps; OpsForge requiere aplicar su migración local para usar persistencia.

## GridOps

91.538 observaciones oficiales, 146 meses, 13 tecnologías y 2.539 grupos analíticos. Filtros de período/tecnología/SIC-SING/clasificación; comparación interanual con cobertura mensual completa; tabla con búsqueda, orden y paginación; CSV filtrado, Parquet, API y controles de calidad.

La captura descargada el **12 de septiembre de 2026** contiene datos hasta **febrero de 2026**. No es monitoreo en vivo. Una actualización completa requiere ejecutar el pipeline, construir y publicar una nueva versión.

## SPH-IncipientMotion · tesis

Presentación en `/tesis` de una investigación numérica del movimiento incipiente de bloques costeros bajo flujos tipo tsunami. Integra DualSPHysics, Project Chrono, generación de casos, orquestación, ETL Python/SQLite y código de Gaussian Processes y active learning.

La página distingue la infraestructura implementada de la validación científica todavía en curso. El diagrama es conceptual, no una salida del solver. No se presenta un laboratorio físico ni una validación experimental propia. La descripción corresponde al estado documental revisado el 14 de septiembre de 2026, no a un monitor en vivo.

Este paquete incluye la página de presentación, no el repositorio de investigación, sus conversaciones, ejecuciones ni datasets privados.

## Portal CEIC UCN

Cuarto proyecto, con presentación en `/ceic` y enlace al servicio externo [ceicucn.cl](https://ceicucn.cl/). Portal académico con calendario, mallas Plan O/Plan P, biblioteca y acceso institucional. Su arquitectura documentada incluye JavaScript, Node.js, Supabase y Google OAuth. Complementa los casos de datos con integración, autorización y mantenimiento de un producto web.

El paquete incluye su presentación en el portafolio, no el código ni el estado privado del portal. No se atribuyen cifras de adopción o impacto sin medición. El sitio y su endpoint público de salud respondieron HTTP 200 en la revisión del 14 de septiembre de 2026.

## Ejecutar

Node.js >=22.13, npm y Python >=3.11. Sin GPU, clave de OpenAI ni base de datos externa.

```sh
npm ci
npm run dev -- --port 4175
```

Si utilizas el ZIP descargado, ejecuta primero `python scripts/package-source.py`: reconstruye las descargas del caso técnico, que se excluyen del propio ZIP para evitar incluirlo dentro de sí mismo.

Abrir `http://localhost:4175`. Rutas: `/`, `/opsforge`, `/opsforge/caso`, `/gridops`, `/gridops/caso`, `/tesis` y `/ceic`. El entorno local utiliza la identidad de demostración del starter Sites. La configuración de acceso del hosting controla quién puede abrir una publicación; la entrega compartible para recruiters requiere acceso público.

Reproducir los datos, en Windows:

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r pipeline/requirements.txt
.venv/Scripts/python.exe pipeline/build.py
.venv/Scripts/python.exe -m unittest discover -s pipeline -v
```

En macOS/Linux usar `.venv/bin/python`. Alternativa: `uv pip install --python .venv/Scripts/python.exe -r pipeline/requirements.txt`. La captura incluida permite ejecutar sin red.

Con el entorno Python activado:

```sh
python pipeline/build.py --refresh
python pipeline/verify_live.py --base http://localhost:4175
npm run typecheck
npm run lint:app
npm run build
```

`--refresh` consulta CKAN, descarga el CSV y valida antes de actualizar la captura local. Detén el servidor durante actualizaciones grandes. No existe un scheduler activo.

## Datos y licencia

[Generación bruta · CNE en datos.gob.cl](https://datos.gob.cl/dataset/generacion-bruta). Recurso `389a1943-9c3d-4957-982a-58e3fb0c1bdb`. Licencia declarada: **Creative Commons Attribution**, sin versión explícita en el catálogo. Atribución: Comisión Nacional de Energía; origen indicado: Coordinador Eléctrico Nacional.

- Origen y API: MWh; SQL DECIMAL(30,10). Interfaz: GWh = MWh / 1.000.
- Observación: línea del CSV dentro de su captura. Modelo mensual: mes × tecnología × subsistema × clasificación.
- ERNC no equivale a todas las renovables. SIC/SING son etiquetas históricas del archivo, no dos redes operativas actuales.
- Se conservan 607 filas que exceden la unicidad de la clave aparente, una repetición idéntica y un registro de −3,16 MWh. No se rellenan filas ausentes con ceros.
- Original inmutable por SHA-256; productos agrupados por hash de origen y transformación identificada por revisión Git.

## API

`GET /api/generation?start=2025-01&end=2025-12&technology=Solar%20Fotovoltaica&subsystem=SING`

Parámetros: `start`, `end` (YYYY-MM dentro de cobertura), `technology`, `subsystem`, `classification`. `all` incluye todas las categorías. Por defecto, últimos 12 meses disponibles. `format=csv` descarga los mismos resultados. Fecha/categoría inválida: HTTP 400. Selección válida sin observaciones: HTTP 200 con `count: 0`.

JSON: `filters`, `source_sha256`, `cutoff`, `unit`, `count`, `total_mwh`, `ernc_mwh`, `data`. JavaScript usa doble precisión; la reconciliación autoritativa ocurre en Python/SQL con tolerancia absoluta 0,00001 MWh.

`GET /api/source-status`: devuelve `scope: metadata-only`, `changed` y `data_refreshed: false`. Compara la modificación del recurso del catálogo; no vuelve a descargar ni hashear el CSV. HTTP 502 si el catálogo falla.

WebMCP, cuando lo soporta el navegador: `get_gridops_summary` y `set_gridops_filters`. Solo leen o cambian filtros de la vista; la UI convencional funciona sin esta capacidad.

## Documentación

- [Investigación y decisiones](docs/INVESTIGACION.md)
- [Brief y plan](docs/PLAN.md)
- [PRD](docs/PRD.md)
- [Arquitectura y métricas](docs/ARQUITECTURA.md)
- [Encargo maestro mejorado](docs/PROMPT_MAESTRO.md)
- [Validación](docs/validation/VALIDACION.md)

El despliegue utiliza Vinext/Cloudflare Workers mediante Sites, con D1 para OpsForge y sin R2. GridOps no requiere una base de datos persistente en el hosting. `Dockerfile.pipeline` proporciona una receta de reproducción; no se afirma ejecución de Docker en el equipo. El workflow CI requiere un repositorio GitHub con Actions habilitado: se entrega configurado, no ejecutado remotamente.

## Demostración de cinco minutos

Filtrar solar/SING/2025 → explicar 7.961.754,9109883368 MWh desde 765 observaciones → descargar CSV → inspeccionar anomalías → mostrar SQL y rechazo por hash corrupto. Preparar respuestas sobre grano, unidades, idempotencia, valores ausentes y cuándo migrar a un warehouse/orquestador.

Desarrollo asistido por IA; la evidencia está en el sistema y sus pruebas. No se han medido ahorros de tokens, retorno comercial ni productividad personal. Código y dependencias se entregan para revisión/reproducción; la licencia de los datos es independiente de las licencias de software incluidas en las dependencias.

La verificación de una publicación puede repetirse con `python scripts/verify-release.py --report release-checks.json`. Compara cada grupo de cinco selecciones con el CSV original, revisa páginas y valida descargas/manifest. El informe no contiene credenciales.

