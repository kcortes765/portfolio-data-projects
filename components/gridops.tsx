"use client";
import { useMemo, useState, useEffect } from "react";
import { DataTable } from "@/components/data-table";
import { Quality } from "@/components/quality";
import { useGridTools } from "@/components/webmcp";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  ChartNoAxesCombined,
  Database,
  ShieldCheck,
  FileText,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Trend } from "@/components/trend";
import {
  dataset,
  defaults,
  Filters,
  periods,
  selectRows,
  monthly,
  sum,
  format,
  monthLabel,
  previousYear,
  yearComparison,
  validation,
  dateLabel,
} from "@/lib/gridops";

export default function GridOps({
  initialFilters = defaults,
}: {
  initialFilters?: Filters;
}) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [showPrevious, setShowPrevious] = useState(false);
  const [tableVersion, setTableVersion] = useState(0);
  function reset() {
    setFilters(defaults);
    setShowPrevious(false);
    setTableVersion((v) => v + 1);
  }
  useGridTools(filters, setFilters);
  useEffect(() => {
    const url = new URL(window.location.href);
    for (const [k, v] of Object.entries(filters)) url.searchParams.set(k, v);
    window.history.replaceState(
      window.history.state,
      "",
      url.pathname + url.search + url.hash,
    );
  }, [filters]);
  const error = validation(filters);
  const rows = useMemo(
    () => (error ? [] : selectRows(filters)),
    [filters, error],
  );
  const baseSeries = monthly(rows);
  const total = sum(rows);
  const ernc = sum(rows.filter((r) => r.classification === "ERNC"));
  const comparison = yearComparison(filters, rows);
  const prev = comparison.previous;
  const previousSeries = new Map(monthly(prev).map((r) => [r.period, r.total]));
  const byMonth = new Map(baseSeries.map((r) => [r.period, r]));
  const series = periods
    .filter((p) => p >= filters.start && p <= filters.end)
    .map((p) => ({
      period: p,
      total: byMonth.get(p)?.total ?? null,
      ernc: byMonth.get(p)?.ernc ?? null,
      previous: previousSeries.get(previousYear(p)) ?? null,
    }));
  const delta = comparison.delta;
  const technologies = dataset.technologies
    .map((t) => ({ name: t, mwh: sum(rows.filter((r) => r.technology === t)) }))
    .filter((t) => t.mwh !== 0)
    .sort((a, b) => b.mwh - a.mwh);
  const change = (key: keyof Filters, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));
  function download() {
    const params = new URLSearchParams({ ...filters, format: "csv" });
    // Downloads an HTTP attachment, not a Next.js page transition.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/api/generation?${params}`);
  }
  return (
    <div className="app-shell">
      <a href="#workspace" className="skip">
        Saltar a los datos
      </a>
      <aside className="sidebar">
        <a className="gridops-word app-logo" href="/gridops">
          Grid<span>Ops</span>
          <small>CHILE ENERGY EXPLORER</small>
        </a>
        <div className="sidebar-section">EXPLORADOR</div>
        <nav aria-label="GridOps">
          <a className="side-link active" href="#workspace">
            <ChartNoAxesCombined size={19} /> Vista general
          </a>
          <a className="side-link" href="#data-table">
            <Database size={19} /> Datos
          </a>
          <a className="side-link" href="#quality">
            <ShieldCheck size={19} /> Calidad y fuentes
          </a>
          <a className="side-link" href="/gridops/caso">
            <FileText size={19} /> Sobre el proyecto
          </a>
        </nav>
        <div className="sidebar-bottom">
          <p>
            Un proyecto de
            <br />
            <strong>Sebastián Cortés</strong>
          </p>
          <a href="/">
            <ArrowLeft size={15} /> Volver al portfolio
          </a>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <span>
            Proyecto / <strong>GridOps</strong>
          </span>
          <a href={dataset.source.catalog} target="_blank" rel="noreferrer">
            Fuente oficial <ArrowUpRight size={15} />
          </a>
        </header>
        <main className="workspace" id="workspace">
          <div className="workspace-heading">
            <div>
              <p className="eyebrow">SISTEMA ELÉCTRICO · CHILE</p>
              <h1>La energía, en perspectiva.</h1>
              <p>
                Explora cómo evoluciona la generación eléctrica por tecnología.
              </p>
            </div>
            <Button
              className="export-button"
              variant="outline"
              onClick={download}
              disabled={!rows.length}
            >
              <Download size={16} /> Exportar CSV
            </Button>
          </div>
          <div className="dataset-notice">
            <span className="notice-tag">SERIE HISTÓRICA</span>
            <span>
              Datos hasta{" "}
              <strong>{monthLabel(dataset.quality.last_period)}</strong> ·
              Revisión en CSV: {dateLabel(dataset.source.source_updated)} ·
              Captura: {dateLabel(dataset.source.retrieved_at)}
            </span>
          </div>
          <section className="filter-panel" aria-label="Filtros">
            <div className="filter-controls">
              <label>
                Desde
                <NativeSelect
                  aria-label="Mes inicial"
                  value={filters.start}
                  onChange={(e) => change("start", e.target.value)}
                >
                  {periods.map((p) => (
                    <option value={p} key={p}>
                      {monthLabel(p)}
                    </option>
                  ))}
                </NativeSelect>
              </label>
              <label>
                Hasta
                <NativeSelect
                  aria-label="Mes final"
                  value={filters.end}
                  onChange={(e) => change("end", e.target.value)}
                >
                  {periods.map((p) => (
                    <option value={p} key={p}>
                      {monthLabel(p)}
                    </option>
                  ))}
                </NativeSelect>
              </label>
              <label>
                Tecnología
                <NativeSelect
                  aria-label="Tecnología"
                  value={filters.technology}
                  onChange={(e) => change("technology", e.target.value)}
                >
                  <option value="all">Todas las tecnologías</option>
                  {dataset.technologies.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </NativeSelect>
              </label>
              <label>
                Subsistema de origen
                <NativeSelect
                  aria-label="Subsistema"
                  value={filters.subsystem}
                  onChange={(e) => change("subsystem", e.target.value)}
                >
                  <option value="all">SIC + SING</option>
                  <option>SIC</option>
                  <option>SING</option>
                </NativeSelect>
              </label>
              <label>
                Clasificación
                <NativeSelect
                  aria-label="Clasificación"
                  value={filters.classification}
                  onChange={(e) => change("classification", e.target.value)}
                >
                  <option value="all">Todas</option>
                  <option>ERNC</option>
                  <option>Convencional</option>
                </NativeSelect>
              </label>
            </div>
            <div className="filter-presets">
              <span>Período:</span>
              <Button
                variant="ghost"
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    start: defaults.start,
                    end: defaults.end,
                  }))
                }
              >
                Últimos 12 meses
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    start: "2025-01",
                    end: "2025-12",
                  }))
                }
              >
                2025
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    start: periods[0],
                    end: periods.at(-1)!,
                  }))
                }
              >
                Todo el histórico
              </Button>
              <Button variant="ghost" className="reset-button" onClick={reset}>
                <RotateCcw size={14} /> Restablecer
              </Button>
            </div>
          </section>
          {error ? (
            <div className="empty-state" role="alert">
              {error}
            </div>
          ) : !rows.length ? (
            <div className="empty-state" role="status">
              <h2>No hay datos para esta selección</h2>
              <p>
                Cambia el período o la tecnología para explorar otra parte de la
                serie.
              </p>
            </div>
          ) : (
            <>
              <section className="kpi-grid" aria-label="Resumen del período">
                <article>
                  <span>Generación del período</span>
                  <strong>
                    {format(total / 1000, 1)} <small>GWh</small>
                  </strong>
                  <p>
                    {monthLabel(filters.start)} — {monthLabel(filters.end)}
                  </p>
                </article>
                <article>
                  <span>Participación ERNC</span>
                  <strong>
                    {total ? format((ernc / total) * 100, 1) : "—"}{" "}
                    <small>%</small>
                  </strong>
                  <p>Clasificación informada por la CNE</p>
                </article>
                <article>
                  <span>Variación interanual</span>
                  <strong>
                    {delta === null
                      ? "—"
                      : `${delta > 0 ? "+" : ""}${format(delta, 1)}`}{" "}
                    <small>{delta === null ? "" : "%"}</small>
                  </strong>
                  <p>{comparison.reason}</p>
                </article>
                <article>
                  <span>Cobertura seleccionada</span>
                  <strong>
                    {baseSeries.length} <small>meses con datos</small>
                  </strong>
                  <p>
                    {format(rows.reduce((s, r) => s + r.source_rows, 0))}{" "}
                    registros de origen
                  </p>
                </article>
              </section>
              <section className="chart-grid">
                <article className="data-card trend-card">
                  <div className="card-heading">
                    <div>
                      <h2>Evolución de la generación</h2>
                      <p>Generación mensual · GWh</p>
                    </div>
                    <div className="legend">
                      <span>
                        <i className="blue" />
                        Total
                      </span>
                      <span>
                        <i className="green" />
                        ERNC
                      </span>
                      {showPrevious && (
                        <span>
                          <i style={{ background: "#9b6b1e" }} />
                          Año anterior · línea discontinua
                        </span>
                      )}
                    </div>
                  </div>
                  <label className="chart-toggle">
                    <Switch
                      checked={showPrevious}
                      onCheckedChange={setShowPrevious}
                      aria-label="Comparar con el año anterior"
                    />
                    Comparar con el año anterior
                  </label>
                  <Trend data={series} compare={showPrevious} />
                  <div className="card-footnote">
                    ERNC es un subconjunto del total. Incluye las tecnologías
                    clasificadas como no convencionales por la fuente.
                  </div>
                </article>
                <article className="data-card mix-card">
                  <div className="card-heading">
                    <div>
                      <h2>Mix de generación</h2>
                      <p>Contribución al período seleccionado</p>
                    </div>
                  </div>
                  <div className="mix-list">
                    {technologies.map((t, i) => (
                      <div className="mix-row" key={t.name}>
                        <div>
                          <span>{t.name}</span>
                          <strong>
                            {format(t.mwh / 1000, 1)} <small>GWh</small>
                          </strong>
                        </div>
                        <div className="bar-track">
                          <div
                            style={{
                              width: `${Math.max(0, (t.mwh / (technologies[0]?.mwh || 1)) * 100)}%`,
                              background:
                                i === 0
                                  ? "#2455e8"
                                  : i === 1
                                    ? "#168260"
                                    : "#8ea5d8",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
              <DataTable
                key={`${JSON.stringify(filters)}:${tableVersion}`}
                rows={rows}
                onDownload={download}
              />
            </>
          )}
          <Quality />
          <footer className="app-footer">
            <a href="/" className="text-link">
              Portfolio de Sebastián Cortés
            </a>
            <span>CNE / Coordinador Eléctrico Nacional · CC BY</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
