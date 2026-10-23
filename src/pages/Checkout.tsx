import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, Truck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { getQuote, createOrder, getSiteSettings } from "@/lib/api";
import type { Quote } from "@/types/catalog";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { useSEO } from "@/hooks/useSEO";

const PROVINCES = ["Sindh", "Punjab", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "Azad Kashmir"];

const Checkout = () => {
  useSEO({ title: "Checkout | AI Bazar", description: "Complete your order.", canonical: "https://www.aibazar.pk/checkout" });
  const navigate = useNavigate();
  const { items, toLines, clearCart } = useCartStore();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [onlineEnabled, setOnlineEnabled] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    province: "Sindh",
    postalCode: "",
    notes: "",
    paymentMethod: "cod" as "cod" | "online",
  });

  const lines = useMemo(() => toLines(), [items]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart", { replace: true });
      return;
    }
    setLoadingQuote(true);
    Promise.all([getQuote(lines), getSiteSettings().catch(() => null)])
      .then(([q, s]) => {
        setQuote(q);
        setOnlineEnabled(!!s?.onlinePaymentEnabled);
        if (q.issues.length) q.issues.forEach((i) => toast.warning(i));
      })
      .catch(() => toast.error("Could not price your cart. Please try again."))
      .finally(() => setLoadingQuote(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const invalid = {
    email: !form.email.includes("@"),
    fullName: form.fullName.trim().length <= 2,
    phone: !/^0?3\d{9}$/.test(form.phone.replace(/\s|-/g, "")),
    line1: form.line1.trim().length <= 4,
    city: form.city.trim().length <= 1,
  };
  const canSubmit = !!quote?.valid && !Object.values(invalid).some(Boolean);

  const missing = [
    invalid.email && "a valid email address",
    invalid.fullName && "your full name",
    invalid.phone && "a valid phone number (03XXXXXXXXX)",
    invalid.line1 && "your delivery address",
    invalid.city && "your city",
  ].filter(Boolean) as string[];

  const submit = async () => {
    if (!canSubmit || !quote) {
      setAttempted(true);
      toast.error("Please complete the required fields to place your order.");
      return;
    }
    setSubmitting(true);
    try {
      trackMetaEvent("AddPaymentInfo", { value: quote.total, currency: "PKR", num_items: items.length });
      const res = await createOrder({
        email: form.email.trim(),
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim() || undefined,
        address: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          line1: form.line1.trim(),
          line2: form.line2.trim() || undefined,
          city: form.city.trim(),
          province: form.province,
          postalCode: form.postalCode.trim() || undefined,
          country: "Pakistan",
        },
        lines,
      });
      trackMetaEvent("Purchase", { value: quote.total, currency: "PKR", num_items: items.length });
      clearCart();
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        navigate(`/order/${res.orderId}?placed=1`, { replace: true });
      }
    } catch (e) {
      console.error(e);
      toast.error("Order failed. Please try again or contact support on WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 pt-28 sm:pt-32 pb-16">
        <div className="container-custom max-w-5xl">
          <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to cart
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            {/* form */}
            <div className="space-y-6">
              <section className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
                <h2 className="font-bold text-slate-900">Contact & delivery</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label htmlFor="co-email" className="block text-xs font-medium text-slate-600 mb-1">Email address</label>
                    <Input id="co-email" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} aria-invalid={attempted && invalid.email} />
                  </div>
                  <div>
                    <label htmlFor="co-name" className="block text-xs font-medium text-slate-600 mb-1">Full name</label>
                    <Input id="co-name" placeholder="e.g. Ali Khan" value={form.fullName} onChange={set("fullName")} aria-invalid={attempted && invalid.fullName} />
                  </div>
                  <div>
                    <label htmlFor="co-phone" className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                    <Input id="co-phone" placeholder="03XXXXXXXXX" value={form.phone} onChange={set("phone")} inputMode="tel" aria-invalid={attempted && invalid.phone} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="co-line1" className="block text-xs font-medium text-slate-600 mb-1">Address line 1</label>
                    <Input id="co-line1" placeholder="House / street" value={form.line1} onChange={set("line1")} aria-invalid={attempted && invalid.line1} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="co-line2" className="block text-xs font-medium text-slate-600 mb-1">Address line 2 <span className="text-slate-400">(optional)</span></label>
                    <Input id="co-line2" placeholder="Area / landmark" value={form.line2} onChange={set("line2")} />
                  </div>
                  <div>
                    <label htmlFor="co-city" className="block text-xs font-medium text-slate-600 mb-1">City</label>
                    <Input id="co-city" placeholder="e.g. Karachi" value={form.city} onChange={set("city")} aria-invalid={attempted && invalid.city} />
                  </div>
                  <div>
                    <label htmlFor="co-province" className="block text-xs font-medium text-slate-600 mb-1">Province</label>
                    <select
                      id="co-province"
                      value={form.province}
                      onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {PROVINCES.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="co-postal" className="block text-xs font-medium text-slate-600 mb-1">Postal code <span className="text-slate-400">(optional)</span></label>
                    <Input id="co-postal" placeholder="e.g. 75500" value={form.postalCode} onChange={set("postalCode")} />
                  </div>
                </div>
                <div>
                  <label htmlFor="co-notes" className="block text-xs font-medium text-slate-600 mb-1">Order notes <span className="text-slate-400">(optional)</span></label>
                  <textarea
                    id="co-notes"
                    placeholder="Anything we should know about your delivery?"
                    value={form.notes}
                    onChange={set("notes")}
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-3">
                <h2 className="font-bold text-slate-900">Payment</h2>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input type="radio" name="pm" checked={form.paymentMethod === "cod"} onChange={() => setForm((f) => ({ ...f, paymentMethod: "cod" }))} />
                  <span className="text-sm font-semibold">Cash on Delivery</span>
                </label>
                <label
                  className={`flex items-center gap-3 p-3 rounded-xl border border-slate-200 ${onlineEnabled ? "cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5" : "opacity-50"}`}
                >
                  <input type="radio" name="pm" disabled={!onlineEnabled} checked={form.paymentMethod === "online"} onChange={() => setForm((f) => ({ ...f, paymentMethod: "online" }))} />
                  <span className="text-sm font-semibold">Card / Wallet (Safepay){!onlineEnabled && " — coming soon"}</span>
                </label>
              </section>
            </div>

            {/* summary */}
            <aside className="lg:sticky lg:top-28 h-fit bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
              <h2 className="font-bold text-slate-900">Order summary</h2>
              {loadingQuote || !quote ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {quote.lines.map((l) => (
                      <div key={`${l.productId}::${l.variantKey ?? ""}`} className="flex gap-3 text-sm">
                        {l.imageUrl && <img src={l.imageUrl} alt={l.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 font-medium">{l.title}</p>
                          <p className="text-slate-400">
                            {l.quantity} × PKR {l.unitPrice.toLocaleString()}
                          </p>
                        </div>
                        <p className="font-semibold">{l.lineTotal.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span>PKR {quote.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Delivery</span>
                      <span>{quote.shippingFee === 0 ? "FREE" : `PKR ${quote.shippingFee.toLocaleString()}`}</span>
                    </div>
                    <div className="flex justify-between font-black text-base text-slate-900 pt-1.5">
                      <span>Total</span>
                      <span>PKR {quote.total.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}

              <Button className="w-full h-12 font-bold" disabled={submitting || loadingQuote} onClick={submit}>
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : form.paymentMethod === "cod" ? "Place order" : "Pay now"}
              </Button>
              {attempted && missing.length > 0 && (
                <p className="text-xs text-destructive" role="alert">
                  Please add {missing.join(", ")}.
                </p>
              )}
              <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> 1–3 day delivery</span>
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> 7-day returns</span>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
