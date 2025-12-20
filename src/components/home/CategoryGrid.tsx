import { Link } from "react-router-dom";
import { fetchCollections } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import { Loader2, LayoutGrid } from "lucide-react";

export const CategoryGrid = () => {
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => fetchCollections(6),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest">
            <LayoutGrid className="w-3 h-3" />
            Explore our range
          </div>
          <h2 className="text-4xl font-black text-slate-900 lg:text-5xl tracking-tight">Shop by Category</h2>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">Browse our curated collections to find exactly what you're looking for.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {collections.map((col) => (
            <Link
              key={col.node.id}
              to={`/category/${col.node.handle}`}
              className="group relative overflow-hidden rounded-3xl bg-slate-50 border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
            >
              <div className="aspect-[4/5] relative">
                <img
                  src={col.node.image?.url || "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=500&fit=crop"}
                  alt={col.node.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 text-white text-center px-4">
                  <p className="font-extrabold text-lg tracking-tight transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{col.node.title}</p>
                  <div className="h-1.5 w-8 bg-primary mt-3 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center rounded-full" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
