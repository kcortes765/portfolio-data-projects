import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const source = readFileSync(
  new URL("../lib/gridops.ts", import.meta.url),
  "utf8",
);
const data = JSON.parse(
  readFileSync(
    new URL("../lib/generated/dataset.json", import.meta.url),
    "utf8",
  ),
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
}).outputText;
const sandbox = {
  exports: {},
  require(name) {
    assert.equal(name, "@/lib/generated/dataset.json");
    return data;
  },
  Intl,
  Date,
};
vm.runInNewContext(compiled, sandbox);
const m = sandbox.exports;
assert.equal(m.validation(m.defaults), null);
assert.ok(m.validation({ ...m.defaults, start: "2026-02", end: "2025-01" }));
assert.equal(m.previousYear("2024-02"), "2023-02");
const selected = m.selectRows({
  start: "2025-01",
  end: "2025-12",
  technology: "Solar Fotovoltaica",
  subsystem: "SING",
  classification: "all",
});
assert.equal(selected.length, 12);
assert.ok(Math.abs(m.sum(selected) - 7961754.9109883368) < 0.00001);
const fixture = {
  period: "2025-01",
  technology: '=HYPERLINK("bad")',
  subsystem: "SING",
  classification: "ERNC",
  mwh: -3.16,
  source_rows: 1,
  plant_codes: 1,
};
const exported = m.csv([fixture]);
assert.ok(exported.startsWith("\uFEFF"));
assert.ok(exported.includes('"\'=HYPERLINK(""bad"")"'));
assert.ok(exported.includes('"-3.16"'));
const monthly = m.monthly([
  fixture,
  { ...fixture, classification: "Convencional", mwh: 1003.16 },
]);
assert.equal(monthly[0].total, 1);
assert.equal(monthly[0].ernc, -0.00316);
assert.equal(
  m.selectRows({
    ...m.defaults,
    technology: "Solar Fotovoltaica",
    classification: "Convencional",
  }).length,
  0,
);
const comparisonFilters = {
  start: "2025-01",
  end: "2025-02",
  technology: "all",
  subsystem: "all",
  classification: "all",
};
const history = [
  { ...fixture, period: "2024-01", mwh: 10 },
  { ...fixture, period: "2024-02", mwh: 20 },
];
const present = [
  { ...fixture, period: "2025-01", mwh: 20 },
  { ...fixture, period: "2025-02", mwh: 40 },
];
assert.equal(m.yearComparison(comparisonFilters, present, history).delta, 100);
assert.equal(
  m.yearComparison(comparisonFilters, present, history.slice(0, 1)).delta,
  null,
);
assert.equal(
  m.yearComparison(comparisonFilters, present.slice(0, 1), history).delta,
  null,
);
assert.equal(
  m.yearComparison(
    comparisonFilters,
    present,
    history.map((r) => ({ ...r, mwh: 0 })),
  ).delta,
  null,
);
console.log(
  "Metrics checks passed: filters, independent source total, units, ERNC denominator inputs, invalid dates, CSV escaping/formula protection and preserved negative number.",
);
console.log(
  "Year comparison: full matching months required; incomplete current/prior periods and zero baseline produce no percentage.",
);
