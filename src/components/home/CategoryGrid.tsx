import { Link } from "react-router-dom";
import { fetchCollections } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import { Loader2, LayoutGrid, Sparkles, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const CategoryGrid = () => {
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => fetchCollections(8),
  });

  if (isLoading) {
    return (
      <section className="py-32 bg-slate-50/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-[2.5rem]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 relative overflow-hidden bg-white">
      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
              <Sparkles className="w-4 h-4" />
              Elite Selections
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
              Shop by <span className="text-primary italic">Department</span>
            </h2>
            <p className="text-slate-500 font-medium text-xl max-w-xl leading-relaxed">
              Curated boutique collections refined for your sophisticated lifestyle.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link
              to="/category/all"
              className="group flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-primary transition-all pb-3 border-b-2 border-slate-100 hover:border-primary"
            >
              Master Catalog
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {collections.map((col, index) => (
            <motion.div
              key={col.node.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/category/${col.node.handle}`}
                className="group relative block aspect-[4/5] rounded-[3rem] overflow-hidden bg-slate-50 border border-slate-100 transition-all duration-700 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] group"
              >
                <img
                  src={col.node.image?.url || "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=800&fit=crop"}
                  alt={col.node.title}
                  className="w-full h-full object-cover transition-transform duration-[2s] cubic-bezier(0.4, 0, 0.2, 1) group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />

                <div className="absolute inset-0 flex flex-col justify-end p-8 translate-y-6 group-hover:translate-y-0 transition-all duration-700">
                  <div className="px-8 py-6 rounded-[2.5rem] glass-dark border-white/10 shadow-2xl backdrop-blur-3xl">
                    <h3 className="text-2xl font-black text-white tracking-tight mb-2">{col.node.title}</h3>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-primary transition-colors">
                      Enter Portal
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background Decorative Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-primary/5 blur-[180px] rounded-full pointer-events-none -z-10" />
    </section>
  );
};
