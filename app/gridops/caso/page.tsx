import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  Database,
  GitBranch,
  ShieldCheck,
} from "lucide-react";
import { dataset, format, monthLabel } from "@/lib/gridops";
import { Button } from "@/components/ui/button";
export default function Case() {
  return (
    <div className="case-page">
      <header className="portfolio-nav">
        <a className="identity" href="/">
          <span className="monogram">
            SC<span>·</span>
          </span>
          <span>Sebastián Cortés</span>
        </a>
        <Button asChild className="primary-button">
          <a href="/gridops">
            Explorar GridOps <ArrowUpRight size={16} />
          </a>
        </Button>
      </header>
      <main className="case-content">
        <a className="text-link" href="/">
          <ArrowLeft size={16} /> Portfolio
        </a>
        <p className="eyebrow">CASO DE INGENIERÍA · PROYECTO PERSONAL</p>
        <h1>
          GridOps.
          <br />
          Una cadena de datos que se puede auditar.
        </h1>
        <p className="case-lead">
          De un CSV oficial a un explorador de generación eléctrica. El trabajo
          central es conservar el significado de los datos, hacer explícitas sus
          limitaciones y permitir que otra persona reproduzca el resultado.
        </p>
        <div className="case-stack">
          Python · SQL / DuckDB · Parquet · TypeScript · React · Cloudflare
          Workers
        </div>
        <section>
          <h2>El problema</h2>
          <p>
            Un gráfico público permite mirar una serie, pero no siempre permite
            seguir sus transformaciones. GridOps permite explorar períodos y
            tecnologías, consultar los valores, descargar resultados filtrados y
            revisar la evidencia del origen.
          </p>
          <p>
            El dataset de la CNE contiene {format(dataset.quality.source_rows)}{" "}
            registros, {dataset.quality.periods} meses y{" "}
            {dataset.technologies.length} tecnologías. Su cobertura termina en
            {monthLabel(dataset.quality.last_period)}: la aplicación comunica
            ese corte y no lo presenta como una medición en vivo.
          </p>
        </section>
        <section>
          <h2>Arquitectura implementada</h2>
          <div className="architecture-flow">
            {[
              [Database, "01", "Origen", "CSV oficial + metadatos CKAN"],
              [ShieldCheck, "02", "Captura", "Archivo inmutable + SHA-256"],
              [
                GitBranch,
                "03",
                "Transformación",
                "Python + modelos SQL en DuckDB",
              ],
              [
                Database,
                "04",
                "Productos de datos",
                "Parquet, CSV y JSON validados",
              ],
              [
                ArrowUpRight,
                "05",
                "Consulta",
                "Explorador React + API de lectura",
              ],
            ].map(([Icon, n, title, body]) => {
              const I = Icon as typeof Database;
              return (
                <div key={String(n)}>
                  <I size={20} />
                  <small>{String(n)}</small>
                  <h3>{String(title)}</h3>
                  <p>{String(body)}</p>
                </div>
              );
            })}
          </div>
          <p>
            La transformación se ejecuta antes de publicar. El navegador y la
            API comparten funciones de filtrado y métricas sobre la misma
            captura. La comprobación de la fuente consulta su catálogo sin
            modificar los datos ya validados.
          </p>
        </section>
        <section>
          <h2>Las decisiones que importan</h2>
          <div className="case-decisions">
            <article>
              <h3>Preservar antes de agregar</h3>
              <p>
                La clave central–mes–tecnología no es única. El modelo asigna un
                identificador a cada observación y agrega explícitamente. No
                elimina las {dataset.quality.duplicate_key_excess} repeticiones
                de la clave aparente sin evidencia de que sean duplicados.
              </p>
            </article>
            <article>
              <h3>Unidades y períodos comparables</h3>
              <p>
                El origen está en MWh. La interfaz convierte a GWh dividiendo
                por 1.000 y compara los mismos meses del año anterior. La
                clasificación ERNC se conserva según la fuente y no se equipara
                a todas las renovables.
              </p>
            </article>
            <article>
              <h3>SQL proporcionado al volumen</h3>
              <p>
                DuckDB permite ejecutar modelos y producir Parquet sin
                administrar un clúster. Esta carga no justifica Spark, Kafka ni
                GPU. La elección deja visibles las habilidades transferibles:
                contratos, SQL, automatización, pruebas y publicación.
              </p>
            </article>
            <article>
              <h3>Errores visibles</h3>
              <p>
                Los cambios de esquema, meses ausentes, valores no finitos o
                sumas que no concuerdan detienen el pipeline. Las observaciones
                publicadas se muestran en calidad; una fuente caída no se
                sustituye por datos inventados.
              </p>
            </article>
          </div>
        </section>
        <section>
          <h2>Validación reproducible</h2>
          <p>
            Los controles comparan la suma del CSV con la tabla de observaciones
            y el modelo mensual, comprueban el esquema y la cobertura, y
            verifican el hash de origen. Las pruebas de software añaden casos
            pequeños independientes: decimales, duplicados, anomalías y fallos
            de contrato.
          </p>
          <p>
            El desarrollo fue asistido por IA. La evidencia de funcionamiento
            son el código, las pruebas ejecutadas y las descargas
            inspeccionables. Este proyecto no implica experiencia laboral previa
            ni afiliación con los organismos que publican los datos.
          </p>
          <p>
            El 18 de octubre de 2026 se repitieron las once pruebas aisladas del
            pipeline, con once resultados correctos. Incluyen una fuente
            corrupta, deriva de esquema y la comparación exacta de sumas. La API
            web está implementada en TypeScript; Python prepara los datos.
          </p>
          <div className="download-links">
            <a href="/downloads/gridops-source.zip" download>
              <Download size={16} /> Código y documentación
            </a>
            <a href="/downloads/README.md" download>
              <Download size={16} /> Guía de reproducción
            </a>
            <a href="/downloads/REVISAR_EN_5_MINUTOS.md">
              Guía de revisión rápida <ArrowUpRight size={16} />
            </a>
            <a href="/gridops#quality">
              Revisar calidad y fuentes <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
        <section className="case-limitations">
          <h2>Alcance y límites</h2>
          <p>
            GridOps es un explorador histórico. No predice precios, no controla
            activos, no ofrece alertas operativas en tiempo real y no certifica
            la exactitud de la fuente. La actualización completa se realiza
            ejecutando el pipeline y publicando una nueva versión validada; no
            hay una tarea programada activa.
          </p>
          <p>
            La licencia de los datos se atribuye a la CNE. Las etiquetas
            históricas de subsistema y el grano ambiguo de algunas observaciones
            requieren cautela al realizar interpretaciones operativas.
          </p>
        </section>
        <Button asChild className="primary-button">
          <a href="/gridops">
            Abrir el explorador <ArrowUpRight size={17} />
          </a>
        </Button>
      </main>
      <footer className="portfolio-footer">
        <span>Sebastián Cortés · Ingeniería Civil UCN, último año</span>
        <span>Proyecto independiente · Chile</span>
      </footer>
    </div>
  );
}
