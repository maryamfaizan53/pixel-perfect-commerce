import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Loader2, ChevronLeft, ChevronRight, PackageX, ExternalLink } from "lucide-react";
import { adminProductSummary, adminTopProducts, adminOutOfStock } from "@/lib/adminApi";
import { StatCard } from "@/components/admin/StatCard";
import { cn } from "@/lib/utils";

const RANGES = [
  { key: 7, label: "7 days" },
  { key: 30, label: "30 days" },
  { key: 90, label: "90 days" },
];

const pkr = (n: number) => `PKR ${Math.round(n).toLocaleString()}`;

export default function AdminProducts() {
  const [days, setDays] = useState(30);
  const [page, setPage] = useState(1);

  const summary = useQuery({ queryKey: ["admin-prod-summary"], queryFn: adminProductSummary });
  const top = useQuery({
    queryKey: ["admin-prod-top", days],
    queryFn: () => adminTopProducts(days, 10),
    placeholderData: keepPreviousData,
  });
  const oos = useQuery({
    queryKey: ["admin-prod-oos", page],
    queryFn: () => adminOutOfStock(page, 20),
    placeholderData: keepPreviousData,
  });

  const s = summary.data;

  return (
    <div className="max-w-6xl">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Products</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {summary.isLoading || !s ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card h-24 animate-pulse" />
          ))
        ) : (
          <>
            <StatCard label="Catalogue" value={s.total.toLocaleString()} hint={`${s.categories} categories`} />
            <StatCard label="In stock" value={s.inStock.toLocaleString()} />
            <StatCard label="Out of stock" value={s.outOfStock.toLocaleString()} invert hint="hidden from buyers" />
            <StatCard label="Featured" value={s.featured.toLocaleString()} />
            <StatCard label="With video" value={s.withVideo.toLocaleString()} />
          </>
        )}
      </div>

      {/* Top sellers */}
      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden mb-8">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Top sellers</h2>
          <div className="flex rounded-full border border-border p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setDays(r.key)}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-full transition-colors",
                  days === r.key ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="px-5 py-2.5 font-medium">Product</th>
                <th className="px-3 py-2.5 font-medium text-center">Units</th>
                <th className="px-3 py-2.5 font-medium text-right">Revenue</th>
                <th className="px-3 py-2.5 font-medium text-right hidden sm:table-cell">Price</th>
                <th className="px-5 py-2.5 font-medium">Stock</th>
              </tr>
            </thead>
            <tbody>
              {top.isLoading && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                </td></tr>
              )}
              {top.data?.length === 0 && !top.isLoading && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground text-sm">
                  No sales in this window yet.
                </td></tr>
              )}
              {top.data?.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-border flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-muted flex-shrink-0" />
                      )}
                      {p.slug ? (
                        <Link to={`/product/${p.slug}`} className="text-foreground hover:text-primary truncate max-w-[240px]">
                          {p.title}
                        </Link>
                      ) : (
                        <span className="text-foreground truncate max-w-[240px]">{p.title}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center font-medium text-foreground">{p.qtySold}</td>
                  <td className="px-3 py-3 text-right font-semibold text-foreground whitespace-nowrap">{pkr(p.revenue)}</td>
                  <td className="px-3 py-3 text-right text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                    {p.price != null ? pkr(p.price) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    {p.inStock === false ? (
                      <span className="text-xs font-semibold text-destructive">Out of stock</span>
                    ) : p.inStock ? (
                      <span className="text-xs font-semibold text-trust">In stock</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Out of stock */}
      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <PackageX className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Out of stock</h2>
          {oos.data && <span className="text-xs text-muted-foreground">({oos.data.total})</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="px-5 py-2.5 font-medium">Product</th>
                <th className="px-3 py-2.5 font-medium hidden sm:table-cell">Categories</th>
                <th className="px-3 py-2.5 font-medium text-right">Price</th>
                <th className="px-5 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {oos.isLoading && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                </td></tr>
              )}
              {oos.data?.items.length === 0 && !oos.isLoading && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground text-sm">
                  Everything is in stock. 🎉
                </td></tr>
              )}
              {oos.data?.items.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-border flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-muted flex-shrink-0" />
                      )}
                      <span className="text-foreground truncate max-w-[240px]">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground hidden sm:table-cell truncate max-w-[200px]">
                    {p.categories.join(", ") || "—"}
                  </td>
                  <td className="px-3 py-3 text-right text-muted-foreground whitespace-nowrap">
                    {p.price != null ? pkr(p.price) : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {p.slug && (
                      <Link
                        to={`/product/${p.slug}`}
                        className="text-xs font-semibold text-primary hover:text-primary-hover inline-flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {oos.data && oos.data.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border text-sm">
            <span className="text-muted-foreground">
              page {oos.data.page} of {oos.data.pages}
              {oos.isFetching && <Loader2 className="w-3 h-3 animate-spin inline ml-2" />}
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
                disabled={page >= oos.data.pages}
                className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Product content and stock are managed in{" "}
        <a href="https://aibazar.pk/studio" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Sanity Studio
        </a>
        . This view is read-only.
      </p>
    </div>
  );
}
