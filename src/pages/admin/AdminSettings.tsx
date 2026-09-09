import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X, Save } from "lucide-react";
import { toast } from "sonner";
import { adminGetSettings, adminPatchSettings } from "@/lib/adminApi";
import type { AdminSettings, SettingsPatch } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const SOCIALS = ["facebook", "instagram", "tiktok", "youtube"] as const;

export default function AdminSettings() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: adminGetSettings,
  });

  const [form, setForm] = useState<AdminSettings | null>(null);
  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const mut = useMutation({
    mutationFn: (patch: SettingsPatch) => adminPatchSettings(patch),
    onSuccess: (fresh) => {
      qc.setQueryData(["admin-settings"], fresh);
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      setForm(fresh);
      toast.success("Settings saved");
    },
    onError: (e) => toast.error((e as Error)?.message || "Couldn't save"),
  });

  if (isLoading || !form) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Settings</h1>
        {isError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {(error as Error)?.message}
          </div>
        ) : (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        )}
      </div>
    );
  }

  const set = <K extends keyof AdminSettings>(k: K, v: AdminSettings[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const dirty = data ? JSON.stringify(form) !== JSON.stringify(data) : false;

  const save = () => {
    if (!form) return;
    mut.mutate({
      storeName: form.storeName,
      whatsappNumber: form.whatsappNumber,
      supportEmail: form.supportEmail,
      deliveryCharge: Number(form.deliveryCharge) || 0,
      freeShippingThreshold: Number(form.freeShippingThreshold) || 0,
      codEnabled: form.codEnabled,
      onlinePaymentEnabled: form.onlinePaymentEnabled,
      announcements: form.announcements.map((a) => a.trim()).filter(Boolean),
      socialLinks: form.socialLinks,
    });
  };

  return (
    <div className="max-w-3xl pb-24">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Store */}
        <Section title="Store">
          <Field label="Store name">
            <Input value={form.storeName} onChange={(e) => set("storeName", e.target.value)} />
          </Field>
          <Field label="Support email">
            <Input
              type="email"
              value={form.supportEmail ?? ""}
              onChange={(e) => set("supportEmail", e.target.value || null)}
            />
          </Field>
          <Field label="WhatsApp number" hint="International format, e.g. 923001234567">
            <Input value={form.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} />
          </Field>
        </Section>

        {/* Checkout */}
        <Section title="Checkout & delivery">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Delivery charge (PKR)">
              <Input
                type="number"
                min={0}
                value={form.deliveryCharge}
                onChange={(e) => set("deliveryCharge", Number(e.target.value))}
              />
            </Field>
            <Field label="Free shipping over (PKR)" hint="0 disables free shipping">
              <Input
                type="number"
                min={0}
                value={form.freeShippingThreshold}
                onChange={(e) => set("freeShippingThreshold", Number(e.target.value))}
              />
            </Field>
          </div>
          <Toggle
            label="Cash on Delivery"
            desc="Let customers pay when the order arrives"
            checked={form.codEnabled}
            onChange={(v) => set("codEnabled", v)}
          />
          <Toggle
            label="Online payment (Safepay)"
            desc="Card & wallet checkout — requires Safepay keys configured"
            checked={form.onlinePaymentEnabled}
            onChange={(v) => set("onlinePaymentEnabled", v)}
          />
        </Section>

        {/* Announcements */}
        <Section title="Announcement bar">
          <div className="space-y-2">
            {form.announcements.length === 0 && (
              <p className="text-xs text-muted-foreground">No announcements — the bar is hidden.</p>
            )}
            {form.announcements.map((a, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={a}
                  onChange={(e) =>
                    set(
                      "announcements",
                      form.announcements.map((x, j) => (j === i ? e.target.value : x)),
                    )
                  }
                  placeholder="Free delivery on orders over PKR 5,000"
                />
                <button
                  onClick={() => set("announcements", form.announcements.filter((_, j) => j !== i))}
                  className="p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive"
                  aria-label="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => set("announcements", [...form.announcements, ""])}
            >
              <Plus className="w-4 h-4 mr-1" /> Add line
            </Button>
          </div>
        </Section>

        {/* Socials */}
        <Section title="Social links">
          <div className="grid sm:grid-cols-2 gap-4">
            {SOCIALS.map((key) => (
              <Field key={key} label={key[0].toUpperCase() + key.slice(1)}>
                <Input
                  value={form.socialLinks[key] ?? ""}
                  onChange={(e) =>
                    set("socialLinks", { ...form.socialLinks, [key]: e.target.value || null })
                  }
                  placeholder="https://…"
                />
              </Field>
            ))}
          </div>
        </Section>
      </div>

      {/* Save bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-60 bg-card/95 backdrop-blur border-t border-border px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {dirty ? "Unsaved changes" : "All changes saved"}
        </span>
        <Button onClick={save} disabled={!dirty || mut.isPending}>
          {mut.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-soft">
      <h2 className="text-sm font-semibold text-foreground mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
