import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { Loader2, Sparkles } from "lucide-react";

export const FeaturedProducts = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(8);
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-24 bg-slate-50">
        <div className="container-custom">
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">New Treasures Coming Soon</h2>
            <p className="text-slate-500">
              We're currently updating our featured collection. Check back shortly!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-slate-50/50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Handpicked for you
            </div>
            <h2 className="text-4xl font-black text-slate-900 lg:text-5xl tracking-tight">Featured Collection</h2>
            <p className="text-lg text-slate-600 font-medium">Discover our most premium items, curated for style and quality.</p>
          </div>
          <button className="text-primary font-bold hover:underline flex items-center gap-2 group">
            View All Products
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.node.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
