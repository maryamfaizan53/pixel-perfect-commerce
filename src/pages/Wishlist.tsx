import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { Heart, Loader2 } from "lucide-react";
import { getProduct } from "@/lib/api";
import type { Product } from "@/types/catalog";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { wishlistItems } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (wishlistItems.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all(wishlistItems.map((i) => getProduct(i.product_handle).catch(() => null)))
      .then((results) => {
        if (!cancelled) setProducts(results.filter((p): p is Product => p !== null));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [wishlistItems, user]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-8">
          <div className="container-custom">
            <div className="text-center py-16">
              <Heart className="w-24 h-24 mx-auto text-muted-foreground mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Sign in to view your wishlist</h2>
              <p className="text-muted-foreground mb-8">
                Create an account to save your favorite products
              </p>
              <Button onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">My Wishlist</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : products.length > 0 ? (
            <>
              <p className="text-muted-foreground mb-6">
                {products.length} item{products.length !== 1 ? 's' : ''} saved
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Heart className="w-24 h-24 mx-auto text-muted-foreground mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-8">
                Save items you love by clicking the heart icon on any product
              </p>
              <Button onClick={() => navigate("/")}>
                Browse Products
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
