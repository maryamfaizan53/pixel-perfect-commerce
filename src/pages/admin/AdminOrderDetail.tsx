import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Wallet,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Copy,
} from "lucide-react";
import { adminOrder, adminPatchOrder } from "@/lib/adminApi";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { OrderPatch } from "@/types/admin";
import { format, parseISO } from "date-fns";

export default function AdminOrderDetail() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => adminOrder(id),
  });

  const [shipOpen, setShipOpen] = useState(false);
  const [tracking, setTracking] = useState("");
  const [note, setNote] = useState("");
  const [adminNote, setAdminNote] = useState<string | null>(null);

  const mutate = useMutation({
    mutationFn: (patch: OrderPatch) => adminPatchOrder(id, patch),
    onSuccess: (fresh) => {
      qc.setQueryData(["admin-order", id], fresh);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-recent"] });
      toast.success("Order updated");
      setShipOpen(false);
      setNote("");
    },
    onError: (e: Error) => toast.error(e.message || "Update failed"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }
  if (isError || !order) {
    return (
      <div className="max-w-md">
        <p className="text-sm text-muted-foreground mb-4">Order not found.</p>
        <Button asChild variant="outline" size="sm"><Link to="/admin/orders"><ArrowLeft className="w-4 h-4 mr-2" />Back to orders</Link></Button>
      </div>
    );
  }

  const a = order.shippingAddress || {};
  const money = (n: number) => `${order.currency} ${n.toLocaleString()}`;
  const setStatus = (status: string, patch: Partial<OrderPatch> = {}) =>
    mutate.mutate({ status, note: note || undefined, ...patch });
  const busy = mutate.isPending;

  const addressText = [a.fullName, a.phone, a.line1, a.line2, [a.city, a.province, a.postalCode].filter(Boolean).join(", "), a.country]
    .filter(Boolean)
    .join("\n");

  // context-aware primary actions
  const actions: { label: string; icon: any; onClick: () => void; variant?: "default" | "outline" | "secondary" }[] = [];
  if (order.status === "pending") actions.push({ label: "Confirm order", icon: CheckCircle2, onClick: () => setStatus("confirmed") });
  if (order.status === "confirmed") actions.push({ label: "Start processing", icon: Package, onClick: () => setStatus("processing") });
  if (["confirmed", "processing"].includes(order.status))
    actions.push({ label: "Mark shipped", icon: Truck, onClick: () => setShipOpen(true) });
  if (order.status === "shipped") actions.push({ label: "Mark delivered", icon: CheckCircle2, onClick: () => setStatus("delivered") });

  const canCancel = !["delivered", "cancelled", "refunded"].includes(order.status);

  return (
    <div className="max-w-4xl">
      <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {order.createdAt ? format(parseISO(order.createdAt), "d MMMM yyyy, HH:mm") : ""} · {money(order.total)}
          </p>
        </div>
        <div className="flex gap-2">
          <OrderStatusBadge status={order.status} />
          <OrderStatusBadge status={order.paymentStatus} kind="payment" />
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-soft mb-4">
        <div className="flex flex-wrap gap-2">
          {actions.map((act) => (
            <Button key={act.label} size="sm" onClick={act.onClick} disabled={busy}>
              <act.icon className="w-4 h-4 mr-1.5" /> {act.label}
            </Button>
          ))}
          {canCancel && (
            <Button
              size="sm"
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={() => {
                if (confirm("Cancel this order? The customer is not emailed.")) setStatus("cancelled");
              }}
              disabled={busy}
            >
              <XCircle className="w-4 h-4 mr-1.5" /> Cancel
            </Button>
          )}
          {["delivered", "cancelled"].includes(order.status) && order.paymentStatus === "paid" && (
            <Button size="sm" variant="outline" onClick={() => { if (confirm("Mark as refunded?")) setStatus("refunded", { paymentStatus: "refunded" }); }} disabled={busy}>
              <RotateCcw className="w-4 h-4 mr-1.5" /> Refund
            </Button>
          )}
          {busy && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground self-center" />}
        </div>
        {order.trackingNumber && (
          <p className="mt-3 text-xs text-muted-foreground">
            Tracking: <span className="font-mono text-foreground">{order.trackingNumber}</span>
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {/* Customer / address */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="w-4 h-4 text-muted-foreground" /> Customer
            </h2>
            <button
              onClick={() => { navigator.clipboard.writeText(addressText); toast.success("Address copied"); }}
              className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              <Copy className="w-3 h-3" /> Copy
            </button>
          </div>
          <div className="text-sm text-muted-foreground space-y-0.5">
            <p className="font-medium text-foreground">{a.fullName || order.customerName}</p>
            <p>{order.email}</p>
            {a.phone && <p>{a.phone}</p>}
            {a.line1 && <p className="pt-1">{a.line1}</p>}
            {a.line2 && <p>{a.line2}</p>}
            <p>{[a.city, a.province, a.postalCode].filter(Boolean).join(", ")}</p>
            <p>{a.country || "Pakistan"}</p>
          </div>
          {a.phone && (
            <a
              href={`https://wa.me/${(a.phone || "").replace(/[^\d]/g, "").replace(/^0/, "92")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-trust hover:underline"
            >
              <Truck className="w-3.5 h-3.5" /> WhatsApp customer
            </a>
          )}
        </div>

        {/* Payment */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <Wallet className="w-4 h-4 text-muted-foreground" /> Payment
          </h2>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between"><span>Method</span><span className="font-medium text-foreground">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Card / Wallet"}</span></div>
            <div className="flex justify-between"><span>Status</span><OrderStatusBadge status={order.paymentStatus} kind="payment" /></div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {order.paymentStatus !== "paid" && (
              <Button size="sm" variant="outline" onClick={() => mutate.mutate({ paymentStatus: "paid" })} disabled={busy}>Mark paid</Button>
            )}
            {order.paymentStatus === "paid" && (
              <Button size="sm" variant="outline" onClick={() => mutate.mutate({ paymentStatus: "unpaid" })} disabled={busy}>Mark unpaid</Button>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft mb-4">
        <h2 className="text-sm font-semibold text-foreground mb-4">{order.items.length} {order.items.length === 1 ? "item" : "items"}</h2>
        <div className="space-y-3">
          {order.items.map((it, i) => (
            <div key={i} className="flex gap-3">
              {it.imageUrl && <img src={it.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover border border-border flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                {it.productSlug ? (
                  <Link to={`/product/${it.productSlug}`} target="_blank" className="text-sm font-medium text-foreground hover:text-primary line-clamp-2">{it.productTitle}</Link>
                ) : (
                  <p className="text-sm font-medium text-foreground line-clamp-2">{it.productTitle}</p>
                )}
                {it.variantTitle && <p className="text-xs text-muted-foreground">{it.variantTitle}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">{it.quantity} × {money(it.price)}</p>
              </div>
              <p className="text-sm font-semibold text-foreground">{money(it.total)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-4 pt-3 space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span>{order.shippingFee === 0 ? "FREE" : money(order.shippingFee)}</span></div>
          <div className="flex justify-between font-bold text-foreground pt-1"><span>Total</span><span>{money(order.total)}</span></div>
        </div>
        {order.notes && (
          <p className="mt-3 text-xs text-muted-foreground"><span className="font-medium text-foreground">Customer note:</span> {order.notes}</p>
        )}
      </div>

      {/* History + internal notes */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-semibold text-foreground mb-3">History</h2>
          <ol className="space-y-3">
            {order.statusHistory.length === 0 && <li className="text-xs text-muted-foreground">No status changes yet.</li>}
            {order.statusHistory.map((h, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-foreground capitalize">{h.status}</span>
                  {h.note && <span className="text-muted-foreground"> — {h.note}</span>}
                  <p className="text-xs text-muted-foreground">{h.createdAt ? format(parseISO(h.createdAt), "d MMM, HH:mm") : ""}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-semibold text-foreground mb-3">Internal note</h2>
          <Textarea
            rows={4}
            value={adminNote ?? order.adminNotes ?? ""}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Only visible here."
            className="text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            disabled={busy || adminNote === null || adminNote === (order.adminNotes ?? "")}
            onClick={() => mutate.mutate({ adminNotes: adminNote ?? "" })}
          >
            Save note
          </Button>
        </div>
      </div>

      {/* Ship dialog */}
      <Dialog open={shipOpen} onOpenChange={setShipOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mark as shipped</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Tracking number (optional)</label>
              <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="e.g. TCS-123456789" className="mt-1.5" />
            </div>
            <p className="text-xs text-muted-foreground">
              The customer will get a "your order has shipped" email{tracking ? " including this tracking number" : ""}.
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
            <Button
              size="sm"
              disabled={busy}
              onClick={() => setStatus("shipped", { trackingNumber: tracking || undefined })}
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm shipped"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
