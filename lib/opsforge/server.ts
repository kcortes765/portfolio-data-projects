import { env } from "cloudflare:workers";
import {
  fixtures,
  parseBatch,
  planEvents,
  sha256,
  summarize,
  type Event,
  type Reconciled,
  type Scenario,
} from "./core";
import { reconciliationSql } from "./sql";
const COOKIE = "opsforge_space";
function db() {
  const binding = (env as { DB?: D1Database }).DB;
  if (!binding) throw Error("Storage unavailable");
  return binding;
}
const noCache = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};
export function reply(body: unknown, status = 200, cookie?: string) {
  return Response.json(body, {
    status,
    headers: { ...noCache, ...(cookie ? { "Set-Cookie": cookie } : {}) },
  });
}
export async function scopeOf(req: Request) {
  const token = req.headers
    .get("cookie")
    ?.split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(COOKIE + "="))
    ?.slice(COOKIE.length + 1);
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const id = await sha256(token);
  return await db()
    .prepare("SELECT * FROM of_spaces WHERE id=? AND expires>?")
    .bind(id, Date.now())
    .first<{ id: string; revision: number; expires: number }>();
}
async function newScope(req: Request) {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  const id = await sha256(token),
    now = Date.now();
  await db().prepare("DELETE FROM of_spaces WHERE expires<?").bind(now).run();
  const result = await db()
    .prepare(
      "INSERT INTO of_spaces(id,created,expires,revision) SELECT ?,?,?,0 WHERE (SELECT COUNT(*) FROM of_spaces)<1000",
    )
    .bind(id, now, now + 86400000)
    .run();
  if (!result.meta.changes) throw Error("Capacity reached");
  return {
    space: { id, revision: 0, expires: now + 86400000 },
    cookie: `${COOKIE}=${token}; Path=/api/opsforge; HttpOnly; SameSite=Strict; Max-Age=86400${new URL(req.url).protocol === "https:" ? "; Secure" : ""}`,
  };
}
export async function readState(scope: string) {
  const database = db();
  const responses = await database.batch([
    database.prepare(reconciliationSql).bind(scope),
    database
      .prepare(
        "SELECT * FROM of_runs WHERE scope=? ORDER BY started DESC,id DESC LIMIT 40",
      )
      .bind(scope),
    database
      .prepare(
        "SELECT source_file,source_row,raw_json,reason FROM of_quarantine WHERE scope=? ORDER BY source_file,source_row",
      )
      .bind(scope),
    database
      .prepare(
        "SELECT * FROM of_events WHERE scope=? ORDER BY order_id,kind,entity_id,version",
      )
      .bind(scope),
    database
      .prepare("SELECT revision,expires FROM of_spaces WHERE id=?")
      .bind(scope),
  ]);
  const rows = responses[0].results as unknown as Reconciled[];
  const events = responses[3].results as unknown as Event[];
  const orders = new Set(
    events.filter((e) => e.kind === "order").map((e) => e.order_id),
  );
  const orphans = events.filter(
    (e) => e.kind !== "order" && !orders.has(e.order_id),
  );
  return {
    workspace: true,
    rows,
    summary: summarize(rows),
    runs: responses[1].results.map((r) => {
      const safe = { ...(r as Record<string, unknown>) };
      delete safe.scope;
      return safe;
    }),
    quarantine: responses[2].results,
    events: events.map((e) => {
      const safe = { ...e } as Event & { scope?: string };
      delete safe.scope;
      return safe;
    }),
    orphans: orphans.map((e) => ({
      order_id: e.order_id,
      entity_id: e.entity_id,
      kind: e.kind,
      source_file: e.source_file,
      source_row: e.source_row,
    })),
    space: responses[4].results[0],
  };
}
export async function handleGet(req: Request) {
  try {
    const space = await scopeOf(req);
    return reply(space ? await readState(space.id) : { workspace: false });
  } catch (e) {
    console.error("OpsForge state", e);
    return reply(
      { error: "No pudimos consultar el espacio. Intenta nuevamente." },
      503,
    );
  }
}
export async function handlePost(req: Request) {
  const origin = req.headers.get("origin");
  if (origin !== new URL(req.url).origin)
    return reply({ error: "Origen no autorizado" }, 403);
  if (!req.headers.get("content-type")?.startsWith("application/json"))
    return reply({ error: "Se requiere JSON" }, 415);
  if (Number(req.headers.get("content-length") ?? 0) > 1024)
    return reply({ error: "Solicitud demasiado grande" }, 413);
  let cookie: string | undefined;
  try {
    const reader = req.body?.getReader();
    let bytes = 0;
    const chunks: Uint8Array[] = [];
    if (reader) {
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        bytes += part.value.byteLength;
        if (bytes > 1024) {
          await reader.cancel();
          return reply({ error: "Solicitud demasiado grande" }, 413);
        }
        chunks.push(part.value);
      }
    }
    const joined = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) {
      joined.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const body = new TextDecoder().decode(joined);
    let action: string;
    try {
      const parsed = JSON.parse(body);
      if (
        Object.keys(parsed).some((k) => k !== "scenario") ||
        typeof parsed.scenario !== "string"
      )
        throw Error();
      action = parsed.scenario;
    } catch {
      return reply({ error: "Solicitud inválida" }, 400);
    }
    if (!["base", "late", "failure", "conflict", "schema"].includes(action))
      return reply({ error: "Escenario desconocido" }, 400);
    let space = await scopeOf(req);
    if (!space) {
      if (action !== "base")
        return reply({ error: "Carga primero el lote inicial." }, 409);
      const created = await newScope(req);
      space = created.space;
      cookie = created.cookie;
    }
    const database = db();
    const count = await database
      .prepare("SELECT COUNT(*) AS n FROM of_runs WHERE scope=?")
      .bind(space.id)
      .first<{ n: number }>();
    if ((count?.n ?? 0) >= 40)
      return reply(
        {
          error:
            "Este espacio alcanzó sus 40 ejecuciones. Se renueva al expirar en 24 horas.",
        },
        429,
        cookie,
      );
    const started = Date.now(),
      runId = crypto.randomUUID(),
      scenario = action as Scenario;
    const batch = fixtures.batches[scenario === "failure" ? "late" : scenario];
    const insertRun = (
      status: string,
      accepted: number,
      duplicates: number,
      rejected: number,
      revision: number,
      message: string,
    ) =>
      database
        .prepare(
          "INSERT INTO of_runs(id,scope,scenario,status,started,duration_ms,accepted,duplicates,rejected,revision,message,batch_hash) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
        )
        .bind(
          runId,
          space!.id,
          scenario,
          status,
          started,
          Date.now() - started,
          accepted,
          duplicates,
          rejected,
          revision,
          message,
          batch.sha256,
        );
    let parsed;
    try {
      parsed = await parseBatch(scenario);
    } catch {
      await insertRun(
        "blocked",
        0,
        0,
        batch.rows,
        space.revision,
        "Esquema incompatible. No se modificaron datos publicados.",
      ).run();
      return reply(await readState(space.id), 200, cookie);
    }
    const existing = (
      await database
        .prepare("SELECT * FROM of_events WHERE scope=?")
        .bind(space.id)
        .all()
    ).results as unknown as Event[];
    const plan = planEvents(parsed.events, existing, parsed.rejections);
    const columns = [
      "kind",
      "entity_id",
      "order_id",
      "version",
      "amount_minor",
      "currency",
      "quantity",
      "unit",
      "event_date",
      "body_hash",
      "raw_json",
      "source_file",
      "source_row",
      "batch_hash",
    ];
    const eventInsert = `INSERT INTO of_events(scope,${columns.join(",")}) SELECT ?,${columns.map((k) => `json_extract(value,'$.${k}')`).join(",")} FROM json_each(?)`;
    const statements = [
      database
        .prepare(
          "INSERT INTO of_guards(id,valid) SELECT ?,CASE WHEN revision=? THEN 1 ELSE 0 END FROM of_spaces WHERE id=?",
        )
        .bind(runId, space.revision, space.id),
      database
        .prepare(eventInsert)
        .bind(space.id, JSON.stringify(plan.accepted)),
      database
        .prepare(
          "INSERT OR IGNORE INTO of_quarantine(scope,source_file,source_row,raw_json,reason) SELECT ?,json_extract(value,'$.source_file'),json_extract(value,'$.source_row'),json_extract(value,'$.raw_json'),json_extract(value,'$.reason') FROM json_each(?)",
        )
        .bind(space.id, JSON.stringify(plan.rejections)),
      database
        .prepare("UPDATE of_spaces SET revision=revision+1 WHERE id=?")
        .bind(space.id),
      insertRun(
        "completed",
        plan.accepted.length,
        plan.duplicates,
        plan.rejections.length,
        space.revision + 1,
        plan.accepted.length
          ? "Lote procesado y conciliación publicada."
          : "Sin hechos nuevos; la reingestión conserva las cifras.",
      ),
      ...(scenario === "failure"
        ? [
            database
              .prepare("UPDATE of_guards SET valid=0 WHERE id=?")
              .bind(runId),
          ]
        : []),
      database.prepare("DELETE FROM of_guards WHERE id=?").bind(runId),
    ];
    try {
      await database.batch(statements);
    } catch (error) {
      const current = await database
        .prepare("SELECT revision FROM of_spaces WHERE id=?")
        .bind(space.id)
        .first<{ revision: number }>();
      if (
        scenario !== "failure" ||
        current?.revision !== space.revision ||
        !String(error).includes("CHECK constraint failed")
      ) {
        console.error("OpsForge transaction", error);
        return reply(
          {
            error:
              "La operación no se publicó. Si otra pestaña cambió el espacio, actualiza y repite el lote.",
          },
          409,
          cookie,
        );
      }
      await insertRun(
        "rolled_back",
        0,
        0,
        0,
        space.revision,
        "Interrupción controlada: la transacción se revirtió; puedes aplicar las llegadas para recuperar.",
      ).run();
    }
    return reply(await readState(space.id), 200, cookie);
  } catch (e) {
    console.error("OpsForge operation", e);
    return reply(
      {
        error:
          "No se pudo completar la operación. La última publicación permanece disponible; intenta nuevamente.",
      },
      503,
      cookie,
    );
  }
}
