import { Link } from "react-router-dom";
import { fetchCollections } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const CategoryGrid = () => {
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => fetchCollections(8),
  });

  if (isLoading) {
    return (
      <section className="py-24 md:py-32 bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl md:rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-muted/20 pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <span className="inline-block text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-4">
              Curated Selection
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-[1.1]">
              Shop by <span className="text-primary">Category</span>
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-lg mt-8 leading-relaxed font-medium opacity-70">
              "Explore our curated collections designed for every aspect of your lifestyle."
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Link
              to="/category/all"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
              View All Collections
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {collections.slice(0, 4).map((col, index) => (
            <motion.div
              key={col.node.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/category/${col.node.handle}`}
                className="group relative block aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden bg-muted"
              >
                {/* Image */}
                <img
                  src={col.node.image?.url || "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=800&fit=crop"}
                  alt={col.node.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-500" />

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-secondary/95 via-secondary/40 to-transparent translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-end justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                        {col.node.title}
                      </h3>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                        Initialize Exploration
                      </p>
                    </div>

                    {/* Arrow Button */}
                    <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-700 shadow-gold">
                      <ArrowUpRight className="w-6 h-6 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Top Badge - Optional category count */}
                <div className="absolute top-4 left-4 md:top-5 md:left-5">
                  <span className="px-3 py-1.5 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground text-[10px] md:text-xs font-bold uppercase tracking-wider">
                    New
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Additional Categories Row */}
        {collections.length > 4 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-4 md:mt-6">
            {collections.slice(4, 8).map((col, index) => (
              <motion.div
                key={col.node.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index + 4) * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={`/category/${col.node.handle}`}
                  className="group relative block aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden bg-muted"
                >
                  {/* Image */}
                  <img
                    src={col.node.image?.url || "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=450&fit=crop"}
                    alt={col.node.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent opacity-50 group-hover:opacity-60 transition-opacity duration-500" />

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm md:text-base font-bold text-primary-foreground leading-tight truncate">
                        {col.node.title}
                      </h3>
                      <ArrowUpRight className="w-4 h-4 text-primary-foreground/60 group-hover:text-primary-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
