# Validación de OpsForge

12 de septiembre de 2026, hora de Chile. Resultados de ejecución, no estimaciones.

| Área | Resultado local |
|---|---|
| Pipeline SQLite | 11 pruebas aprobadas |
| Pipeline PostgreSQL 18.6 | Las mismas 11 pruebas aprobadas |
| dbt-core 1.12.4 / dbt-postgres 1.11.0 | 3 modelos y 9 tests, carga inicial e incremental aprobadas |
| Paridad de motores | 25 pedidos × 15 campos, SQLite = PostgreSQL = mart dbt |
| API real | 34 comprobaciones; dos visitantes, recuperación, hashes, exportación, concurrencia |
| Límites y vencimiento | 40 corridas permitidas, siguiente devuelve 429; token vencido pierde acceso y requiere nuevo espacio |
| Conector REST de prueba | Descarga localhost, 68 aceptados, 4 duplicados, 2 rechazos; raw SHA256 conservado |
| Reproducción de fixtures | Dos regeneraciones conservan los hashes |
| GridOps | 11 pruebas Python y comprobaciones de métricas TypeScript aprobadas |
| Tipos y lint de aplicación | Sin errores tras corregir carga inicial cancelable y conservar navegación nativa |
| Build | Producción compilada; advertencia de tamaño de chunk compartido, sin fallo |

Los JSON en `validation/` guardan evidencia compacta sin cookies ni credenciales. La corrida dbt incremental terminó con 12 tareas exitosas: tres modelos y nueve tests. Los tiempos dbt son observaciones de esta máquina para este caso pequeño, no benchmarks generalizables.

La verificación de UI recorrió carga, interrupción, recuperación, búsqueda PED-0005, factura v1 reemplazada/v2 vigente, contenido original, filtros vacíos, restablecimiento por teclado, corridas, cuarentena, fuentes, caso técnico y navegación a portada. Se inspeccionó escritorio y viewport móvil de 390 × 844. La tabla y pestañas tienen desplazamiento propio en móvil; la página OpsForge no desborda horizontalmente. El viewport de prueba se restableció.

Se detectaron y corrigieron: serialización de enteros Decimal de PostgreSQL; identidad de pedido inconsistente que podía multiplicar el grano; límite de lectura del cuerpo HTTP antes de acumularlo; reconocimiento del fallo controlado separado de conflictos concurrentes; cancelación de la carga inicial al desmontar; comparación de cabeceras HTTP sin depender de mayúsculas. Los ensayos fallidos no se cuentan como éxitos.

**Límites:** datos sintéticos acotados, sin ERP real, sin SLA, sin prueba de carga a gran escala. Docker y GitHub Actions están configurados pero no ejecutados en esta entrega. La instancia PostgreSQL fue temporal y vinculada solo a loopback; no es el motor de la aplicación alojada. Los resultados publicados se verifican con `opsforge/verify_api.py` después del despliegue y se registran en el acta de entrega externa al paquete para conservar la trazabilidad de la versión publicada.

La primera publicación de OpsForge (versión 5 del sitio) pasó 35 comprobaciones HTTP anónimas, incluyendo cookie Secure y concurrencia con respuestas 200/409 sin duplicar hechos. Se corrigió únicamente el cliente de pruebas para conservar la cookie de OpsForge cuando el proveedor también emite cookies propias. La verificación se repite sobre la entrega final.
