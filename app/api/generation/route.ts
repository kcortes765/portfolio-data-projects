import {
  dataset,
  defaults,
  Filters,
  selectRows,
  sum,
  validation,
  csv,
} from "@/lib/gridops";
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const filters = { ...defaults };
  for (const key of Object.keys(filters) as (keyof Filters)[])
    if (params.has(key)) filters[key] = params.get(key)!;
  const error = validation(filters);
  if (error) return Response.json({ error }, { status: 400 });
  const rows = selectRows(filters);
  if (params.get("format") === "csv")
    return new Response(csv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="gridops_${filters.start}_${filters.end}.csv"`,
        "Cache-Control": "public,max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  return Response.json(
    {
      version: "1.0",
      filters,
      source_sha256: dataset.snapshot,
      cutoff: dataset.quality.last_period,
      unit: "MWh",
      count: rows.length,
      total_mwh: sum(rows),
      ernc_mwh: sum(rows.filter((r) => r.classification === "ERNC")),
      data: rows,
    },
    {
      headers: {
        "Cache-Control": "public,max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
