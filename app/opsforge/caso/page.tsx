import { ArrowLeft, ArrowUpRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function Case() {
  return (
    <div className="case-page opsforge-case">
      <header className="portfolio-nav">
        <a className="identity" href="/">
          <span className="monogram">
            SC<span>·</span>
          </span>
          <span>Sebastián Cortés</span>
        </a>
        <Button asChild className="primary-button">
          <a href="/opsforge">
            Explorar OpsForge <ArrowUpRight size={16} />
          </a>
        </Button>
      </header>
      <main className="case-content">
        <a className="text-link" href="/">
          <ArrowLeft size={16} /> Portfolio
        </a>
        <p className="eyebrow">CASO DE INGENIERÍA · PROYECTO PERSONAL</p>
        <h1>
          OpsForge.
          <br />
          Una operación que puedes reconstruir.
        </h1>
        <p className="case-lead">
          Un pedido tiene una factura incompleta. Una entrega llega tarde. Una
          corrección contradice la versión anterior. OpsForge conserva los
          documentos, explica las diferencias y publica una conciliación que se
          puede verificar.
        </p>
        <div className="case-stack">
          Python · PostgreSQL · dbt · SQL · TypeScript · React · D1
        </div>
        <section>
          <h2>El problema operativo</h2>
          <p>
            Un equipo de operaciones necesita distinguir un documento pendiente
            de un error de importe o cantidad. Sumar tablas sin controlar su
            grano puede multiplicar facturas y producir cifras aparentemente
            correctas. Reprocesar archivos tampoco debería duplicar la
            operación.
          </p>
          <p>
            Este caso usa documentos sintéticos y reproducibles. No contiene
            datos de clientes ni se presenta como experiencia laboral. El
            escenario está acotado a importes netos y cantidades enteras; no
            calcula impuestos, conversiones de moneda ni equivalencias entre
            unidades.
          </p>
        </section>
        <section>
          <h2>Un recorrido de tres minutos</h2>
          <ol>
            <li>
              <strong>Carga el lote inicial.</strong> Verás 24 pedidos: 14
              conciliados y 10 por resolver; dos filas quedan en cuarentena y
              una factura espera su pedido.
            </li>
            <li>
              <strong>Abre PED-0005.</strong> Compara importe pedido y
              facturado. Cada documento tiene archivo, fila, versión y hash de
              origen.
            </li>
            <li>
              <strong>Repite el lote.</strong> Se incorporan cero documentos
              nuevos. La corrida conserva evidencia del intento.
            </li>
            <li>
              <strong>Interrumpe una carga.</strong> Un fallo de restricción
              revierte la transacción real. La última publicación sigue
              disponible.
            </li>
            <li>
              <strong>Aplica llegadas y correcciones.</strong> Los 25 pedidos
              quedan conciliados y las 81 versiones se conservan. Recarga y
              exporta el CSV.
            </li>
          </ol>
          <p>
            También puedes probar un conflicto de versión o un esquema
            incompatible: los documentos publicados permanecen intactos.
          </p>
        </section>
        <section>
          <h2>Dos entornos, las mismas reglas</h2>
          <div className="of-architecture">
            <div>
              <small>APLICACIÓN PUBLICADA</small>
              <strong>CSV fijo → contrato → D1 → SQL → API → interfaz</strong>
              <p>
                Las operaciones se ejecutan en el servidor. Cada visitante
                recibe un espacio aislado que se conserva durante 24 horas.
              </p>
            </div>
            <div>
              <small>PIPELINE REPRODUCIBLE</small>
              <strong>
                CSV / REST local → Python → PostgreSQL → dbt → mart
              </strong>
              <p>
                Archivos originales por SHA256, carga transaccional, modelos de
                transformación y controles de calidad explícitos.
              </p>
            </div>
          </div>
          <p>
            La aplicación alojada usa SQLite mediante D1. PostgreSQL y dbt se
            ejecutaron en el pipeline de referencia; no se simula una conexión
            PostgreSQL dentro de la web. El SQL portable y el mart dbt se
            contrastan con los mismos resultados esperados.
          </p>
        </section>
        <section>
          <h2>Decisiones que importan</h2>
          <ul>
            <li>
              <strong>Identidad estable:</strong> espacio, tipo, documento y
              versión. Un duplicado idéntico se omite; un cambio con la misma
              versión se rechaza.
            </li>
            <li>
              <strong>Historia conservada:</strong> se selecciona la versión
              superior de cada documento antes de conciliar. Una llegada tardía
              sigue siendo procesable.
            </li>
            <li>
              <strong>Grano explícito:</strong> las facturas y entregas se
              agregan por separado antes de unirse a cada pedido. Dos facturas
              no multiplican las entregas.
            </li>
            <li>
              <strong>Dinero preciso:</strong> enteros en pesos CLP o centavos
              USD. Los totales se muestran separados; una moneda incompatible
              impide conciliar.
            </li>
            <li>
              <strong>Publicación atómica:</strong> hechos, cuarentena, revisión
              y corrida se confirman juntos. Una revisión optimista protege las
              operaciones concurrentes.
            </li>
            <li>
              <strong>Linaje verificable:</strong> cada fila aceptada conserva
              contenido original, hash, archivo y número de línea. Los rechazos
              siguen disponibles.
            </li>
          </ul>
        </section>
        <section>
          <h2>Qué se comprobó</h2>
          <p>
            El 18 de octubre de 2026 se repitieron las once pruebas del pipeline
            en SQLite, con once resultados correctos. La ejecución equivalente
            en PostgreSQL 18.6 está documentada el 13 de septiembre de 2026; no
            se repitió en esta revisión. Incluyen idempotencia, correcciones
            tardías, rollback, conflictos, aislamiento, moneda, unidad, fechas e
            identidades inválidas y un pedido con dos facturas.
          </p>
          <p>
            En la validación del 13 de septiembre de 2026, dbt completó tres
            modelos y nueve tests tanto en la carga inicial como en la
            incremental. La carga final preserva 81 versiones y produce 25
            pedidos conciliados. Son resultados del caso reproducible, no una
            medición de escala o rendimiento empresarial.
          </p>
          <p>
            El repositorio incluye un verificador HTTP para repetir el flujo
            sobre la aplicación: persistencia, aislamiento de visitantes,
            concurrencia, exportación, restricciones de origen y hashes de
            fuentes.
          </p>
          <p>
            El 18 de octubre de 2026 ese verificador completó 34 comprobaciones
            HTTP en el entorno local, incluyendo repetición de cargas,
            recuperación, aislamiento y solicitudes concurrentes. Es una prueba
            funcional con datos sintéticos, no una prueba de carga ni una
            garantía de disponibilidad empresarial.
          </p>
        </section>
        <section>
          <h2>Alcance y evolución</h2>
          <p>
            La web permite ejecutar cinco escenarios controlados; no acepta
            archivos privados ni integra un ERP real. Las sesiones anónimas no
            son cuentas empresariales. Se limita a 40 corridas por espacio y
            hasta 1.000 espacios simultáneos; la limpieza de espacios vencidos
            ocurre al crear uno nuevo.
          </p>
          <p>
            La ingestión dbt conserva un modelo incremental con clave compuesta
            y escanea el origen acotado completo para incorporar correcciones.
            Para mayor volumen se necesitarían una estrategia de captura de
            cambios medida, orquestación, retención, autenticación y
            observabilidad operativa. Docker y GitHub Actions están configurados
            en el código; su presencia no equivale a haberlos ejecutado.
          </p>
        </section>
        <section>
          <h2>Desarrollo asistido por IA</h2>
          <p>
            La IA ayudó a especificar, implementar y revisar el sistema. La
            evidencia está en los contratos, las pruebas ejecutadas, los casos
            de fallo y las comparaciones entre motores. No hay un LLM en la
            conciliación: el resultado es determinista y puede explicarse
            documento por documento.
          </p>
        </section>
        <section>
          <h2>Reproducir y revisar</h2>
          <p>
            El paquete contiene el portafolio completo, OpsForge y GridOps.
            Empieza en <code>opsforge/README.md</code>: instalación, comandos,
            diccionario, API, recuperación y límites. No requiere una clave de
            IA.
          </p>
          <div className="project-actions">
            <Button asChild className="primary-button">
              <a href="/downloads/opsforge-source.zip" download>
                <Download size={17} /> Descargar código fuente
              </a>
            </Button>
            <a className="text-link" href="/downloads/OPSFORGE.md">
              Guía de reproducción <ArrowUpRight size={16} />
            </a>
            <a className="text-link" href="/downloads/REVISAR_EN_5_MINUTOS.md">
              Guía de revisión rápida <ArrowUpRight size={16} />
            </a>
            <a className="text-link" href="/opsforge/fixtures/manifest.json">
              Manifest de fuentes <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
      </main>
      <footer className="portfolio-footer">
        <span>Sebastián Cortés · Ingeniería Civil UCN, último año</span>
        <a href="/opsforge">Abrir OpsForge →</a>
      </footer>
    </div>
  );
}
