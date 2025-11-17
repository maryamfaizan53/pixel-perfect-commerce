import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Search, Package, Truck, RotateCcw, CreditCard, Shield, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Help = () => {
  const categories = [
    { icon: Package, title: "Orders", description: "Track orders, view history, and manage returns", link: "/track-order" },
    { icon: Truck, title: "Shipping", description: "Delivery times, shipping costs, and tracking", link: "/shipping" },
    { icon: RotateCcw, title: "Returns & Refunds", description: "Return policy and refund process", link: "/returns" },
    { icon: CreditCard, title: "Payment", description: "Payment methods and billing questions", link: "#" },
    { icon: Shield, title: "Account Security", description: "Password, privacy, and account settings", link: "#" },
    { icon: MessageCircle, title: "Contact Us", description: "Get in touch with our support team", link: "/contact" },
  ];

  const faqs = [
    {
      question: "How can I track my order?",
      answer: "Visit our Track Order page and enter your order number and email address to see real-time tracking information.",
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy on most items. Products must be unused and in original packaging.",
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 5-7 business days. Express shipping is available for 2-3 day delivery.",
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to over 100 countries worldwide. Shipping costs and times vary by location.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16 mb-12">
          <div className="container-custom text-center">
            <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
            <p className="text-lg mb-8 opacity-90">Search for answers or browse our help topics</p>
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                className="pl-12 h-14 text-lg bg-background text-foreground"
              />
            </div>
          </div>
        </section>

        <div className="container-custom">
          {/* Help Categories */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Browse Help Topics</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <Link
                  key={index}
                  to={category.link}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <category.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                  <p className="text-muted-foreground text-sm">{category.description}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-muted rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-6">Our customer support team is here to assist you</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="bg-secondary hover:bg-secondary-hover text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Support
              </Link>
              <a
                href="tel:1-800-SHOPHUB"
                className="bg-background border border-border hover:bg-muted px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Call: 1-800-SHOPHUB
              </a>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Help;
