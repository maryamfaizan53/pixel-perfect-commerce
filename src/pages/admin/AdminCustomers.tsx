import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Loader2, Search, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { adminCustomers } from "@/lib/adminApi";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";

const pkr = (n: number) => `PKR ${Math.round(n).toLocaleString()}`;
const waLink = (phone: string) => `https://wa.me/${phone.replace(/[^0-9]/g, "").replace(/^0/, "92")}`;

const SORTS = [
  { key: "spent", label: "Top spenders" },
  { key: "orders", label: "Most orders" },
  { key: "recent", label: "Most recent" },
];

export default function AdminCustomers() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [sort, setSort] = useState("spent");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["admin-customers", debouncedQ, sort, page],
    queryFn: () => adminCustomers({ q: debouncedQ || undefined, sort, page, limit: 25 }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="max-w-6xl">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-5">Customers</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email or phone…"
            className="pl-9 h-10 rounded-full"
          />
        </div>
        <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44 h-10 rounded-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
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
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium text-center">Orders</th>
                <th className="px-3 py-3 font-medium text-right">Spent</th>
                <th className="px-3 py-3 font-medium hidden md:table-cell">Last order</th>
                <th className="px-3 py-3 font-medium hidden lg:table-cell">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin inline" />
                </td></tr>
              )}
              {data?.items.length === 0 && !isLoading && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">
                  No customers match this search.
                </td></tr>
              )}
              {data?.items.map((c) => (
                <tr key={c.email} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="text-foreground truncate max-w-[220px]">{c.name || "—"}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[220px]">{c.email}</div>
                  </td>
                  <td className="px-3 py-3 text-center font-medium text-foreground">{c.orders}</td>
                  <td className="px-3 py-3 text-right font-semibold text-foreground whitespace-nowrap">{pkr(c.spent)}</td>
                  <td className="px-3 py-3 text-muted-foreground hidden md:table-cell whitespace-nowrap">
                    {c.lastOrder ? format(parseISO(c.lastOrder), "d MMM yyyy") : "—"}
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell">
                    <OrderStatusBadge status={c.lastStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.phone && (
                      <a
                        href={waLink(c.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-trust hover:underline"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
            <span className="text-muted-foreground">
              {data.total} customers · page {data.page} of {data.pages}
              {isFetching && <Loader2 className="w-3 h-3 animate-spin inline ml-2" />}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((n) => Math.max(1, n - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((n) => n + 1)}
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
