import fixture from "./fixtures.json";
export const fixtures = fixture;
export type Kind = "order" | "invoice" | "delivery";
export type Event = {
  kind: Kind;
  entity_id: string;
  order_id: string;
  version: number;
  amount_minor: number;
  currency: "CLP" | "USD";
  quantity: number;
  unit: "ea" | "kg";
  event_date: string;
  body_hash: string;
  raw_json: string;
  source_file: string;
  source_row: number;
  batch_hash: string;
};
export type Rejection = {
  source_file: string;
  source_row: number;
  raw_json: string;
  reason: string;
};
export type Scenario = "base" | "late" | "conflict" | "schema" | "failure";
export const scenarios = [
  {
    id: "base",
    label: "Cargar / repetir lote inicial",
    description:
      "Pedidos, facturas y entregas con diferencias y dos filas inválidas.",
  },
  {
    id: "failure",
    label: "Interrumpir una carga",
    description: "Intenta aplicar llegadas tardías y provoca un rollback real.",
  },
  {
    id: "late",
    label: "Aplicar llegadas y correcciones",
    description: "Completa documentos pendientes y agrega nuevas revisiones.",
  },
  {
    id: "conflict",
    label: "Probar conflicto de versión",
    description:
      "Mismo documento y versión, pero distinto importe: cuarentena.",
  },
  {
    id: "schema",
    label: "Probar esquema incompatible",
    description: "Falta una columna obligatoria: se rechaza el lote completo.",
  },
] as const;
export async function sha256(text: string) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(hash), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export const eventKey = (e: Pick<Event, "kind" | "entity_id" | "version">) =>
  `${e.kind}:${e.entity_id}:${e.version}`;
