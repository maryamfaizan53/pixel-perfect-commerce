import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { RevenuePoint } from "@/types/admin";

const fmtPKR = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(Math.round(n));

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as RevenuePoint;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-card text-xs">
      <p className="font-semibold text-foreground">{format(parseISO(label), "EEE d MMM")}</p>
      <p className="text-primary font-medium mt-0.5">PKR {p.revenue.toLocaleString()}</p>
      <p className="text-muted-foreground">
        {p.orders} {p.orders === 1 ? "order" : "orders"}
      </p>
    </div>
  );
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const ticks = useMemo(() => {
    if (data.length <= 8) return data.map((d) => d.date);
    const step = Math.ceil(data.length / 6);
    return data.filter((_, i) => i % step === 0).map((d) => d.date);
  }, [data]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-soft">
      <h2 className="text-sm font-semibold text-foreground mb-4">
        Revenue <span className="text-muted-foreground font-normal">· last {data.length} days</span>
      </h2>
      <div className="h-56 sm:h-64 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.28} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              ticks={ticks}
              tickFormatter={(d) => format(parseISO(d), "d MMM")}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              minTickGap={16}
            />
            <YAxis
              tickFormatter={fmtPKR}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary-hover))"
              strokeWidth={2}
              fill="url(#rev-fill)"
              activeDot={{ r: 4, fill: "hsl(var(--primary-hover))", stroke: "hsl(var(--card))", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
