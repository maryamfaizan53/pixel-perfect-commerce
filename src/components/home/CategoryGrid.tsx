import { Link } from "react-router-dom";
import { fetchCollections } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

// Mapping category handles to beautiful, relevant stock images
const categoryImages: Record<string, string> = {
  // Kitchen & Home
  "kitchen": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=1000&fit=crop",
  "kitchen-essentials": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=1000&fit=crop",
  "home": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=1000&fit=crop",
  "home-decor": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=1000&fit=crop",
  "household": "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=1000&fit=crop",
  
  // Beauty & Personal Care
  "beauty": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=1000&fit=crop",
  "skincare": "https://images.unsplash.com/photo-1570194065650-d99fb4b38b17?w=800&h=1000&fit=crop",
  "cosmetics": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&h=1000&fit=crop",
  "personal-care": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=1000&fit=crop",
  
  // Stationery & Office
  "stationery": "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&h=1000&fit=crop",
  "office": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=1000&fit=crop",
  "office-supplies": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop",
  
  // Electronics & Tech
  "electronics": "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=1000&fit=crop",
  "gadgets": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=1000&fit=crop",
  "tech": "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=1000&fit=crop",
  
  // Fashion & Accessories
  "fashion": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=1000&fit=crop",
  "clothing": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=1000&fit=crop",
  "accessories": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=1000&fit=crop",
  "jewelry": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1000&fit=crop",
  
  // Sports & Fitness
  "sports": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=1000&fit=crop",
  "fitness": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=1000&fit=crop",
  
  // Toys & Games
  "toys": "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&h=1000&fit=crop",
  "games": "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=800&h=1000&fit=crop",
  
  // Default fallbacks
  "default": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=1000&fit=crop",
};

// Gradient overlays for variety
const gradientOverlays = [
  "from-violet-900/80 via-violet-900/40 to-transparent",
  "from-rose-900/80 via-rose-900/40 to-transparent",
  "from-emerald-900/80 via-emerald-900/40 to-transparent",
  "from-amber-900/80 via-amber-900/40 to-transparent",
  "from-cyan-900/80 via-cyan-900/40 to-transparent",
  "from-fuchsia-900/80 via-fuchsia-900/40 to-transparent",
];

const getCategoryImage = (handle: string, fallbackUrl?: string): string => {
  const normalizedHandle = handle.toLowerCase().replace(/\s+/g, '-');
  
  // Check for exact match
  if (categoryImages[normalizedHandle]) {
    return categoryImages[normalizedHandle];
  }
  
  // Check for partial matches
  for (const key of Object.keys(categoryImages)) {
    if (normalizedHandle.includes(key) || key.includes(normalizedHandle)) {
      return categoryImages[key];
    }
  }
  
  // Use collection image or default
  return fallbackUrl || categoryImages.default;
};

export const CategoryGrid = () => {
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => fetchCollections(8),
  });

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-72 mx-auto" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (collections.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Explore Categories
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Shop by Category
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover our carefully curated collections designed to meet all your needs
          </p>
        </motion.div>

        {/* Main Category Grid - Feature Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {collections.slice(0, 4).map((col, index) => (
            <motion.div
              key={col.node.id}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
            >
              <Link
                to={`/category/${col.node.handle}`}
                className="group relative block aspect-[3/4] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                {/* Image with zoom effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={getCategoryImage(col.node.handle, col.node.image?.url)}
                    alt={col.node.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${gradientOverlays[index % gradientOverlays.length]}`} />
                
                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] font-semibold uppercase tracking-wider">
                      {index === 0 ? "Most Popular" : index === 1 ? "Trending" : index === 2 ? "New Arrivals" : "Best Sellers"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-bold text-white leading-tight group-hover:translate-x-1 transition-transform duration-300">
                      {col.node.title}
                    </h3>
                    <p className="text-white/70 text-sm line-clamp-2 hidden md:block">
                      {col.node.description || "Explore our amazing collection"}
                    </p>
                    <div className="flex items-center gap-2 text-white pt-2">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">
                        Shop Now
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </div>

                {/* Border glow effect */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-primary/30 transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Secondary Categories - Horizontal Cards */}
        {collections.length > 4 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {collections.slice(4, 8).map((col, index) => (
              <motion.div
                key={col.node.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index + 4) * 0.08, duration: 0.5 }}
              >
                <Link
                  to={`/category/${col.node.handle}`}
                  className="group flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg hover:bg-accent/50 transition-all duration-300"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-border group-hover:ring-primary/30 transition-all">
                    <img
                      src={getCategoryImage(col.node.handle, col.node.image?.url)}
                      alt={col.node.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {col.node.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">Explore collection</span>
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            to="/category/all"
            className="inline-flex items-center gap-3 px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            View All Categories
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
