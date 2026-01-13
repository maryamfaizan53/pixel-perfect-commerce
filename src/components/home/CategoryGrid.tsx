import { Link } from "react-router-dom";
import { fetchCollections } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, TrendingUp, Star, Zap, Crown, Gift, Heart, ShoppingBag } from "lucide-react";
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

// Card color themes
const cardThemes = [
  { bg: "from-violet-600 to-purple-800", accent: "bg-violet-400", glow: "shadow-violet-500/25" },
  { bg: "from-rose-600 to-pink-800", accent: "bg-rose-400", glow: "shadow-rose-500/25" },
  { bg: "from-emerald-600 to-teal-800", accent: "bg-emerald-400", glow: "shadow-emerald-500/25" },
  { bg: "from-amber-500 to-orange-700", accent: "bg-amber-400", glow: "shadow-amber-500/25" },
  { bg: "from-cyan-600 to-blue-800", accent: "bg-cyan-400", glow: "shadow-cyan-500/25" },
  { bg: "from-fuchsia-600 to-purple-800", accent: "bg-fuchsia-400", glow: "shadow-fuchsia-500/25" },
  { bg: "from-indigo-600 to-blue-900", accent: "bg-indigo-400", glow: "shadow-indigo-500/25" },
  { bg: "from-red-600 to-rose-800", accent: "bg-red-400", glow: "shadow-red-500/25" },
];

// Category badges and icons
const categoryBadges = [
  { label: "Most Popular", icon: TrendingUp, color: "bg-gradient-to-r from-amber-400 to-orange-500" },
  { label: "Trending Now", icon: Zap, color: "bg-gradient-to-r from-pink-500 to-rose-500" },
  { label: "New Arrivals", icon: Star, color: "bg-gradient-to-r from-emerald-400 to-teal-500" },
  { label: "Best Sellers", icon: Crown, color: "bg-gradient-to-r from-violet-500 to-purple-600" },
  { label: "Hot Deals", icon: Gift, color: "bg-gradient-to-r from-red-500 to-orange-500" },
  { label: "Staff Picks", icon: Heart, color: "bg-gradient-to-r from-pink-400 to-fuchsia-500" },
  { label: "Limited", icon: Sparkles, color: "bg-gradient-to-r from-cyan-400 to-blue-500" },
  { label: "Exclusive", icon: ShoppingBag, color: "bg-gradient-to-r from-indigo-500 to-purple-600" },
];

const getCategoryImage = (handle: string, fallbackUrl?: string): string => {
  const normalizedHandle = handle.toLowerCase().replace(/\s+/g, '-');
  
  if (categoryImages[normalizedHandle]) {
    return categoryImages[normalizedHandle];
  }
  
  for (const key of Object.keys(categoryImages)) {
    if (normalizedHandle.includes(key) || key.includes(normalizedHandle)) {
      return categoryImages[key];
    }
  }
  
  return fallbackUrl || categoryImages.default;
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

export const CategoryGrid = () => {
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: () => fetchCollections(8),
  });

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container-custom px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <Skeleton className="h-6 w-40 mx-auto mb-4 rounded-full" />
            <Skeleton className="h-10 sm:h-12 w-64 sm:w-80 mx-auto mb-4" />
            <Skeleton className="h-4 w-56 sm:w-72 mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl sm:rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (collections.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container-custom px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14 md:mb-16"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-primary/5 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explore Categories</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 sm:mb-4 tracking-tight">
            Shop by{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
              Category
            </span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Discover our carefully curated collections designed for you
          </p>
        </motion.div>

        {/* Category Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
        >
          {collections.slice(0, 8).map((col, index) => {
            const theme = cardThemes[index % cardThemes.length];
            const badge = categoryBadges[index % categoryBadges.length];
            const BadgeIcon = badge.icon;
            
            return (
              <motion.div
                key={col.node.id}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group"
              >
                <Link
                  to={`/category/${col.node.handle}`}
                  className={`relative block aspect-[3/4] sm:aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl ${theme.glow} transition-all duration-500`}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <img
                      src={getCategoryImage(col.node.handle, col.node.image?.url)}
                      alt={col.node.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>

                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${theme.bg} opacity-70 group-hover:opacity-80 transition-opacity duration-500`} />
                  
                  {/* Mesh Pattern Overlay */}
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500" 
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                      backgroundSize: "20px 20px"
                    }}
                  />

                  {/* Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />

                  {/* Category Badge */}
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4">
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.2 }}
                      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 ${badge.color} rounded-full text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-lg`}
                    >
                      <BadgeIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span className="hidden xs:inline sm:inline">{badge.label}</span>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 md:p-5">
                    {/* Decorative Line */}
                    <div className={`w-8 sm:w-10 md:w-12 h-0.5 sm:h-1 ${theme.accent} rounded-full mb-2 sm:mb-3 group-hover:w-12 sm:group-hover:w-16 md:group-hover:w-20 transition-all duration-500`} />
                    
                    {/* Title */}
                    <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white leading-tight mb-1 sm:mb-2 group-hover:translate-x-1 transition-transform duration-300 line-clamp-2">
                      {col.node.title}
                    </h3>
                    
                    {/* Description - Hidden on small mobile */}
                    <p className="text-white/70 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3 hidden sm:block">
                      {col.node.description || "Explore our amazing collection"}
                    </p>

                    {/* Shop Now Button */}
                    <div className="flex items-center gap-2 text-white group/btn">
                      <span className="text-xs sm:text-sm font-semibold group-hover/btn:text-white/90 transition-colors">
                        Shop Now
                      </span>
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>

                  {/* Hover Border Glow */}
                  <div className="absolute inset-0 rounded-2xl sm:rounded-3xl ring-1 ring-white/20 group-hover:ring-2 group-hover:ring-white/40 transition-all duration-300" />
                  
                  {/* Corner Accent */}
                  <div className="absolute top-0 right-0 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 overflow-hidden rounded-bl-full opacity-30 group-hover:opacity-50 transition-opacity">
                    <div className={`w-full h-full ${theme.accent} blur-xl`} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-10 sm:mt-12 md:mt-16"
        >
          <Link
            to="/category/all"
            className="group inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-full font-semibold text-sm sm:text-base hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:-translate-y-1"
          >
            <span>View All Categories</span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
