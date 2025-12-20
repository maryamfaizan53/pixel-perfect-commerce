import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

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
      <section className="py-24 bg-slate-50/50">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-[40px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-24 bg-slate-50/50">
        <div className="container-custom">
          <div className="text-center py-24 bg-white rounded-[40px] border border-slate-100 shadow-xl">
            <Sparkles className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-slate-900 mb-2">New Treasures Coming Soon</h2>
            <p className="text-slate-500 font-medium">
              We're currently updating our featured collection. Check back shortly!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden bg-slate-50/50">
      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5" />
              Handpicked Essentials
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
              Featured <span className="text-primary italic">Collection</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg">
              Discover our most-loved pieces, curated for quality and timeless style.
            </p>
          </div>
          <Link
            to="/category/all"
            className="group flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all pb-2 border-b-2 border-slate-100 hover:border-primary"
          >
            Explore More
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <div
              key={product.node.id}
              className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Background Decorative Blur */}
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-secondary/5 blur-[120px] rounded-full translate-y-1/2 translate-x-1/3 pointer-events-none" />
    </section>
  );
};
