import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  subject: z.string().min(1, "Please select a subject"),
  orderNumber: z.string().trim().max(50, "Order number must be less than 50 characters").optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message must be less than 1000 characters")
});

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    orderNumber: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = contactSchema.parse(formData);
      setLoading(true);
      
      // In a real app, you would send this to your backend
      console.log("Contact form submitted:", validatedData);
      
      toast.success("Message sent!", {
        description: "We'll get back to you within 24 hours."
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        orderNumber: "",
        message: ""
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error("Validation error", {
          description: error.errors[0].message
        });
      } else {
        toast.error("Failed to send message", {
          description: "Please try again later."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-muted-foreground">Have a question? We're here to help!</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2 bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    className="mt-1" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    className="mt-1" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order">Order Inquiry</SelectItem>
                      <SelectItem value="product">Product Question</SelectItem>
                      <SelectItem value="return">Returns & Refunds</SelectItem>
                      <SelectItem value="shipping">Shipping & Delivery</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="order-number">Order Number (Optional)</Label>
                  <Input 
                    id="order-number" 
                    placeholder="ORD-2024-1001" 
                    className="mt-1" 
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    placeholder="Tell us how we can help..."
                    className="mt-1"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full bg-secondary hover:bg-secondary-hover" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-4 mb-6">
                  <Phone className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-muted-foreground">1-800-SHOPHUB</p>
                    <p className="text-sm text-muted-foreground">(1-800-746-7482)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <Mail className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground">support@shophub.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <MapPin className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-semibold mb-1">Address</h3>
                    <p className="text-muted-foreground">
                      123 Commerce Street<br />
                      New York, NY 10001<br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-semibold mb-1">Business Hours</h3>
                    <p className="text-muted-foreground">
                      Monday - Friday: 9am - 6pm EST<br />
                      Saturday: 10am - 4pm EST<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-6">
                <h3 className="font-semibold mb-2">Quick Response</h3>
                <p className="text-sm text-muted-foreground">
                  We typically respond to inquiries within 24 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
