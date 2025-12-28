import { useQuery } from "@tanstack/react-query";
import { fetchProductsByCollection } from "@/lib/shopify";
import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface CategorySectionProps {
    handle: string;
    title?: string;
    subtitle?: string;
    reverse?: boolean;
}

export const CategorySection = ({ handle, title, subtitle, reverse = false }: CategorySectionProps) => {
    const { data: collection, isLoading } = useQuery({
        queryKey: ['collection-products', handle],
        queryFn: () => fetchProductsByCollection(handle, 4),
    });

    if (isLoading) {
        return (
            <section className="py-24 bg-white">
                <div className="container-custom">
                    <div className="flex flex-col gap-12">
                        <div className="space-y-4 max-w-xl">
                            <Skeleton className="h-4 w-32 rounded-full" />
                            <Skeleton className="h-12 w-full rounded-2xl" />
                            <Skeleton className="h-6 w-3/4 rounded-xl" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="aspect-[4/5] rounded-[2rem]" />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!collection || collection.products.length === 0) return null;

    return (
        <section className="py-32 relative overflow-hidden bg-white">
            {/* Decorative Background Element */}
            <div className={`absolute top-0 ${reverse ? 'right-0' : 'left-0'} w-[50vw] h-full bg-slate-50/50 -z-10`} />

            <div className="container-custom relative z-10">
                <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-20 items-start`}>
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className="lg:w-1/3 space-y-8 sticky top-32"
                    >
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.4em] border border-primary/10">
                                <Sparkles className="w-3.5 h-3.5" />
                                {collection.title} Edition
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[0.85] font-playfair italic">
                                {title || collection.title}
                                <br />
                                <span className="text-primary not-italic font-sans uppercase text-[0.4em] tracking-[0.2em] block mt-6">Signature Selection</span>
                            </h2>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed italic opacity-70">
                                {subtitle || collection.description || "Discover our curated selection of premium pieces, meticulouslycrafted for excellence."}
                            </p>
                        </div>

                        <div className="pt-8">
                            <Link
                                to={`/category/${handle}`}
                                className="group flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.5em] text-foreground hover:text-primary transition-all pb-4 border-b border-slate-100 hover:border-primary w-fit"
                            >
                                Explore Full Collection
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform duration-500" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Products Grid */}
                    <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12">
                        {collection.products.map((product, index) => (
                            <motion.div
                                key={product.node.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ delay: index * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className={index % 2 !== 0 ? "lg:mt-24" : ""}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
