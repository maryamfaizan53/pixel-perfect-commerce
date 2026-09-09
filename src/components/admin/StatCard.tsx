import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  /** percent change vs previous period; omit to hide */
  delta?: number | null;
  hint?: string;
  /** for a delta where "down is good" (e.g. cancellations) */
  invert?: boolean;
}

export function StatCard({ label, value, delta, hint, invert }: StatCardProps) {
  const show = delta !== undefined && delta !== null && Number.isFinite(delta);
  const up = (delta ?? 0) >= 0;
  const good = invert ? !up : up;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-soft">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground tracking-tight">{value}</p>
      <div className="mt-1 flex items-center gap-1.5 text-xs">
        {show ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-semibold",
              good ? "text-trust" : "text-destructive",
            )}
          >
            {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {Math.abs(delta as number).toFixed(0)}%
          </span>
        ) : null}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
