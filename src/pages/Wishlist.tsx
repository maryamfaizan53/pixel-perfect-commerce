import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { Heart, Loader2 } from "lucide-react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { Button } from "@/components/ui/button";

const Wishlist = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(4);
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

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
                  <ProductCard key={product.node.id} product={product} />
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
              <Button asChild>
                <a href="/">Browse Products</a>
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
