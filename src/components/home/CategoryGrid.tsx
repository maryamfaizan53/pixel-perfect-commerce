import { Link } from "react-router-dom";
import { fetchCollections } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import { Loader2, LayoutGrid, Sparkles, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const CategoryGrid = () => {
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => fetchCollections(8), // Fetch more for a richer grid
  });

  if (isLoading) {
    return (
      <section className="py-24 bg-slate-50/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-[40px]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden bg-white">
      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5" />
              Curated Collections
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
              Shop by <span className="text-primary italic">Department</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg max-w-xl">
              Explore our boutique selections tailored for every aspect of your lifestyle.
            </p>
          </div>
          <Link
            to="/category/all"
            className="group flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all pb-2 border-b-2 border-slate-100 hover:border-primary"
          >
            Explore All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {collections.map((col, index) => (
            <Link
              key={col.node.id}
              to={`/category/${col.node.handle}`}
              className="group relative aspect-[4/5] rounded-[40px] overflow-hidden bg-slate-50 border border-slate-100 transition-all duration-700 hover:shadow-2xl hover:-translate-y-3 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img
                src={col.node.image?.url || "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=800&fit=crop"}
                alt={col.node.title}
                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-500" />

              <div className="absolute inset-0 flex flex-col justify-end p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="px-6 py-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <h3 className="text-xl font-black text-white tracking-tight mb-1">{col.node.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/70">
                    Explore
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Background Decorative Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
    </section>
  );
};
