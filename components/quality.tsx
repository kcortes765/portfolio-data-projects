"use client";
import { sourceStatusSchema } from "@/lib/source-status";
import { useState } from "react";
import {
  CheckCircle2,
  TriangleAlert,
  ExternalLink,
  RefreshCw,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { dataset, format, monthLabel } from "@/lib/gridops";
export function Quality() {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const base = `/data/${dataset.snapshot.slice(0, 12)}`;
  async function check() {
    setChecking(true);
    setMessage("Comprobando el catálogo oficial…");
    try {
      const res = await fetch("/api/source-status");
      if (!res.ok) throw new Error("No fue posible conectar.");
      const data = sourceStatusSchema.parse(await res.json());
      setMessage(
        data.changed
          ? "El catálogo registra una revisión distinta. La demo conserva su captura validada; se debe ejecutar de nuevo el pipeline."
          : `Metadatos sin cambios respecto a la captura. Comprobado: ${new Date(data.checked_at).toLocaleString("es-CL")}.`,
      );
    } catch {
      setMessage(
        "No fue posible comprobar el catálogo ahora. Puedes seguir explorando la captura validada y abrir la fuente oficial.",
      );
    } finally {
      setChecking(false);
    }
  }
  return (
    <section id="quality" className="quality-area">
      <div className="data-card">
        <div className="card-heading">
          <div>
            <h2>Calidad y trazabilidad</h2>
            <p>Controles ejecutados sobre el conjunto completo</p>
          </div>
          <span className="warning-badge">Con observaciones</span>
        </div>
        <div className="checks-grid">
          {dataset.checks.map((c) => (
            <article key={c.name}>
              {c.status === "pass" ? (
                <CheckCircle2 size={20} className="check-pass" />
              ) : (
                <TriangleAlert size={20} className="check-warning" />
              )}
              <div>
                <h3>
                  {c.name}{" "}
                  <span>{c.status === "pass" ? "Verificado" : "Revisar"}</span>
                </h3>
                <p>{c.detail}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="quality-caveat">
          <strong>Qué significan las observaciones</strong>
          <p>
            Las {format(dataset.quality.source_rows)} filas se conservan. Las
            repeticiones de la clave aparente pueden corresponder a desgloses
            por unidad que no se identifican en el CSV; eliminarlas podría
            cambiar la energía reportada. Los controles verifican la
            transformación, no certifican la exactitud del proveedor.
          </p>
          <p>
            El registro negativo es −3,16 MWh, central María Elena, marzo de
            2016. SIC y SING son las etiquetas de origen del archivo incluso
            después de la interconexión; no son una división operativa actual.
          </p>
          <p>
            <strong>ERNC no equivale a toda la energía renovable.</strong> La
            clasificación del archivo no incluye la gran hidráulica dentro de
            ERNC. Una fila ausente no se transforma en cero.
          </p>
        </div>
      </div>
      <div className="data-card">
        <div className="card-heading">
          <div>
            <h2>Fuente y descargas</h2>
            <p>
              Comisión Nacional de Energía · origen: Coordinador Eléctrico
              Nacional
            </p>
          </div>
          <Button variant="outline" disabled={checking} onClick={check}>
            <RefreshCw size={15} className={checking ? "spin" : ""} />
            {checking ? "Comprobando…" : "Comprobar fuente"}
          </Button>
        </div>
        <dl className="provenance-grid">
          <div>
            <dt>Cobertura de la serie</dt>
            <dd>
              {monthLabel(dataset.quality.first_period)} —{" "}
              {monthLabel(dataset.quality.last_period)}
            </dd>
          </div>
          <div>
            <dt>Revisión indicada en el CSV</dt>
            <dd>{dataset.source.source_updated}</dd>
          </div>
          <div>
            <dt>Archivo publicado en catálogo</dt>
            <dd>{dataset.source.resource_modified.slice(0, 10)}</dd>
          </div>
          <div>
            <dt>Descarga de esta captura</dt>
            <dd>{dataset.source.retrieved_at.slice(0, 10)}</dd>
          </div>
          <div>
            <dt>Licencia del catálogo</dt>
            <dd>
              <a
                href={dataset.source.license_url}
                target="_blank"
                rel="noreferrer"
              >
                {dataset.source.license}
              </a>
            </dd>
          </div>
          <div>
            <dt>SHA-256 del CSV original</dt>
            <dd className="hash">{dataset.snapshot}</dd>
          </div>
        </dl>
        <p className="connection-status" role="status" aria-live="polite">
          {message ||
            "La comprobación consulta el catálogo. No modifica ni sustituye los datos publicados de esta captura."}
        </p>
        <div className="download-links">
          <a href={dataset.source.download} target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> CSV oficial original
          </a>
          <a href={`${base}/observations.parquet`} download>
            <Download size={16} /> Observaciones · Parquet
          </a>
          <a href={`${base}/monthly.parquet`} download>
            <Download size={16} /> Modelo mensual · Parquet
          </a>
          <a href="/api/generation" target="_blank" rel="noreferrer">
            <ExternalLink size={16} /> API de esta captura
          </a>
        </div>
      </div>
    </section>
  );
}
