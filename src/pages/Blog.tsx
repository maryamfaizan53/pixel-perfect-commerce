import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { blogPosts, getAllCategories } from "@/data/blogData";
import { Calendar, Clock, User, Search, Tag, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const Blog = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", ...getAllCategories()];

    const filteredPosts = blogPosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const featuredPost = blogPosts.find(post => post.featured);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative pt-24 pb-20 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

                    <div className="container-custom relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto text-center"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                                <TrendingUp className="w-4 h-4" />
                                E-commerce Insights
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
                                AI Bazar <span className="text-primary">Blog</span>
                            </h1>

                            <p className="text-lg md:text-xl text-white/70 font-medium mb-10 max-w-2xl mx-auto">
                                Your ultimate guide to online shopping in Pakistan. Tips, trends, and insights to make your shopping experience better.
                            </p>

                            {/* Search Bar */}
                            <div className="max-w-2xl mx-auto">
                                <div className="relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search articles, tips, guides..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-14 pr-6 h-16 rounded-2xl border-none bg-white shadow-2xl text-base font-medium"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.15, 0.1]
                        }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"
                    />
                </section>

                {/* Category Filter */}
                <section className="container-custom -mt-8 relative z-20 mb-12">
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Tag className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-slate-900">Categories</h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {categories.map((category) => (
                                <Button
                                    key={category}
                                    variant={selectedCategory === category ? "default" : "outline"}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`rounded-xl font-semibold transition-all ${selectedCategory === category
                                            ? "shadow-lg shadow-primary/20"
                                            : "hover:border-primary"
                                        }`}
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Post */}
                {featuredPost && selectedCategory === "All" && !searchQuery && (
                    <section className="container-custom mb-16">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-primary" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">Featured Article</h2>
                        </div>

                        <Link to={`/blog/${featuredPost.slug}`}>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all"
                            >
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="aspect-[16/10] md:aspect-auto bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                        <div className="text-center p-8">
                                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <TrendingUp className="w-10 h-10 text-primary" />
                                            </div>
                                            <p className="text-sm font-bold text-primary uppercase tracking-wider">Featured Post</p>
                                        </div>
                                    </div>

                                    <div className="p-8 md:p-10 flex flex-col justify-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                                            {featuredPost.category}
                                        </div>

                                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 leading-tight hover:text-primary transition-colors">
                                            {featuredPost.title}
                                        </h3>

                                        <p className="text-slate-600 mb-6 leading-relaxed">
                                            {featuredPost.excerpt}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                <span className="font-medium">{featuredPost.author}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(featuredPost.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>{featuredPost.readTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    </section>
                )}

                {/* Blog Grid */}
                <section className="container-custom pb-24">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-slate-900">
                            {searchQuery ? `Search Results (${filteredPosts.length})` : 'Latest Articles'}
                        </h2>
                        <p className="text-sm text-slate-500 font-medium">
                            {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                        </p>
                    </div>

                    {filteredPosts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">No articles found</h3>
                            <p className="text-slate-500 mb-6">Try adjusting your search or filter criteria</p>
                            <Button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredPosts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link to={`/blog/${post.slug}`}>
                                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all h-full flex flex-col group">
                                            <div className="aspect-[16/10] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                                <div className="text-center p-6">
                                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                                        <TrendingUp className="w-8 h-8 text-primary" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 flex-1 flex flex-col">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3 w-fit">
                                                    {post.category}
                                                </div>

                                                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                    {post.title}
                                                </h3>

                                                <p className="text-sm text-slate-600 mb-4 leading-relaxed line-clamp-3 flex-1">
                                                    {post.excerpt}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-4 border-t border-slate-100">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{new Date(post.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{post.readTime}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Blog;
