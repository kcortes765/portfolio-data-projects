"use client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, monthLabel } from "@/lib/gridops";
export function Trend({
  data,
  compact = false,
  compare = false,
}: {
  data: {
    period: string;
    total: number | null;
    ernc: number | null;
    previous?: number | null;
  }[];
  compact?: boolean;
  compare?: boolean;
}) {
  return (
    <div
      className={compact ? "chart compact" : "chart"}
      role="img"
      aria-label="Evolución mensual de generación total y ERNC en GWh. Los mismos valores se pueden consultar en la tabla de datos."
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        initialDimension={{ width: 640, height: 280 }}
      >
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ top: 12, right: 10, left: compact ? -20 : 0, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id={compact ? "hero-fill" : "chart-fill"}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#2455e8" stopOpacity={0.17} />
              <stop offset="100%" stopColor="#2455e8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e8ecf1" vertical={false} />
          <XAxis
            dataKey="period"
            tickFormatter={(p) => monthLabel(p, data.length > 12)}
            tick={{ fill: "#667286", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            tickFormatter={(n) => format(n)}
            tick={{ fill: "#667286", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={62}
          />
          <Tooltip
            labelFormatter={(label) => monthLabel(String(label))}
            formatter={(v, name) => [
              `${format(Number(v), 1)} GWh`,
              name === "total"
                ? "Total"
                : name === "previous"
                  ? "Año anterior"
                  : "ERNC",
            ]}
            contentStyle={{
              border: "1px solid #dfe4ec",
              borderRadius: 10,
              fontSize: 14,
            }}
          />
          <Area
            type="linear"
            dataKey="total"
            name="total"
            stroke="#2455e8"
            fill={`url(#${compact ? "hero-fill" : "chart-fill"})`}
            strokeWidth={2.5}
            isAnimationActive={false}
          />
          <Area
            type="linear"
            dataKey="ernc"
            name="ernc"
            stroke="#168260"
            fill="transparent"
            strokeWidth={2}
            isAnimationActive={false}
          />
          {compare && (
            <Area
              type="linear"
              dataKey="previous"
              name="previous"
              stroke="#9b6b1e"
              strokeDasharray="5 4"
              fill="transparent"
              strokeWidth={2}
              connectNulls={false}
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
