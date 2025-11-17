import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FileText } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <FileText className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 2024</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8">
            <section className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using ShopHub, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Use of Our Service</h2>
              <p className="text-muted-foreground mb-4">You agree to use our service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use the service in any way that violates applicable laws or regulations</li>
                <li>Engage in fraudulent activity or misrepresent yourself</li>
                <li>Transmit any viruses, malware, or harmful code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service or servers</li>
              </ul>
            </section>

            <section className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Accounts</h2>
              <p className="text-muted-foreground">
                When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the confidentiality of your account and password and for all activities that occur under your account.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Products and Pricing</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>We strive to provide accurate product descriptions and pricing. However:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We reserve the right to correct errors or inaccuracies</li>
                  <li>Prices are subject to change without notice</li>
                  <li>Product availability is not guaranteed</li>
                  <li>We may limit quantities or refuse orders at our discretion</li>
                </ul>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Payments</h2>
              <p className="text-muted-foreground">
                All payments must be made in full at the time of purchase. We accept various payment methods as indicated during checkout. By providing payment information, you represent that you are authorized to use the payment method.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Shipping and Delivery</h2>
              <p className="text-muted-foreground mb-4">
                Delivery times are estimates only and not guaranteed. Risk of loss and title pass to you upon delivery to the carrier. For detailed shipping information, please refer to our Shipping Policy.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Returns and Refunds</h2>
              <p className="text-muted-foreground">
                Our return policy allows returns within 30 days of delivery for most items. Please refer to our Returns & Refunds page for complete details on eligibility and procedures.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content on this website, including text, graphics, logos, images, and software, is the property of ShopHub and protected by copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground">
                To the fullest extent permitted by law, ShopHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our services.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the service constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, contact us at:<br />
                Email: legal@shophub.com<br />
                Phone: 1-800-SHOPHUB
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
