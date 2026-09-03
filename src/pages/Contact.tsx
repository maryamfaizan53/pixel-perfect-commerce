import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, Globe, Truck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useSEO } from "@/hooks/useSEO";
import { trackMetaEvent } from "@/lib/meta-pixel";

const WHATSAPP_NUMBER = "923328222026"; // +92 332 8222026
const EMAIL = "aibazarad@gmail.com";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  subject: z.string().min(1, "Please select a subject"),
  orderNumber: z.string().trim().max(50, "Order number must be less than 50 characters").optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message must be less than 1000 characters"),
});

const Contact = () => {
  useSEO({
    title: "Contact Us - AI Bazar Pakistan | WhatsApp Support",
    description:
      "Get in touch with AI Bazar Pakistan. Reach us on WhatsApp at +92 332 8222026, email aibazarad@gmail.com, or the contact form for orders, returns and product questions.",
    keywords: "contact aibazar, aibazar whatsapp, aibazar phone number, aibazar customer support, aibazar email",
    canonical: "https://www.aibazar.pk/contact",
  });

  const [formData, setFormData] = useState({ name: "", email: "", subject: "", orderNumber: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = contactSchema.parse(formData);
      setLoading(true);

      // Route the enquiry to WhatsApp — AI Bazar's primary support channel.
      const text = [
        `*New enquiry from aibazar.pk*`,
        `Name: ${validatedData.name}`,
        `Email: ${validatedData.email}`,
        `Subject: ${validatedData.subject}`,
        validatedData.orderNumber ? `Order #: ${validatedData.orderNumber}` : null,
        ``,
        validatedData.message,
      ]
        .filter(Boolean)
        .join("\n");

      trackMetaEvent("Lead", { content_name: validatedData.subject, content_category: "contact_form" });

      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");

      toast.success("Opening WhatsApp…", { description: "Send the pre-filled message and we'll reply shortly." });
      setFormData({ name: "", email: "", subject: "", orderNumber: "", message: "" });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        toast.error("Please check the form", { description: error.errors[0].message });
      } else {
        toast.error("Something went wrong", { description: "Please message us on WhatsApp instead." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-28 sm:pt-32 pb-16 sm:pb-20">
        <div className="container-custom max-w-5xl">
          <div className="mb-10">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">We're here to help</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-1">Contact AI Bazar</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg">
              Questions about an order, a product, or a return? Message us on WhatsApp for the fastest reply, or send the
              form below.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Form */}
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-soft">
              <h2 className="text-lg font-bold text-foreground mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      className="mt-1.5"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      className="mt-1.5"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Order inquiry">Order inquiry</SelectItem>
                        <SelectItem value="Product question">Product question</SelectItem>
                        <SelectItem value="Returns & refunds">Returns &amp; refunds</SelectItem>
                        <SelectItem value="Shipping & delivery">Shipping &amp; delivery</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="order-number">Order number (optional)</Label>
                    <Input
                      id="order-number"
                      placeholder="e.g. AB-10234"
                      className="mt-1.5"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    placeholder="Tell us how we can help…"
                    className="mt-1.5"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full shadow-gold" disabled={loading}>
                  {loading ? "Opening WhatsApp…" : "Send message"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  This opens WhatsApp with your message pre-filled.
                </p>
              </form>
            </div>

            {/* Contact details */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-5">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group"
                >
                  <span className="w-10 h-10 rounded-xl bg-trust/10 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-trust" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.394 0 12.03c0 2.122.554 4.197 1.604 6.04L0 24l6.11-1.603a11.848 11.848 0 005.935 1.604h.005c6.637 0 12.032-5.395 12.033-12.031a11.75 11.75 0 00-3.525-8.508" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">WhatsApp</span>
                    <span className="block text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      +92 332 8222026
                    </span>
                    <span className="block text-xs text-muted-foreground/80">Fastest — usually within a few hours</span>
                  </span>
                </a>

                <a href={`tel:+${WHATSAPP_NUMBER}`} className="flex items-start gap-3 group">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Call</span>
                    <span className="block text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      +92 332 8222026
                    </span>
                  </span>
                </a>

                <a href={`mailto:${EMAIL}`} className="flex items-start gap-3 group">
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Email</span>
                    <span className="block text-sm text-muted-foreground group-hover:text-primary transition-colors break-all">
                      {EMAIL}
                    </span>
                  </span>
                </a>

                <a
                  href="https://www.aibazar.pk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group"
                >
                  <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-primary" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Website</span>
                    <span className="block text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      www.aibazar.pk
                    </span>
                  </span>
                </a>

                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-trust/10 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-trust" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Delivery</span>
                    <span className="block text-sm text-muted-foreground">
                      Nationwide across Pakistan · Cash on Delivery · 1–3 business days
                    </span>
                  </span>
                </div>
              </div>

              <Button asChild size="lg" variant="trust" className="w-full">
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
