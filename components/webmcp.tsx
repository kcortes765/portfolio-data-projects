"use client";
import { useEffect, useRef, useLayoutEffect } from "react";
import { flushSync } from "react-dom";
import { dataset, Filters, selectRows, sum, validation } from "@/lib/gridops";
type Tool = {
  name: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown;
};
type Context = {
  registerTool: (
    tool: Tool,
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};
export function useGridTools(
  filters: Filters,
  setFilters: (f: Filters) => void,
) {
  const ref = useRef(filters);
  useLayoutEffect(() => {
    ref.current = filters;
  }, [filters]);
  useEffect(() => {
    const context = (document as Document & { modelContext?: Context })
      .modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const summary = () => {
      const error = validation(ref.current);
      if (error) throw new Error(error);
      const rows = selectRows(ref.current);
      return {
        filters: ref.current,
        rows: rows.length,
        total_mwh: sum(rows),
        ernc_mwh: sum(rows.filter((r) => r.classification === "ERNC")),
        source_sha256: dataset.snapshot,
        cutoff: dataset.quality.last_period,
      };
    };
    const tools: Tool[] = [
      {
        name: "get_gridops_summary",
        description:
          "Read the summary for the currently visible GridOps filters. Uses the published historical CNE snapshot.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: true },
        execute: () => summary(),
      },
      {
        name: "set_gridops_filters",
        description:
          "Set the visible GridOps filters and return the resulting summary. Does not fetch new data or change the published dataset.",
        inputSchema: {
          type: "object",
          properties: {
            start: { type: "string", pattern: "^\\d{4}-\\d{2}$" },
            end: { type: "string", pattern: "^\\d{4}-\\d{2}$" },
            technology: {
              type: "string",
              enum: ["all", ...dataset.technologies],
            },
            subsystem: { type: "string", enum: ["all", "SIC", "SING"] },
            classification: {
              type: "string",
              enum: ["all", "ERNC", "Convencional"],
            },
          },
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: true },
        execute: (input) => {
          if (!input || typeof input !== "object" || Array.isArray(input))
            throw new Error("Expected an object");
          for (const [k, v] of Object.entries(input)) {
            if (
              ![
                "start",
                "end",
                "technology",
                "subsystem",
                "classification",
              ].includes(k) ||
              typeof v !== "string"
            )
              throw new Error("Unsupported filter");
          }
          const next = { ...ref.current, ...input } as Filters;
          const error = validation(next);
          if (error) throw new Error(error);
          flushSync(() => setFilters(next));
          ref.current = next;
          return summary();
        },
      },
    ];
    for (const tool of tools) {
      try {
        void Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {
        /* WebMCP is progressive enhancement; normal controls remain available. */
      }
    }
    return () => lifecycle.abort();
  }, [setFilters]);
}
