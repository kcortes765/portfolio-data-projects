import { catalogSchema } from "@/lib/source-status";
import { dataset } from "@/lib/gridops";
export async function GET() {
  try {
    const response = await fetch(
      "https://datos.gob.cl/api/3/action/package_show?id=generacion-bruta",
      {
        signal: AbortSignal.timeout(10000),
        headers: { Accept: "application/json" },
      },
    );
    if (!response.ok) throw new Error("Catalog unavailable");
    const payload = catalogSchema.parse(await response.json());
    if (!payload.success) throw new Error("Catalog unavailable");
    const resource = payload.result.resources.find(
      (r: { id: string }) => r.id === dataset.source.resource_id,
    );
    if (!resource?.last_modified) throw new Error("Resource unavailable");
    return Response.json(
      {
        checked_at: new Date().toISOString(),
        resource_modified: resource.last_modified,
        snapshot_resource_modified: dataset.source.resource_modified,
        changed: resource.last_modified !== dataset.source.resource_modified,
        scope: "metadata-only",
        data_refreshed: false,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      {
        error:
          "No fue posible comprobar el catálogo oficial. La captura validada sigue disponible.",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
