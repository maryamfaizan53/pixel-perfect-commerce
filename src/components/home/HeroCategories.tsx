import { Link } from "react-router-dom";
import { fetchCollections } from "@/lib/shopify";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const HeroCategories = () => {
    const { data: collections = [], isLoading } = useQuery({
        queryKey: ['collections'],
        queryFn: () => fetchCollections(6),
    });

    const categoryImages: Record<string, string> = {
        'Household': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80',
        'Home & Living': 'https://images.unsplash.com/photo-1513519247388-4e28265121e0?w=800&q=80',
        'Health & Beauty': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
    };

    if (isLoading) {
        return (
            <section className="pt-24 pb-12 bg-secondary">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="aspect-[16/9] rounded-3xl" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="relative pt-24 pb-16 overflow-hidden bg-secondary">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.2),transparent_70%)]" />
            </div>

            <div className="container-custom relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                        <Sparkles className="w-4 h-4" />
                        Featured Collections
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
                        Shop by <span className="text-primary">Category</span>
                    </h1>
                    <p className="text-white/60 max-w-2xl mx-auto text-lg">
                        Discover our latest arrivals and premium collections across all categories.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {collections.slice(0, 6).map((col, index) => (
                        <motion.div
                            key={col.node.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="group"
                        >
                            <Link to={`/category/${col.node.handle}`}>
                                <div className="relative aspect-[16/9] md:aspect-video rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-500">
                                    <img
                                        src={categoryImages[col.node.title] || col.node.image?.url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"}
                                        alt={col.node.title}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                                        <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-2 group-hover:text-primary transition-colors">
                                            {col.node.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-white/70 text-sm font-bold uppercase tracking-widest">
                                            <span>Explore</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
