import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RotateCcw, Package, Clock, CheckCircle } from "lucide-react";

const Returns = () => {
  const steps = [
    { icon: Package, title: "Request Return", description: "Log into your account and select the item you wish to return" },
    { icon: RotateCcw, title: "Pack Your Item", description: "Securely pack the item in its original packaging with all accessories" },
    { icon: Clock, title: "Ship It Back", description: "Use the prepaid return label we provide via email" },
    { icon: CheckCircle, title: "Get Your Refund", description: "Receive your refund within 5-7 business days after we receive the item" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <RotateCcw className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="text-4xl font-bold mb-4">Returns & Refunds</h1>
            <p className="text-lg text-muted-foreground">We want you to love your purchase. If you're not satisfied, we're here to help.</p>
          </div>

          {/* Return Policy */}
          <section className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Our Return Policy</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong className="text-foreground">30-Day Return Window:</strong> You have 30 days from the date of delivery to return most items.
              </p>
              <p>
                <strong className="text-foreground">Condition:</strong> Items must be unused, in original packaging, and with all tags attached.
              </p>
              <p>
                <strong className="text-foreground">Proof of Purchase:</strong> Original receipt or order confirmation email required.
              </p>
              <p>
                <strong className="text-foreground">Free Returns:</strong> We provide prepaid return shipping labels for most items.
              </p>
            </div>
          </section>

          {/* Return Process */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">How to Return an Item</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Exceptions */}
          <section className="bg-muted rounded-lg p-8 mb-8">
            <h2 className="text-xl font-bold mb-4">Items That Cannot Be Returned</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Personal care and hygiene products</li>
              <li>• Items marked as final sale</li>
              <li>• Gift cards</li>
              <li>• Downloadable software or digital products</li>
              <li>• Items damaged due to misuse</li>
            </ul>
          </section>

          {/* Refunds */}
          <section className="bg-card border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Refund Information</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Once we receive your return, we'll inspect the item and process your refund within 5-7 business days.
              </p>
              <p>
                Refunds are issued to the original payment method. Depending on your bank, it may take an additional 3-5 business days for the funds to appear in your account.
              </p>
              <p className="text-foreground font-semibold">
                Questions about returns? Contact our support team at returns@shophub.com or call 1-800-SHOPHUB.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Returns;
