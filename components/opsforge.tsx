"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Layers,
  RefreshCw,
  Download,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileText,
  History,
  Database,
  ChevronRight,
  Search,
  ShieldCheck,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fixtures,
  scenarios,
  labels,
  money,
  type Event,
  type Reconciled,
  type Rejection,
  type Scenario,
  type summarize,
} from "@/lib/opsforge/core";
type Run = {
  id: string;
  scenario: string;
  status: string;
  started: number;
  duration_ms: number;
  accepted: number;
  duplicates: number;
  rejected: number;
  revision: number;
  message: string;
  batch_hash: string;
};
type State = {
  workspace: boolean;
  rows: Reconciled[];
  summary: ReturnType<typeof summarize>;
  runs: Run[];
  events: Event[];
  quarantine: Rejection[];
  orphans: {
    order_id: string;
    entity_id: string;
    source_file: string;
    source_row: number;
  }[];
  space: { revision: number; expires: number };
};
type Tab = "orders" | "runs" | "quality" | "sources";
const tabs = [
  ["orders", "Conciliación", Layers],
  ["runs", "Corridas", History],
  ["quality", "Cuarentena", AlertTriangle],
  ["sources", "Fuentes", Database],
] as const;
const docLabel = { order: "Pedido", invoice: "Factura", delivery: "Entrega" };
export default function OpsForge() {
  const [data, setData] = useState<State | null>(null),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [tab, setTab] = useState<Tab>("orders"),
    [scenario, setScenario] = useState<Scenario>("base"),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("all"),
    [currency, setCurrency] = useState("all"),
    [selected, setSelected] = useState<string | null>(null);
  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/opsforge", { cache: "no-store" });
      const result = (await r.json()) as State & { error?: string };
      if (!r.ok) throw Error(result.error);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos cargar los datos.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    async function loadInitial() {
      try {
        const response = await fetch("/api/opsforge", {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json()) as State & { error?: string };
        if (!response.ok) throw Error(result.error);
        if (!controller.signal.aborted) setData(result);
      } catch (error) {
        if (!controller.signal.aborted)
          setError(
            error instanceof Error
              ? error.message
              : "No pudimos cargar los datos.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadInitial();
    return () => controller.abort();
  }, []);
  async function run() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await fetch("/api/opsforge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      });
      const result = (await r.json()) as State & { error?: string };
      if (!r.ok) throw Error(result.error);
      setData(result);
      setNotice(result.runs[0]?.message ?? "Operación completada.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "La operación no terminó. Puedes actualizar y repetir el lote.",
      );
    } finally {
      setBusy(false);
    }
  }
  const ready = !!data?.workspace;
  const rows = useMemo(
    () =>
      (data?.rows ?? []).filter(
        (r) =>
          (currency === "all" || r.currency === currency) &&
          (status === "all" ||
            (status === "open"
              ? r.status !== "matched"
              : r.status === "matched")) &&
          r.order_id.toLowerCase().includes(search.toLowerCase()),
      ),
    [data, currency, status, search],
  );
  const order =
    rows.find((r) => r.order_id === selected) ??
    rows.find((r) => r.status !== "matched") ??
    rows[0];
  const lineage = (data?.events ?? []).filter(
    (e) => e.order_id === order?.order_id,
  );
  return (
    <div className="of-app">
      <a href="#of-main" className="skip">
        Saltar a conciliación
      </a>
      <header className="of-header">
        <a className="of-brand" href="/opsforge">
          <span className="of-logo">
            <Layers size={23} />
          </span>
          Ops<span>Forge</span>
          <small>CONCILIACIÓN DOCUMENTAL</small>
        </a>
        <div className="of-header-links">
          <span className="of-environment">
            <span />
            Demo interactiva
          </span>
          <a href="/opsforge/caso">
            Caso técnico <ArrowUpRight size={15} />
          </a>
          <a href="/">
            Portafolio <ArrowUpRight size={15} />
          </a>
        </div>
      </header>
      <div className="of-page">
        <div className="of-context">
          <span>
            Espacio de trabajo <ChevronRight size={13} /> Conciliación
          </span>
          <span>
            <ShieldCheck size={14} /> Datos sintéticos · espacio aislado
          </span>
        </div>
        <div className="of-heading">
          <div>
            <p className="of-eyebrow">PEDIDOS / FACTURAS / ENTREGAS</p>
            <h1>
              Cada diferencia, <span>explicada.</span>
            </h1>
            <p>
              Revisa las diferencias. Encuentra el documento que las explica.
            </p>
          </div>
          <div className="of-state-label">
            <span className={`of-tag ${ready ? "of-tag-ready" : ""}`}>
              <span />
              {ready ? "ESPACIO ACTIVO" : "LISTO PARA COMENZAR"}
            </span>
            <span>
              {ready
                ? `Revisión ${data.space.revision} · ${data.runs.length} ${data.runs.length === 1 ? "corrida" : "corridas"}`
                : "Primera carga · 24 pedidos de ejemplo"}
            </span>
          </div>
        </div>
        <section className="of-control" aria-label="Procesamiento de lotes">
          <div className="of-control-label">
            <div className="of-icon">
              <Database size={21} />
            </div>
            <div>
              <span className="of-control-step">01 / INGESTIÓN</span>
              <strong>Procesar un lote</strong>
              <p>
                {ready
                  ? "Elige un escenario y compara el resultado."
                  : "Carga los documentos y explora el resultado."}
              </p>
            </div>
          </div>
          <label className="of-select-label">
            <span>Escenario de procesamiento</span>
            <select
              aria-label="Operación a ejecutar"
              value={scenario}
              onChange={(e) => setScenario(e.target.value as Scenario)}
              disabled={busy}
            >
              {scenarios.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                  disabled={!ready && s.id !== "base"}
                >
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <Button
            className="of-primary"
            onClick={run}
            disabled={busy || loading}
          >
            {busy ? (
              <RefreshCw size={17} className="of-spin" />
            ) : (
              <Play size={17} />
            )}{" "}
            {busy
              ? "Procesando…"
              : ready
                ? "Ejecutar lote"
                : "Crear espacio y cargar"}
          </Button>
          <Button
            variant="outline"
            className="of-refresh"
            onClick={refresh}
            disabled={busy || loading}
            aria-label="Actualizar espacio"
          >
            <RefreshCw size={17} />
          </Button>
        </section>
        <p className="of-operation-note">
          {scenarios.find((s) => s.id === scenario)?.description}{" "}
          <span>
            Los resultados se guardan durante 24 horas en este espacio; máximo
            40 corridas.
          </span>
        </p>
        {error && (
          <div className="of-alert of-danger" role="alert">
            <AlertTriangle size={19} />
            <span>{error}</span>
            <button onClick={refresh}>Actualizar</button>
          </div>
        )}
        {notice && (
          <div className="of-alert" role="status">
            <CheckCircle2 size={19} />
            <span>{notice}</span>
          </div>
        )}
        <main id="of-main" aria-busy={busy || loading}>
          {loading && !data ? (
            <div className="of-empty" role="status">
              <RefreshCw className="of-spin" />
              <h2>Consultando tu espacio…</h2>
            </div>
          ) : !ready ? (
            <section className="of-welcome">
              <div>
                <p className="of-eyebrow">TU PRIMER RECORRIDO</p>
                <h2>Del archivo a una decisión.</h2>
                <p>
                  El lote inicial reúne 24 pedidos ficticios y sus documentos.
                  Algunos coinciden; otros contienen diferencias que podrás
                  investigar y corregir.
                </p>
                <ol>
                  <li>
                    <strong>Carga y revisa.</strong> Abre un pedido y sigue el
                    importe hasta su archivo y fila de origen.
                  </li>
                  <li>
                    <strong>Repite el lote.</strong> Comprueba que las cifras no
                    se duplican.
                  </li>
                  <li>
                    <strong>Prueba una corrección.</strong> Aplica las llegadas
                    tardías y compara los pedidos pendientes.
                  </li>
                </ol>
              </div>
              <div className="of-flow" aria-label="Flujo de procesamiento">
                <p className="of-flow-caption">DE LA FUENTE AL RESULTADO</p>
                {[
                  "Archivos originales",
                  "Contrato y cuarentena",
                  "Eventos versionados",
                  "Conciliación SQL",
                ].map((s, i) => (
                  <div key={s}>
                    <span>0{i + 1}</span>
                    <strong>{s}</strong>
                    {i < 3 ? (
                      <ArrowDown size={17} />
                    ) : (
                      <CheckCircle2 size={17} />
                    )}
                  </div>
                ))}
                <p>
                  La aplicación ejecuta las operaciones. El conjunto de datos es
                  de prueba y no representa una empresa real.
                </p>
              </div>
            </section>
          ) : (
            <>
              <div className="of-section-label">
                <span>02 / REVISIÓN</span>
                <span>Estado actual del espacio</span>
              </div>
              <section className="of-kpis" aria-label="Resumen de conciliación">
                <div>
                  <span>Pedidos</span>
                  <strong>{data.summary.orders}</strong>
                  <small>{data.events.length} versiones de documentos</small>
                </div>
                <div>
                  <span>Conciliados</span>
                  <strong className="of-green">
                    {data.summary.matched}
                    <small> / {data.summary.orders}</small>
                  </strong>
                  <small>Importe y cantidad coinciden</small>
                </div>
                <div>
                  <span>Por resolver</span>
                  <strong className="of-orange">{data.summary.open}</strong>
                  <small>
                    {data.orphans.length}{" "}
                    {data.orphans.length === 1 ? "documento" : "documentos"} sin
                    pedido, por separado
                  </small>
                </div>
                <div>
                  <span>Diferencia absoluta de importe</span>
                  <strong className="of-money">
                    {money(data.summary.currencies[0].difference_minor, "CLP")}
                  </strong>
                  <small>
                    {money(data.summary.currencies[1].difference_minor, "USD")}{" "}
                    USD · solo monedas comparables
                  </small>
                </div>
              </section>
              <nav className="of-tabs" aria-label="Vistas de OpsForge">
                {tabs.map(([id, label, Icon]) => (
                  <button
                    key={id}
                    aria-current={tab === id ? "page" : undefined}
                    onClick={() => setTab(id)}
                  >
                    <Icon size={17} />
                    {label}
                    <span>
                      {id === "orders"
                        ? data.rows.length
                        : id === "runs"
                          ? data.runs.length
                          : id === "quality"
                            ? data.quarantine.length
                            : Object.keys(fixtures.batches).length}
                    </span>
                  </button>
                ))}
              </nav>
              {tab === "orders" && (
                <section className="of-order-layout">
                  <div className="of-panel" id="of-order-list">
                    <div className="of-panel-head">
                      <div>
                        <h2>Conciliación por pedido</h2>
                        <p>
                          {rows.length} de {data.rows.length} pedidos · importes
                          sin impuestos
                        </p>
                      </div>
                      <a className="of-export" href="/api/opsforge/export">
                        <Download size={16} /> Exportar CSV
                      </a>
                    </div>
                    <div className="of-filters">
                      <label className="of-search">
                        <Search size={16} />
                        <input
                          aria-label="Buscar pedido"
                          placeholder="Buscar por número de pedido…"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </label>
                      <select
                        aria-label="Estado de conciliación"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="all">Todos los estados</option>
                        <option value="open">Por resolver</option>
                        <option value="matched">Conciliados</option>
                      </select>
                      <select
                        aria-label="Moneda"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      >
                        <option value="all">CLP + USD</option>
                        <option>CLP</option>
                        <option>USD</option>
                      </select>
                    </div>
                    <div
                      className="of-table-scroll"
                      tabIndex={0}
                      aria-label="Tabla de pedidos, desplazable"
                    >
                      <table>
                        <caption>
                          Selecciona un pedido para consultar sus documentos. El
                          CSV incluye todos los pedidos del espacio.
                        </caption>
                        <thead>
                          <tr>
                            <th>Pedido</th>
                            <th>Estado</th>
                            <th>Importe pedido</th>
                            <th>Entregado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r) => (
                            <tr
                              key={r.order_id}
                              className={
                                r.order_id === order?.order_id
                                  ? "of-selected"
                                  : ""
                              }
                            >
                              <td>
                                <button
                                  className="of-order-link"
                                  onClick={() => {
                                    setSelected(r.order_id);
                                    if (
                                      window.matchMedia("(max-width: 800px)")
                                        .matches
                                    ) {
                                      const detail =
                                        document.getElementById(
                                          "of-order-detail",
                                        );
                                      detail?.focus({ preventScroll: true });
                                      detail?.scrollIntoView({
                                        behavior: window.matchMedia(
                                          "(prefers-reduced-motion: reduce)",
                                        ).matches
                                          ? "auto"
                                          : "smooth",
                                        block: "start",
                                      });
                                    }
                                  }}
                                  aria-pressed={r.order_id === order?.order_id}
                                >
                                  {r.order_id}
                                  <ChevronRight size={14} />
                                </button>
                              </td>
                              <td>
                                <span
                                  className={`of-badge ${r.status === "matched" ? "of-ok" : "of-warn"}`}
                                >
                                  {labels[r.status]}
                                </span>
                              </td>
                              <td className="of-numeric">
                                {money(r.ordered_minor, r.currency)}{" "}
                                <small>{r.currency}</small>
                              </td>
                              <td className="of-numeric">
                                {r.delivered_qty} / {r.ordered_qty} {r.unit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {rows.length === 0 && (
                        <div className="of-empty">
                          <Search />
                          <h3>No hay pedidos con esos filtros.</h3>
                          <button
                            onClick={() => {
                              setSearch("");
                              setStatus("all");
                              setCurrency("all");
                            }}
                          >
                            Restablecer filtros
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <aside
                    className="of-panel of-detail"
                    id="of-order-detail"
                    tabIndex={-1}
                    aria-label="Detalle del pedido"
                  >
                    {order ? (
                      <>
                        <a className="of-back-to-list" href="#of-order-list">
                          <ArrowLeft size={14} /> Volver a la tabla
                        </a>
                        <div className="of-panel-head">
                          <div>
                            <p className="of-eyebrow">TRAZABILIDAD</p>
                            <h2>{order.order_id}</h2>
                          </div>
                          <span
                            className={`of-badge ${order.status === "matched" ? "of-ok" : "of-warn"}`}
                          >
                            {labels[order.status]}
                          </span>
                        </div>
                        <div className="of-recon">
                          <div>
                            <span>Pedido</span>
                            <strong>
                              {money(order.ordered_minor, order.currency)}
                            </strong>
                          </div>
                          <div>
                            <span>
                              Facturado · {order.invoice_count} documentos
                            </span>
                            <strong>
                              {money(order.invoiced_minor, order.currency)}
                            </strong>
                          </div>
                          <div className="of-delta">
                            <span>Diferencia de importe</span>
                            <strong>
                              {order.currency_mismatch
                                ? "No comparable"
                                : money(order.amount_delta, order.currency)}
                            </strong>
                          </div>
                          <div>
                            <span>Entrega / pedido</span>
                            <strong>
                              {order.delivered_qty} / {order.ordered_qty}{" "}
                              {order.unit}
                            </strong>
                          </div>
                        </div>
                        {!!(order.currency_mismatch || order.unit_mismatch) && (
                          <p className="of-inline-warning">
                            Existen documentos con{" "}
                            {order.currency_mismatch ? "moneda" : "unidad"}{" "}
                            distinta. Sus valores no se mezclan en la suma
                            comparable.
                          </p>
                        )}
                        <h3 className="of-lineage-title">
                          Documentos y revisiones
                        </h3>
                        <div className="of-lineage">
                          {lineage.map((e) => {
                            const active = !lineage.some(
                              (other) =>
                                other.kind === e.kind &&
                                other.entity_id === e.entity_id &&
                                other.version > e.version,
                            );
                            return (
                              <details
                                key={`${e.kind}-${e.entity_id}-${e.version}`}
                              >
                                <summary>
                                  <FileText size={17} />
                                  <div>
                                    <strong>
                                      {docLabel[e.kind]} · {e.entity_id}
                                    </strong>
                                    <span>
                                      v{e.version} ·{" "}
                                      {active ? "Vigente" : "Reemplazada"} ·
                                      fila {e.source_row}
                                    </span>
                                  </div>
                                </summary>
                                <div className="of-event">
                                  <dl>
                                    <dt>Fecha del evento</dt>
                                    <dd>{e.event_date}</dd>
                                    <dt>Importe</dt>
                                    <dd>
                                      {money(e.amount_minor, e.currency)}{" "}
                                      {e.currency}
                                    </dd>
                                    <dt>Cantidad</dt>
                                    <dd>
                                      {e.quantity} {e.unit}
                                    </dd>
                                    <dt>SHA-256 del archivo</dt>
                                    <dd className="of-hash">{e.batch_hash}</dd>
                                  </dl>
                                  <a
                                    href={`/opsforge/fixtures/${e.source_file}`}
                                    download
                                  >
                                    Descargar archivo original{" "}
                                    <Download size={14} />
                                  </a>
                                  <pre>
                                    {JSON.stringify(
                                      JSON.parse(e.raw_json),
                                      null,
                                      2,
                                    )}
                                  </pre>
                                </div>
                              </details>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <p className="of-pad">
                        Selecciona un pedido con los filtros actuales.
                      </p>
                    )}
                  </aside>
                </section>
              )}
              {tab === "runs" && (
                <section className="of-panel">
                  <div className="of-panel-head">
                    <div>
                      <h2>Historial de corridas</h2>
                      <p>
                        Hechos nuevos, duplicados y rechazos de cada intento.
                        Los fallos no publican resultados parciales.
                      </p>
                    </div>
                    <span className="of-tag">{data.runs.length} / 40</span>
                  </div>
                  <div className="of-runs">
                    {data.runs.map((r) => (
                      <details key={r.id}>
                        <summary>
                          <span
                            className={`of-badge ${r.status === "completed" ? "of-ok" : "of-warn"}`}
                          >
                            {r.status === "completed"
                              ? "Completada"
                              : r.status === "blocked"
                                ? "Bloqueada"
                                : "Revertida"}
                          </span>
                          <strong>
                            {scenarios.find((s) => s.id === r.scenario)?.label}
                          </strong>
                          <time>
                            {new Date(r.started).toLocaleTimeString("es-CL")}
                          </time>
                          <span>{r.accepted} nuevos</span>
                        </summary>
                        <div className="of-run-body">
                          <p>{r.message}</p>
                          <div className="of-run-stats">
                            <span>
                              <strong>{r.accepted}</strong>aceptados
                            </span>
                            <span>
                              <strong>{r.duplicates}</strong>duplicados
                            </span>
                            <span>
                              <strong>{r.rejected}</strong>rechazados
                            </span>
                            <span>
                              <strong>{r.revision}</strong>revisión
                            </span>
                          </div>
                          <p className="of-hash">SHA-256: {r.batch_hash}</p>
                          <small>
                            Preparación antes de enviar la transacción:{" "}
                            {r.duration_ms} ms. No incluye latencia de red ni
                            duración completa.
                          </small>
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              )}
              {tab === "quality" && (
                <section className="of-quality-grid">
                  <div className="of-panel">
                    <div className="of-panel-head">
                      <div>
                        <h2>Filas en cuarentena</h2>
                        <p>
                          Se conservan el valor recibido y su motivo. Repetir el
                          lote no duplica este registro.
                        </p>
                      </div>
                    </div>
                    {data.quarantine.map((q) => (
                      <details
                        className="of-rejection"
                        key={`${q.source_file}-${q.source_row}-${q.reason}`}
                      >
                        <summary>
                          <AlertTriangle size={19} />
                          <div>
                            <strong>{q.reason}</strong>
                            <span>
                              {q.source_file} · fila {q.source_row}
                            </span>
                          </div>
                        </summary>
                        <pre>
                          {JSON.stringify(JSON.parse(q.raw_json), null, 2)}
                        </pre>
                        <a
                          href={`/opsforge/fixtures/${q.source_file}`}
                          download
                        >
                          Archivo original <Download size={14} />
                        </a>
                      </details>
                    ))}
                    {data.quarantine.length === 0 && (
                      <div className="of-empty">
                        <CheckCircle2 />
                        <p>No hay filas en cuarentena.</p>
                      </div>
                    )}
                  </div>
                  <div className="of-panel">
                    <div className="of-panel-head">
                      <div>
                        <h2>Sin pedido recibido</h2>
                        <p>Documentos válidos cuya referencia aún no llegó.</p>
                      </div>
                    </div>
                    {data.orphans.length === 0 ? (
                      <div className="of-empty">
                        <CheckCircle2 />
                        <p>No hay referencias pendientes.</p>
                      </div>
                    ) : (
                      data.orphans.map((e) => (
                        <div className="of-orphan" key={e.entity_id}>
                          <strong>{e.entity_id}</strong>
                          <p>
                            Espera a {e.order_id}. Se reevalúa al recibir el
                            pedido.
                          </p>
                          <a
                            href={`/opsforge/fixtures/${e.source_file}`}
                            download
                          >
                            Original · fila {e.source_row}
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )}
              {tab === "sources" && <SourcePanel />}
            </>
          )}
        </main>
        <footer className="of-footer">
          <a href="/">
            <ArrowLeft size={15} /> Sebastián Cortés · Portafolio
          </a>
          <span>
            Proyecto personal · fuentes ficticias reproducibles · sin datos de
            clientes
          </span>
          <a href="/opsforge/caso">
            Arquitectura y reproducción <ArrowUpRight size={15} />
          </a>
        </footer>
      </div>
    </div>
  );
}
function SourcePanel() {
  return (
    <section className="of-panel">
      <div className="of-panel-head">
        <div>
          <h2>Archivos originales</h2>
          <p>
            Semilla {fixtures.seed}. CSV inmutables por hash; moneda y unidad
            explícitas en cada fila.
          </p>
        </div>
        <a
          className="of-export"
          href="/opsforge/fixtures/manifest.json"
          download
        >
          <Download size={16} /> Manifiesto
        </a>
      </div>
      <div className="of-source-grid">
        {Object.values(fixtures.batches).map((b) => (
          <article key={b.id}>
            <FileText size={24} />
            <h3>{b.label}</h3>
            <p>{b.rows} filas · CSV UTF-8</p>
            <p className="of-hash">{b.sha256}</p>
            <a href={`/opsforge/fixtures/${b.file}`} download>
              Descargar CSV <Download size={15} />
            </a>
          </article>
        ))}
      </div>
      <div className="of-source-note">
        <strong>Contrato de dinero y cantidades</strong>
        <p>
          CLP se expresa en pesos; USD en centavos. Se comparan documentos en su
          propia moneda, sin tipo de cambio. Las cantidades usan unidades (ea) o
          kilogramos (kg), sin conversión automática. El estado prioriza
          moneda/unidad, documento ausente, importe y cantidad; el detalle
          conserva todas las diferencias.
        </p>
      </div>
    </section>
  );
}
