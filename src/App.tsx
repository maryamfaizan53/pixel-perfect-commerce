import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { WishlistProvider } from "@/hooks/useWishlist";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import ProductPage from "./pages/ProductPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import Account from "./pages/Account";
import Wishlist from "./pages/Wishlist";
import Auth from "./pages/Auth";
import Help from "./pages/Help";
import TrackOrder from "./pages/TrackOrder";
import Returns from "./pages/Returns";
import Shipping from "./pages/Shipping";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WishlistProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/product/:handle" element={<ProductPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/account" element={<Account />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/help" element={<Help />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WishlistProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
