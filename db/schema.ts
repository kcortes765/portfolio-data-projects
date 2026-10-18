import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  check,
  index,
} from "drizzle-orm/sqlite-core";
export const spaces = sqliteTable(
  "of_spaces",
  {
    id: text("id").primaryKey(),
    created: integer("created").notNull(),
    expires: integer("expires").notNull(),
    revision: integer("revision").notNull().default(0),
  },
  (t) => [index("of_spaces_expiry").on(t.expires)],
);
export const events = sqliteTable(
  "of_events",
  {
    scope: text("scope")
      .notNull()
      .references(() => spaces.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    entity_id: text("entity_id").notNull(),
    order_id: text("order_id").notNull(),
    version: integer("version").notNull(),
    amount_minor: integer("amount_minor").notNull(),
    currency: text("currency").notNull(),
    quantity: integer("quantity").notNull(),
    unit: text("unit").notNull(),
    event_date: text("event_date").notNull(),
    body_hash: text("body_hash").notNull(),
    raw_json: text("raw_json").notNull(),
    source_file: text("source_file").notNull(),
    source_row: integer("source_row").notNull(),
    batch_hash: text("batch_hash").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.scope, t.kind, t.entity_id, t.version] }),
    index("of_events_order").on(t.scope, t.order_id),
    check("of_events_version", sql`${t.version}>0`),
    check("of_events_amount", sql`${t.amount_minor}>=0`),
    check("of_events_quantity", sql`${t.quantity}>0`),
  ],
);
export const runs = sqliteTable(
  "of_runs",
  {
    id: text("id").primaryKey(),
    scope: text("scope")
      .notNull()
      .references(() => spaces.id, { onDelete: "cascade" }),
    scenario: text("scenario").notNull(),
    status: text("status").notNull(),
    started: integer("started").notNull(),
    duration_ms: integer("duration_ms").notNull(),
    accepted: integer("accepted").notNull(),
    duplicates: integer("duplicates").notNull(),
    rejected: integer("rejected").notNull(),
    revision: integer("revision").notNull(),
    message: text("message").notNull(),
    batch_hash: text("batch_hash").notNull(),
  },
  (t) => [index("of_runs_scope_time").on(t.scope, t.started)],
);
export const quarantine = sqliteTable(
  "of_quarantine",
  {
    scope: text("scope")
      .notNull()
      .references(() => spaces.id, { onDelete: "cascade" }),
    source_file: text("source_file").notNull(),
    source_row: integer("source_row").notNull(),
    raw_json: text("raw_json").notNull(),
    reason: text("reason").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.scope, t.source_file, t.source_row, t.reason] }),
  ],
);
export const guards = sqliteTable(
  "of_guards",
  { id: text("id").primaryKey(), valid: integer("valid").notNull() },
  (t) => [check("of_guards_valid", sql`${t.valid}=1`)],
);
