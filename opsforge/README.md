# OpsForge — operaciones de datos verificables

Proyecto personal de Sebastián Cortés, estudiante de último año de Ingeniería Civil UCN. Conciliación de pedidos, facturas y entregas; fuentes **sintéticas**, semilla 20260912. No es experiencia laboral ni una integración con un cliente real.

El ZIP incluye el sitio completo: esta guía parte desde su carpeta `gridops/`. La web usa D1/SQLite; el pipeline de referencia ejecuta Python, PostgreSQL y dbt. No necesita una API de IA ni una GPU.

## Reproducción rápida, sin servicios

Python 3.12 o superior, biblioteca estándar:

```sh
python -m opsforge.test_pipeline
python -m opsforge.pipeline --fixture base
python -m opsforge.pipeline --fixture base
python -m opsforge.pipeline --fixture late --fail
python -m opsforge.pipeline --fixture late
```

El reporte queda en `var/opsforge-report.json`, la base en `var/opsforge.sqlite` y los originales inmutables en `var/raw/<sha256>.csv`. Carga inicial: 68 versiones aceptadas, cuatro duplicados omitidos, dos rechazos, 24 pedidos, 14 conciliados. Repetición: cero aceptados. Fallo: rollback. Llegadas: 13 versiones nuevas, 25 pedidos conciliados, 81 versiones conservadas. Repetir estos comandos sobre la misma base no reinicia el estado: usa otra ruta `--dsn` y otro `--scope` para empezar limpio.

```sh
python -m opsforge.pipeline --fixture conflict
python -m opsforge.pipeline --fixture schema
python -m opsforge.pipeline --input public/opsforge/fixtures/base-37cc7b41f3db.csv
```

`--input` acepta un CSV local con contrato idéntico, máximo 2 MiB. `--url` acepta únicamente un servidor HTTP de prueba en localhost o 127.0.0.1, sin redirecciones; no es un conector comercial ni debe usarse como proxy. Un archivo de esquema inválido queda bloqueado; las filas inválidas de un archivo compatible se ponen en cuarentena.

## PostgreSQL + dbt

Versiones ejecutadas: PostgreSQL 18.6, dbt-core 1.12.4, dbt-postgres 1.11.0 y psycopg 3.3.5. Instala dependencias en un entorno virtual:

```sh
python -m venv .venv
# Activa .venv según tu sistema operativo.
python -m pip install -r opsforge/requirements.txt
```

Arranca tu instancia PostgreSQL local, crea un usuario/base exclusivos y configura `OPSFORGE_DSN` como una URI PostgreSQL. El pipeline crea el esquema `opsforge`; dbt publica `opsforge_analytics`. El usuario requiere permisos para crear estos esquemas y sus tablas. No uses credenciales de producción.

`opsforge/dbt/profiles.yml` lee `OPSFORGE_PGHOST`, `OPSFORGE_PGPORT`, `OPSFORGE_PGUSER`, `OPSFORGE_PGPASSWORD`, `OPSFORGE_PGDATABASE`. Sus defaults apuntan a la instancia local aislada de prueba, puerto 55432. Configura el mismo destino en `OPSFORGE_DSN`.

```sh
python -m opsforge.pipeline --fixture base
dbt build --project-dir opsforge/dbt --profiles-dir opsforge/dbt
python -m opsforge.pipeline --fixture late
dbt build --project-dir opsforge/dbt --profiles-dir opsforge/dbt
```

Para las pruebas contra PostgreSQL, define también `OPSFORGE_TEST_DSN` y ejecuta `python -m opsforge.test_pipeline`. Cada test crea y elimina únicamente su espacio temporal. `python -m opsforge.verify_models` compara el SQL portable con el mart dbt del scope `reference` y con SQLite después de base+late; necesita `OPSFORGE_DSN` y la carga/modelos finales ya ejecutados.

`stg_documents` es incremental `delete+insert` con clave compuesta. Lee todo el origen de este caso acotado para capturar versiones tardías; no declara un procesamiento incremental optimizado para grandes volúmenes. Los tests de unicidad son explícitos: configurar `unique_key` no prueba la unicidad.

### Docker y CI

`opsforge/compose.yaml` define PostgreSQL y el pipeline. Define `OPSFORGE_PGPASSWORD` antes de ejecutar:

```sh
docker compose -f opsforge/compose.yaml up -d postgres
docker compose -f opsforge/compose.yaml run --rm pipeline
```

El puerto queda vinculado a 127.0.0.1. El pipeline usa el hostname interno `postgres`. El workflow `.github/workflows/opsforge.yml` ejecuta tests y dbt con un servicio PostgreSQL efímero. **Docker y GitHub Actions están configurados, no ejecutados en la validación de esta entrega.** PostgreSQL y dbt sí se ejecutaron directamente en Windows. No mantengas el servidor local temporal abierto si no lo necesitas.

## Sitio y API

Sigue la instalación Node de `README.md` del repositorio. `npm ci`, `npm run dev -- --port 4175`. El binding D1 se declara en `.openai/hosting.json`; el esquema es `db/schema.ts` y la migración inicial está en `drizzle/0000_outstanding_franklin_richards.sql`. En Sites la migración se incluye en el paquete del despliegue. En desarrollo, después de un build que produzca `dist/server/wrangler.json`, aplica **una vez** la migración al almacenamiento local:

```sh
node --import ./scripts/sites-env.mjs node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_outstanding_franklin_richards.sql
```

No reapliques ni reescribas migraciones publicadas. Una evolución del esquema requiere otra migración.

