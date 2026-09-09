import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-violet-100 text-violet-800 border-violet-200",
  shipped: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-800 border-rose-200",
  refunded: "bg-slate-100 text-slate-700 border-slate-200",
};

const PAY_STYLES: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  unpaid: "bg-slate-100 text-slate-600 border-slate-200",
  failed: "bg-rose-100 text-rose-800 border-rose-200",
  refunded: "bg-slate-100 text-slate-700 border-slate-200",
};

export function OrderStatusBadge({ status, kind = "order" }: { status: string; kind?: "order" | "payment" }) {
  const map = kind === "payment" ? PAY_STYLES : STYLES;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
        map[status] || "bg-slate-100 text-slate-700 border-slate-200",
      )}
    >
      {status}
    </span>
  );
}
