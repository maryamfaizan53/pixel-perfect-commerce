import { Link } from "react-router-dom";
import { fetchCollections } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const CategoryGrid = () => {
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => fetchCollections(8),
  });

  if (isLoading) {
    return (
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (collections.length === 0) return null;

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container-custom">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-2"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-md">
              Browse our curated collections for every need.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Link
              to="/category/all"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {collections.slice(0, 4).map((col, index) => (
            <motion.div
              key={col.node.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link
                to={`/category/${col.node.handle}`}
                className="group relative block aspect-[3/4] rounded-xl overflow-hidden bg-muted"
              >
                {/* Image */}
                <img
                  src={col.node.image?.url || "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&h=800&fit=crop"}
                  alt={col.node.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                    {col.node.title}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 group-hover:text-primary transition-colors">
                    Shop Now
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Additional Categories */}
        {collections.length > 4 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-4 md:mt-6">
            {collections.slice(4, 8).map((col, index) => (
              <motion.div
                key={col.node.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index + 4) * 0.05, duration: 0.5 }}
              >
                <Link
                  to={`/category/${col.node.handle}`}
                  className="group flex items-center gap-4 p-4 bg-background rounded-xl border border-border/50 hover:border-border hover:shadow-md transition-all"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={col.node.image?.url || "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200&h=200&fit=crop"}
                      alt={col.node.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {col.node.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">Shop now</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};