import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { adminOrders } from "@/lib/adminApi";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/types/admin";

const STATUS_TABS = ["all", ...ORDER_STATUSES] as const;

export default function AdminOrders() {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "all";
  const paymentStatus = params.get("paymentStatus") || "all";
  const page = Number(params.get("page") || 1);
  const [q, setQ] = useState(params.get("q") || "");

  // debounce search → url
  useEffect(() => {
    const t = setTimeout(() => {
      setParams((prev) => {
        const n = new URLSearchParams(prev);
        q ? n.set("q", q) : n.delete("q");
        n.set("page", "1");
        return n;
      });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const patch = (k: string, v: string) =>
    setParams((prev) => {
      const n = new URLSearchParams(prev);
      v && v !== "all" ? n.set(k, v) : n.delete(k);
      if (k !== "page") n.set("page", "1");
      return n;
    });

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["admin-orders", status, paymentStatus, params.get("q"), page],
    queryFn: () =>
      adminOrders({ status, paymentStatus, q: params.get("q") || undefined, page, limit: 20 }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="max-w-6xl">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-5">Orders</h1>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none mb-4 -mx-1 px-1">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => patch("status", s)}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap capitalize transition-colors",
              status === s ? "bg-secondary text-secondary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search order #, email or name…"
            className="pl-9 h-10 rounded-full"
          />
        </div>
        <Select value={paymentStatus} onValueChange={(v) => patch("paymentStatus", v)}>
          <SelectTrigger className="w-full sm:w-44 h-10 rounded-full">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            {PAYMENT_STATUSES.map((p) => (
              <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive mb-4">
          {(error as Error)?.message}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-3 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium hidden md:table-cell">Date</th>
                <th className="px-3 py-3 font-medium text-center hidden sm:table-cell">Items</th>
                <th className="px-3 py-3 font-medium text-right">Total</th>
                <th className="px-3 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin inline" />
                </td></tr>
              )}
              {data?.items.length === 0 && !isLoading && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">
                  No orders match these filters.
                </td></tr>
              )}
              {data?.items.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <Link to={`/admin/orders/${o.id}`} className="font-semibold text-foreground hover:text-primary">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-foreground truncate max-w-[180px]">{o.customerName || "—"}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[180px]">{o.email}</div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground hidden md:table-cell whitespace-nowrap">
                    {o.createdAt ? format(parseISO(o.createdAt), "d MMM yyyy, HH:mm") : ""}
                  </td>
                  <td className="px-3 py-3 text-center text-muted-foreground hidden sm:table-cell">{o.itemCount}</td>
                  <td className="px-3 py-3 text-right font-medium text-foreground whitespace-nowrap">
                    {o.currency} {o.total.toLocaleString()}
                  </td>
                  <td className="px-3 py-3">
                    <OrderStatusBadge status={o.paymentStatus} kind="payment" />
                  </td>
                  <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
            <span className="text-muted-foreground">
              {data.total} orders · page {data.page} of {data.pages}
              {isFetching && <Loader2 className="w-3 h-3 animate-spin inline ml-2" />}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => patch("page", String(page - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => patch("page", String(page + 1))}
                disabled={page >= data.pages}
                className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
