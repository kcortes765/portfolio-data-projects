# Revisar los proyectos en cinco minutos

Proyectos personales de Sebastián Cortés. No representan clientes, empleo previo ni una plataforma productiva empresarial.

## 1. Probar las aplicaciones

- OpsForge: abrir `/opsforge`, cargar el lote inicial y revisar PED-0005. Volver a cargar el mismo lote: no debe duplicar registros. Probar fallo y recuperación; después, aplicar las correcciones. Los datos son sintéticos y cada visitante tiene su propio espacio.
- GridOps: abrir `/gridops`, comparar tecnologías y descargar el CSV de una selección. Verificar el período de cobertura antes de interpretar un cambio interanual. La captura es histórica, hasta febrero de 2026.

## 2. Revisar decisiones que importan

| Proyecto | Pregunta | Dónde mirar |
|---|---|---|
| OpsForge | ¿Qué pasa si un pedido tiene dos facturas? | `opsforge/reconciliation.sql`: agrega cada entidad antes del join para evitar multiplicar importes. |
| OpsForge | ¿Qué pasa si la carga falla a mitad? | `opsforge/pipeline.py`, `opsforge/test_pipeline.py`: transacción, rollback y recuperación. |
| OpsForge | ¿Cómo se distingue una corrección de una repetición? | Versiones, hash de contenido, cuarentena y test de idempotencia. |
| GridOps | ¿Se conserva el mismo total en cada transformación? | `pipeline/build.py`, `pipeline/test_pipeline.py`: Decimal, esquema, cobertura y reconciliación. |
| GridOps | ¿Un archivo corrupto reemplaza la publicación válida? | Test de hash corrupto: el pipeline debe rechazarlo antes de publicar. No implica atomicidad universal de una release ante fallo de disco. |

## 3. Ejecutar la suite pequeña

Desde la carpeta del código, con Python 3.11 o superior y un entorno virtual propio:

```sh
python -m pip install -r pipeline/requirements.txt
python scripts/review-projects.py
```

Son 22 pruebas aisladas: GridOps usa archivos temporales y OpsForge, SQLite en memoria. No se conecta a PostgreSQL ni necesita una clave de IA. Si existe `OPSFORGE_TEST_DSN`, el comando se detiene para no usar un servicio externo por accidente.

La comprobación del 18 de octubre de 2026 obtuvo 22/22 resultados correctos. Los recibos PostgreSQL/dbt de septiembre están fechados en `docs/opsforge/validation/`; no son una nueva ejecución de esos servicios.

## 4. Conocer los límites

El backend de las aplicaciones web está en TypeScript/Workers; Python se usa en los pipelines. No se presenta como experiencia con FastAPI o Django. Docker y CI tienen configuración, pero no se afirma ejecución de un entorno que no se verificó. El dataset es pequeño y acotado: no se extrapola su rendimiento a millones de eventos.

Contacto: sebastian.cortes.ing@gmail.com. Portafolio: https://sebastian-cortes-gridops.sebastian-cortes-ing.chatgpt.site/
