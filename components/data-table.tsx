"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { RecordRow, format, monthLabel } from "@/lib/gridops";
export function DataTable({
  rows,
  onDownload,
}: {
  rows: RecordRow[];
  onDownload: () => void;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("period-desc");
  const [page, setPage] = useState(0);
  const filtered = useMemo(
    () =>
      rows
        .filter((r) =>
          `${r.technology} ${r.subsystem} ${r.classification}`
            .toLocaleLowerCase("es")
            .includes(query.toLocaleLowerCase("es")),
        )
        .sort((a, b) =>
          sort === "mwh-desc"
            ? b.mwh - a.mwh
            : sort === "period-asc"
              ? a.period.localeCompare(b.period) ||
                a.technology.localeCompare(b.technology)
              : b.period.localeCompare(a.period) ||
                a.technology.localeCompare(b.technology),
        ),
    [rows, query, sort],
  );
  const pages = Math.ceil(filtered.length / 20);
  const current = Math.min(page, Math.max(0, pages - 1));
  return (
    <section className="data-card" id="data-table">
      <div className="card-heading">
        <div>
          <h2>Datos del período</h2>
          <p>
            {format(filtered.length)} filas · mes, tecnología, subsistema y
            clasificación
          </p>
        </div>
        <Button variant="outline" onClick={onDownload} disabled={!rows.length}>
          <Download size={15} /> CSV del período
        </Button>
      </div>
      <div className="table-tools">
        <Input
          placeholder="Buscar tecnología o clasificación…"
          aria-label="Buscar en la tabla"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
        />
        <NativeSelect
          aria-label="Orden de la tabla"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(0);
          }}
        >
          <option value="period-desc">Mes más reciente</option>
          <option value="period-asc">Mes más antiguo</option>
          <option value="mwh-desc">Mayor generación</option>
        </NativeSelect>
      </div>
      <div className="table-wrap">
        <table>
          <caption className="sr-only">
            Generación por mes, tecnología, subsistema y clasificación, en MWh.
            La búsqueda solo afecta la tabla; el CSV contiene todos los
            resultados de los filtros superiores.
          </caption>
          <thead>
            <tr>
              <th scope="col">Mes</th>
              <th scope="col">Tecnología</th>
              <th scope="col">Origen</th>
              <th scope="col">Clasificación</th>
              <th scope="col" className="numeric">
                Generación · MWh
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(current * 20, current * 20 + 20).map((r, i) => (
              <tr
                key={`${r.period}-${r.technology}-${r.subsystem}-${r.classification}-${i}`}
              >
                <td>{monthLabel(r.period)}</td>
                <td>{r.technology}</td>
                <td>{r.subsystem}</td>
                <td>{r.classification}</td>
                <td className="numeric">{format(r.mwh, 3)}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={5}>
                  No se encontraron filas. Prueba otra búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-pagination">
        <span role="status">
          {filtered.length
            ? `${current * 20 + 1}–${Math.min((current + 1) * 20, filtered.length)} de ${format(filtered.length)}`
            : "0 resultados"}
        </span>
        <span>La búsqueda afecta solo a esta tabla.</span>
        <div>
          <Button
            variant="outline"
            aria-label="Página anterior"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            aria-label="Página siguiente"
            disabled={current + 1 >= pages}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}