| Endpoint | Uso |
|---|---|
| GET `/api/opsforge` | Estado del espacio de la cookie; sin cookie devuelve `workspace:false` |
| POST `/api/opsforge` | JSON `{ "scenario": "base" }`, alternativas `late`, `failure`, `conflict`, `schema` |
| GET `/api/opsforge/export` | CSV completo del espacio; requiere su cookie |
| GET `/opsforge/fixtures/manifest.json` | Fuentes públicas y hashes |

POST requiere `Origin` igual al sitio, `application/json` y hasta 1024 bytes. El servidor acepta solo los escenarios fijos, no nombres de tabla, SQL, URLs ni archivos del visitante. La cookie aleatoria es HttpOnly, SameSite=Strict y Secure en HTTPS; el servidor guarda su SHA256. No se registran ni se devuelven tokens en los reportes de prueba. Consulta parametrizada, scope en cada acceso y CAS por revisión para publicación concurrente.

```sh
python -m opsforge.verify_api http://localhost:4175 --output var/api-checks.json
python -m opsforge.pipeline --url http://localhost:4175/opsforge/fixtures/base-37cc7b41f3db.csv --dsn var/rest.sqlite
```

El verificador hace escrituras sintéticas y usa dos espacios de prueba. Para un sitio público, ejecútalo únicamente sobre tu propia instancia autorizada.

## Contrato y diccionario

| Campo | Significado / regla |
|---|---|
| scope | Espacio; aislamiento y grano de todas las tablas |
| kind | `order`, `invoice`, `delivery` |
| entity_id | Identidad del documento; un pedido PED-0001 tiene identidad O-0001 |
| order_id | PED seguido de cuatro dígitos; relación operativa |
| version | Entero 1–99999; gana la versión numérica superior, no el orden de llegada |
| amount_minor | Entero no negativo de hasta 12 dígitos, pesos CLP o centavos USD; entregas tienen 0 |
| currency | CLP o USD, sin conversión; se compara la moneda de cada factura con el pedido |
| quantity / unit | Entero positivo hasta 999999, `ea` o `kg`; se compara cada entrega con el pedido |
| event_date | Fecha ISO válida del documento; no es la fecha de ingestión |
| body_hash | SHA256 de los campos originales canonizados en orden del contrato |
| source_file / source_row | Nombre del CSV y fila física para estos fixtures sin celdas multilínea; el parser CLI cuenta registros CSV |
| batch_hash | SHA256 de bytes del CSV original |
| revision | Publicación del espacio; puede aumentar aunque la repetición agregue cero hechos |
| duration_ms | Web: preparación hasta construir la inserción de corrida; excluye ejecución completa y red. CLI: hasta registro de corrida, antes del commit |

El mart tiene un registro por `(scope, order_id)`. Suma documentos vigentes por separado, luego compara. `amount_delta = invoiced_minor - ordered_minor`; `quantity_delta = delivered_qty - ordered_qty`. El indicador de diferencias suma valores absolutos por moneda y omite comparaciones con moneda incompatible. Nunca suma CLP con USD.

Estados, en orden de prioridad: moneda incompatible, unidad incompatible, falta factura, falta entrega, importe distinto, cantidad distinta, conciliado. Puede haber más de una causa; el estado principal sigue esa prioridad y el detalle muestra ambas diferencias. Los documentos sin pedido conservan evidencia y se muestran como pendientes; no son pedidos inventados en el mart.

## Recuperación y operación

1. Revisa el estado y la corrida; una interrupción no cambia los hechos publicados.
2. Repite el archivo idéntico o aplica las llegadas. La identidad evita duplicados.
3. Conflicto con la misma versión: corrige el origen emitiendo una versión superior; no sobrescribas raw ni historial.
4. Esquema incompatible: corrige el contrato/archivo antes de reintentar. No agregues columnas a escondidas.
5. Un 409 concurrente exige refrescar y reintentar; 503 indica almacenamiento no disponible. No hay reintentos infinitos.

Web: 24 h desde creación, hasta 40 corridas por espacio, hasta 1.000 espacios activos. Los vencidos se eliminan al crear otro espacio. Un visitante que borra la cookie pierde el acceso; no hay datos privados, cuentas, recuperación por email ni SLA. Retención corta y límites acotan la exposición de una demo pública; no reemplazan autenticación empresarial o controles antiabuso de una producción comercial.

## Evidencia y lectura técnica

`docs/opsforge/validation/` contiene reportes sanitizados de pruebas ejecutadas. `opsforge/expected.json` especifica los casos esperados independientemente del SQL. `opsforge/generate.py` regenera fixtures y la constante SQL de TypeScript. No edites `lib/opsforge/sql.ts` a mano.

Recorrido de presentación: cargar → PED-0005 → repetir → interrumpir → corregir → linaje → exportar. Explica grano, dinero entero, diferencias entre idempotencia y auditoría, llegada tardía, aislamiento y rollback. La RTX 5090 no aporta a esta carga; la corrección determinista importa más que añadir ML sin problema que resolver.

Desarrollo asistido por IA; tests y comparación de resultados como verificación. No se presentan revisiones de modelos, métricas de rendimiento o validaciones humanas que no ocurrieron. Para producción comercial faltan integración ERP, permisos por usuario, backup/restore probado, alertas, observabilidad y ensayos de carga con un SLO real.

Referencias de decisiones: [D1 batch y transacciones](https://developers.cloudflare.com/d1/worker-api/d1-database/), [dbt unique_key y límites](https://docs.getdbt.com/reference/resource-configs/unique_key), [PostgreSQL Windows](https://www.postgresql.org/download/windows/).
