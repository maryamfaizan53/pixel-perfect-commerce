import { Link } from "react-router-dom";
import { blogPosts } from "@/data/blogData";
import { Calendar, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export const BlogPreview = () => {
    // Get the 3 most recent posts
    const recentPosts = blogPosts
        .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
        .slice(0, 3);

    return (
        <section className="py-20 bg-slate-50">
            <div className="container-custom">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            <TrendingUp className="w-3.5 h-3.5" />
                            E-commerce Insights
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            Latest from our <span className="text-primary">Blog</span>
                        </h2>
                        <p className="mt-4 text-slate-600 font-medium">
                            Expert tips, trends, and shopping guides to help you make the best purchase decisions in Pakistan.
                        </p>
                    </div>
                    <Link to="/blog">
                        <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl">
                            View All Articles
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recentPosts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={`/blog/${post.slug}`}>
                                <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all h-full flex flex-col group border border-slate-100">
                                    <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                                        <div className="w-16 h-16 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg">
                                            <TrendingUp className="w-8 h-8 text-primary" />
                                        </div>
                                        {/* Decorative element */}
                                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">
                                                {post.category}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-black text-slate-900 mb-4 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>

                                        <p className="text-sm text-slate-600 mb-6 leading-relaxed line-clamp-3 font-medium">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>{post.readTime}</span>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
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
