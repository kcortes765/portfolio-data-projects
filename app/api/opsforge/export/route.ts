import { scopeOf, readState, reply } from "@/lib/opsforge/server";
import { csvExport } from "@/lib/opsforge/core";
export async function GET(req: Request) {
  try {
    const scope = await scopeOf(req);
    if (!scope) return reply({ error: "Espacio no disponible" }, 401);
    const data = await readState(scope.id);
    return new Response(csvExport(data.rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="opsforge-conciliacion.csv"',
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return reply({ error: "No pudimos exportar el espacio." }, 503);
  }
}
