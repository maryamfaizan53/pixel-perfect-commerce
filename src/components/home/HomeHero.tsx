import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export const HomeHero = () => {
    return (
        <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-secondary">
            {/* Background Cinematic Visual */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&q=80&auto=format"
                    alt="AI Bazar Hero"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-transparent" />
            </div>

            <div className="container-custom relative z-10">
                <div className="max-w-3xl space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
                    >
                        <Sparkles className="w-4 h-4" />
                        Premium AI Experience
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4"
                    >
                        <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                            DISCOVER <br />
                            <span className="text-primary">THE FUTURE</span>
                        </h1>
                        <p className="text-xl text-white/60 max-w-xl leading-relaxed">
                            Experience the next generation of online shopping in Pakistan.
                            Premium products, AI-curated selections, and world-class service.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap gap-4"
                    >
                        <Button size="lg" asChild className="h-16 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold group">
                            <Link to="/category/all" className="flex items-center gap-3">
                                Shop Collection
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="h-16 px-8 rounded-2xl border-white/20 text-white hover:bg-white/10 font-bold">
                            <Link to="/about">Learn More</Link>
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Decorative Orbs */}
            <div className="absolute top-1/2 -right-64 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 animate-pulse" />
        </section>
    );
};
