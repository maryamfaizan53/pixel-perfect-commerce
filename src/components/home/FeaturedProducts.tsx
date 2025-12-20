import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { Sparkles, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

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
      <section className="py-32 bg-slate-50/50">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-[3rem]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-32 bg-slate-50/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-2xl"
          >
            <Sparkles className="w-20 h-20 text-slate-200 mx-auto mb-8 animate-pulse" />
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Vault Update in Progress</h2>
            <p className="text-slate-500 font-medium text-lg">
              Our curators are securing new arrivals. Check back momentarily.
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 relative overflow-hidden bg-slate-50/30">
      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 max-w-2xl"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
              <Star className="w-4 h-4 fill-primary/20" />
              Diamond Tier Curation
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
              Featured <span className="text-primary italic">Collection</span>
            </h2>
            <p className="text-slate-500 font-medium text-xl leading-relaxed">
              Exquisite pieces meticulously selected for their uncompromising quality and design.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              to="/category/all"
              className="group flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-all pb-3 border-b-2 border-slate-100 hover:border-primary"
            >
              View Full Gallery
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map((product, index) => (
            <motion.div
              key={product.node.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* High-Fidelity Background Glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-secondary/5 blur-[150px] rounded-full translate-y-1/2 translate-x-1/3 pointer-events-none" />
    </section>
  );
};
