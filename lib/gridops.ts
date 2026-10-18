import raw from "@/lib/generated/dataset.json";

export type RecordRow = {
  period: string;
  technology: string;
  subsystem: string;
  classification: string;
  mwh: number;
  source_rows: number;
  plant_codes: number;
};
export const dataset = raw;
export const records: RecordRow[] = raw.records;
export const periods = [...new Set(records.map((r) => r.period))].sort();
export type Filters = {
  start: string;
  end: string;
  technology: string;
  subsystem: string;
  classification: string;
};
export const defaults: Filters = {
  start: periods[Math.max(0, periods.length - 12)],
  end: periods.at(-1)!,
  technology: "all",
  subsystem: "all",
  classification: "all",
};
export function selectRows(filters: Filters, rows = records) {
  return rows.filter(
    (r) =>
      r.period >= filters.start &&
      r.period <= filters.end &&
      (filters.technology === "all" || r.technology === filters.technology) &&
      (filters.subsystem === "all" || r.subsystem === filters.subsystem) &&
      (filters.classification === "all" ||
        r.classification === filters.classification),
  );
}
export function sum(rows: RecordRow[]) {
  return rows.reduce((n, r) => n + r.mwh, 0);
}
export function previousYear(period: string) {
  return `${Number(period.slice(0, 4)) - 1}${period.slice(4)}`;
}
export function yearComparison(
  filters: Filters,
  current = selectRows(filters),
  source = records,
) {
  const previousFilters = {
    ...filters,
    start: previousYear(filters.start),
    end: previousYear(filters.end),
  };
  const previous = selectRows(previousFilters, source);
  const selected = periods.filter(
    (p) => p >= filters.start && p <= filters.end,
  );
  const currentMonths = new Set(current.map((r) => r.period));
  const previousMonths = new Set(previous.map((r) => r.period));
  const complete =
    !validation(filters) &&
    selected.length > 0 &&
    selected.every(
      (p) => currentMonths.has(p) && previousMonths.has(previousYear(p)),
    );
  const baseline = sum(previous);
  return {
    previous,
    delta:
      complete && baseline > 0 ? (sum(current) / baseline - 1) * 100 : null,
    reason: !complete
      ? "Faltan meses de datos comparables."
      : baseline <= 0
        ? "El año anterior no tiene una base positiva."
        : "Mismos meses del año anterior",
  };
}
export function monthly(rows: RecordRow[]) {
  const map = new Map<
    string,
    { period: string; total: number; ernc: number }
  >();
  for (const r of rows) {
    const m = map.get(r.period) ?? { period: r.period, total: 0, ernc: 0 };
    m.total += r.mwh / 1000;
    if (r.classification === "ERNC") m.ernc += r.mwh / 1000;
    map.set(r.period, m);
  }
  return [...map.values()].sort((a, b) => a.period.localeCompare(b.period));
}
export function format(n: number, digits = 0) {
  return new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(n);
}
export function monthLabel(period: string, year = true) {
  const [y, m] = period.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CL", {
    month: "short",
    ...(year ? { year: "numeric" as const } : {}),
    timeZone: "UTC",
  })
    .format(new Date(Date.UTC(y, m - 1, 1)))
    .replace(".", "");
}
export function csv(rows: RecordRow[]) {
  const columns = [
    "period",
    "technology",
    "subsystem",
    "classification",
    "mwh",
    "source_rows",
    "plant_codes",
  ] as const;
  const safe = (v: unknown) => {
    let text = String(v);
    if (typeof v === "string" && /^[=+@\-\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  return (
    "\uFEFF" +
    [
      columns.join(","),
      ...rows.map((r) => columns.map((k) => safe(r[k])).join(",")),
    ].join("\r\n")
  );
}
export function validation(filters: Filters) {
  if (!periods.includes(filters.start) || !periods.includes(filters.end))
    return "El período está fuera de la cobertura.";
  if (filters.start > filters.end)
    return "El inicio debe ser anterior al final.";
  if (
    filters.technology !== "all" &&
    !dataset.technologies.includes(filters.technology)
  )
    return "Tecnología desconocida.";
  if (!["all", "SIC", "SING"].includes(filters.subsystem))
    return "Subsistema desconocido.";
  if (!["all", "ERNC", "Convencional"].includes(filters.classification))
    return "Clasificación desconocida.";
  return null;
}

export function dateLabel(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value.length === 10 ? value + "T12:00:00Z" : value));
}
