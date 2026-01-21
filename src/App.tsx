import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { WishlistProvider } from "@/hooks/useWishlist";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/layout/PageTransition";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { usePageTracking } from "@/hooks/usePageTracking";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const AllCategories = lazy(() => import("./pages/AllCategories"));
const CartPage = lazy(() => import("./pages/CartPage"));
const Account = lazy(() => import("./pages/Account"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Auth = lazy(() => import("./pages/Auth"));
const Help = lazy(() => import("./pages/Help"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Returns = lazy(() => import("./pages/Returns"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));

// Lazy load support components
const WhatsAppSupport = lazy(() => import("@/components/common/WhatsAppSupport").then(m => ({ default: m.WhatsAppSupport })));
const AIChatbot = lazy(() => import("@/components/common/AIChatbot").then(m => ({ default: m.AIChatbot })));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center space-y-4">
      <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
      <p className="text-sm font-medium text-slate-600">Loading...</p>
    </div>
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  // Track page views on route changes
  usePageTracking();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/products/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
          <Route path="/product/:handle" element={<PageTransition><ProductPage /></PageTransition>} />
          <Route path="/category" element={<PageTransition><AllCategories /></PageTransition>} />
          <Route path="/category/:category" element={<PageTransition><CategoryPage /></PageTransition>} />
          <Route path="/collections/:category" element={<PageTransition><CategoryPage /></PageTransition>} />
          <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
          <Route path="/account" element={<PageTransition><Account /></PageTransition>} />
          <Route path="/orders/:orderId" element={<PageTransition><OrderDetails /></PageTransition>} />
          <Route path="/wishlist" element={<PageTransition><Wishlist /></PageTransition>} />
          <Route path="/help" element={<PageTransition><Help /></PageTransition>} />
          <Route path="/track-order" element={<PageTransition><TrackOrder /></PageTransition>} />
          <Route path="/returns" element={<PageTransition><Returns /></PageTransition>} />
          <Route path="/shipping" element={<PageTransition><Shipping /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          <Route path="/about" element={<PageTransition><About /></PageTransition>} />
          <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
          <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WishlistProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
            <Suspense fallback={null}>
              <WhatsAppSupport />
              <AIChatbot />
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </WishlistProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