export function parseCsv(csv: string): string[][] {
  const records: string[][] = [];
  let row: string[] = [],
    value = "",
    quoted = false;
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (c === '"') {
      if (quoted && csv[i + 1] === '"') {
        value += '"';
        i++;
      } else if (!quoted && value !== "")
        throw Error("Comillas en una celda inválida");
      else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(value);
      value = "";
    } else if (c === "\n" && !quoted) {
      row.push(value.replace(/\r$/, ""));
      records.push(row);
      row = [];
      value = "";
    } else value += c;
  }
  if (quoted) throw Error("CSV sin cierre de comillas");
  if (row.length || value) {
    row.push(value);
    records.push(row);
  }
  return records;
}
export async function parseBatch(scenario: Scenario) {
  const batch = fixtures.batches[scenario === "failure" ? "late" : scenario];
  if ((await sha256(batch.csv)) !== batch.sha256)
    throw Error("El hash del archivo no coincide");
  const [header, ...rows] = parseCsv(batch.csv);
  if (JSON.stringify(header) !== JSON.stringify(fixtures.fields))
    throw Error(
      "Esquema incompatible: columnas obligatorias ausentes o fuera de contrato",
    );
  const events: Event[] = [],
    rejections: Rejection[] = [];
  for (const [index, cells] of rows.entries()) {
    const raw = Object.fromEntries(header.map((k, i) => [k, cells[i] ?? ""]));
    const raw_json = JSON.stringify(raw);
    const source_row = index + 2;
    const reject = (reason: string) =>
      rejections.push({
        source_file: batch.file,
        source_row,
        raw_json,
        reason,
      });
    if (cells.length !== header.length) {
      reject("Número de columnas inválido");
      continue;
    }
    if (
      !["order", "invoice", "delivery"].includes(raw.kind) ||
      !/^\w[\w-]{0,40}$/.test(raw.entity_id) ||
      !/^PED-\d{4}$/.test(raw.order_id)
    ) {
      reject("Tipo o identificador inválido");
      continue;
    }
    if (
      raw.kind === "order" &&
      raw.entity_id !== `O-${raw.order_id.slice(4)}`
    ) {
      reject("Identidad del pedido inconsistente");
      continue;
    }
    if (
      !["CLP", "USD"].includes(raw.currency) ||
      !["ea", "kg"].includes(raw.unit)
    ) {
      reject("Moneda o unidad fuera de contrato");
      continue;
    }
    if (
      !/^[1-9]\d{0,4}$/.test(raw.version) ||
      !/^\d{1,12}$/.test(raw.amount_minor) ||
      !/^\d{1,6}$/.test(raw.quantity) ||
      Number(raw.quantity) === 0
    ) {
      reject("Importe, cantidad o versión inválidos");
      continue;
    }
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(raw.event_date) ||
      !Number.isFinite(Date.parse(raw.event_date)) ||
      new Date(raw.event_date).toISOString().slice(0, 10) !== raw.event_date
    ) {
      reject("Fecha inválida");
      continue;
    }
    if (raw.kind === "delivery" && raw.amount_minor !== "0") {
      reject("Una entrega no tiene importe monetario");
      continue;
    }
    events.push({
      ...raw,
      kind: raw.kind as Kind,
      currency: raw.currency as Event["currency"],
      unit: raw.unit as Event["unit"],
      version: Number(raw.version),
      quantity: Number(raw.quantity),
      amount_minor: Number(raw.amount_minor),
      body_hash: await sha256(raw_json),
      raw_json,
      source_file: batch.file,
      source_row,
      batch_hash: batch.sha256,
    } as Event);
  }
  return { batch, events, rejections };
}
export function planEvents(
  incoming: Event[],
  existing: Event[],
  invalid: Rejection[],
) {
  const seen = new Map(existing.map((e) => [eventKey(e), e.body_hash]));
  const accepted: Event[] = [],
    rejections = [...invalid];
  let duplicates = 0;
  for (const event of incoming) {
    const key = eventKey(event),
      prior = seen.get(key);
    if (prior === event.body_hash) {
      duplicates++;
      continue;
    }
    if (prior) {
      rejections.push({
        source_file: event.source_file,
        source_row: event.source_row,
        raw_json: event.raw_json,
        reason: "Conflicto: misma identidad y versión con contenido distinto",
      });
      continue;
    }
    seen.set(key, event.body_hash);
    accepted.push(event);
  }
  return { accepted, rejections, duplicates };
}
export type Reconciled = {
  order_id: string;
  currency: string;
  unit: string;
  ordered_minor: number;
  invoiced_minor: number;
  ordered_qty: number;
  delivered_qty: number;
  invoice_count: number;
  delivery_count: number;
  currency_mismatch: number;
  unit_mismatch: number;
  amount_delta: number;
  quantity_delta: number;
  status: string;
  event_date: string;
};
export function summarize(rows: Reconciled[]) {
  return {
    orders: rows.length,
    matched: rows.filter((r) => r.status === "matched").length,
    open: rows.filter((r) => r.status !== "matched").length,
    currencies: ["CLP", "USD"].map((currency) => ({
      currency,
      ordered_minor: rows
        .filter((r) => r.currency === currency)
        .reduce((a, r) => a + r.ordered_minor, 0),
      difference_minor: rows
        .filter((r) => r.currency === currency && !r.currency_mismatch)
        .reduce((a, r) => a + Math.abs(r.amount_delta), 0),
    })),
  };
}
export const labels: Record<string, string> = {
  matched: "Conciliado",
  missing_invoice: "Sin factura",
  missing_delivery: "Sin entrega",
  currency: "Moneda distinta",
  unit: "Unidad distinta",
  amount: "Importe distinto",
  quantity: "Cantidad distinta",
};
export function money(minor: number, currency: string) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "CLP" ? 0 : 2,
  }).format(minor / (currency === "USD" ? 100 : 1));
}
export function csvExport(rows: Reconciled[]) {
  const fields = [
    "order_id",
    "currency",
    "unit",
    "ordered_minor",
    "invoiced_minor",
    "amount_delta",
    "ordered_qty",
    "delivered_qty",
    "quantity_delta",
    "status",
  ] as const;
  const escape = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
  return (
    "\ufeff" +
    [
      fields.join(","),
      ...rows.map((r) => fields.map((k) => escape(r[k])).join(",")),
    ].join("\r\n") +
    "\r\n"
  );
}
