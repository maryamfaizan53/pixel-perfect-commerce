import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertTriangle } from "lucide-react";
import { adminStats, adminRevenue, adminOrders } from "@/lib/adminApi";
import { StatCard } from "@/components/admin/StatCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { StatWindow } from "@/types/admin";

const RANGES = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
  { key: "all", label: "All time", days: 90 },
];

const pct = (cur: number, prev: number): number | null => {
  if (!prev) return null;
  return ((cur - prev) / prev) * 100;
};
const pkr = (n: number) => `PKR ${Math.round(n).toLocaleString()}`;

export default function AdminOverview() {
  const [range, setRange] = useState("30d");
  const days = RANGES.find((r) => r.key === range)?.days ?? 30;

  const stats = useQuery({ queryKey: ["admin-stats", range], queryFn: () => adminStats(range) });
  const revenue = useQuery({ queryKey: ["admin-revenue", days], queryFn: () => adminRevenue(days) });
  const recent = useQuery({
    queryKey: ["admin-recent"],
    queryFn: () => adminOrders({ limit: 8, sort: "created_at.desc" }),
  });

  const c: StatWindow | undefined = stats.data?.current;
  const p: StatWindow | undefined = stats.data?.previous;
  const isAll = range === "all";

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Overview</h1>
        <div className="flex rounded-full border border-border bg-card p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-full transition-colors",
                range === r.key ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {stats.isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive mb-6">
          Couldn't load stats. {(stats.error as Error)?.message}
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {stats.isLoading || !c ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card h-28 animate-pulse" />
          ))
        ) : (
          <>
            <StatCard label="Revenue" value={pkr(c.revenue)} delta={isAll ? null : pct(c.revenue, p!.revenue)} hint={`${c.liveOrderCount} orders`} />
            <StatCard label="Orders" value={String(c.orderCount)} delta={isAll ? null : pct(c.orderCount, p!.orderCount)} />
            <StatCard label="Avg order" value={pkr(c.aov)} delta={isAll ? null : pct(c.aov, p!.aov)} />
            <StatCard label="Pending" value={String(c.pendingCount)} invert hint="need action" />
            <StatCard label="Customers" value={String(c.newCustomers)} delta={isAll ? null : pct(c.newCustomers, p!.newCustomers)} />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="lg:col-span-2">
          {revenue.isLoading ? (
            <div className="rounded-2xl border border-border bg-card h-72 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <RevenueChart data={revenue.data ?? []} />
          )}
        </div>

        <div className="space-y-4">
          {/* Payment split */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-foreground mb-3">Payment method</h2>
            {c && (
              <div className="space-y-2 text-sm">
                <Row label="Cash on Delivery" value={c.codCount} total={c.orderCount} />
                <Row label="Card / Wallet" value={c.onlineCount} total={c.orderCount} />
                <div className="pt-2 mt-2 border-t border-border flex justify-between text-xs text-muted-foreground">
                  <span>Paid</span>
                  <span>{c.paidCount} · {c.unpaidCount} unpaid</span>
                </div>
              </div>
            )}
          </div>

          {/* By status */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-foreground mb-3">By status</h2>
            <div className="space-y-1.5">
              {c && Object.entries(c.byStatus).length === 0 && (
                <p className="text-xs text-muted-foreground">No orders in this range.</p>
              )}
              {c &&
                Object.entries(c.byStatus)
                  .sort((a, b) => b[1] - a[1])
                  .map(([s, n]) => (
                    <div key={s} className="flex items-center justify-between">
                      <OrderStatusBadge status={s} />
                      <span className="text-sm font-semibold text-foreground">{n}</span>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>

      {/* Attention */}
      {c && c.pendingCount > 0 && (
        <Link
          to="/admin/orders?status=pending"
          className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-6 hover:bg-amber-100/70 transition-colors"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-900">
            <strong>{c.pendingCount}</strong> {c.pendingCount === 1 ? "order is" : "orders are"} pending — review and confirm them.
          </p>
        </Link>
      )}

      {/* Recent orders */}
      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Recent orders</h2>
          <Link to="/admin/orders" className="text-xs font-semibold text-primary hover:text-primary-hover">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="px-5 py-2.5 font-medium">Order</th>
                <th className="px-3 py-2.5 font-medium">Customer</th>
                <th className="px-3 py-2.5 font-medium hidden sm:table-cell">Date</th>
                <th className="px-3 py-2.5 font-medium text-right">Total</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.isLoading && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                </td></tr>
              )}
              {recent.data?.items.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <Link to={`/admin/orders/${o.id}`} className="font-semibold text-foreground hover:text-primary">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground truncate max-w-[160px]">
                    {o.customerName || o.email}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground hidden sm:table-cell">
                    {o.createdAt ? format(parseISO(o.createdAt), "d MMM, HH:mm") : ""}
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-foreground">
                    {o.currency} {o.total.toLocaleString()}
                  </td>
                  <td className="px-5 py-3"><OrderStatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, total }: { label: string; value: number; total: number }) {
  const w = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}
