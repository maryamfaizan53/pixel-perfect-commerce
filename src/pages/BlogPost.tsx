import { useParams, Link, Navigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug, blogPosts } from "@/data/blogData";
import { Calendar, Clock, User, ArrowLeft, Share2, Tag, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

const BlogPost = () => {
    const { slug } = useParams<{ slug: string }>();
    const post = slug ? getBlogPostBySlug(slug) : undefined;

    if (!post) {
        return <Navigate to="/blog" replace />;
    }

    // Get related posts (same category, excluding current post)
    const relatedPosts = blogPosts
        .filter(p => p.category === post.category && p.id !== post.id)
        .slice(0, 3);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.excerpt,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative pt-24 pb-16 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>

                    <div className="container-custom relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto"
                        >
                            <Link to="/blog">
                                <Button variant="ghost" className="text-white hover:text-primary mb-6 -ml-4">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Blog
                                </Button>
                            </Link>

                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                                {post.category}
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-6">
                                {post.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-white/70 mb-8">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    <div>
                                        <p className="font-semibold text-white">{post.author}</p>
                                        <p className="text-sm">{post.authorRole}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    <span className="font-medium">
                                        {new Date(post.publishDate).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-medium">{post.readTime}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleShare}
                                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Article
                            </Button>
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

                {/* Article Content */}
                <section className="container-custom -mt-8 relative z-20 pb-24">
                    <div className="max-w-4xl mx-auto">
                        <article className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16">
                            <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-h1:text-4xl prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-strong:font-bold prose-ul:my-6 prose-li:my-2 prose-li:text-slate-700">
                                <ReactMarkdown>{post.content}</ReactMarkdown>
                            </div>

                            {/* Tags */}
                            <div className="mt-12 pt-8 border-t border-slate-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <Tag className="w-5 h-5 text-primary" />
                                    <h3 className="font-bold text-slate-900">Tags</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-primary hover:text-white transition-colors cursor-pointer"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Author Bio */}
                            <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg mb-1">{post.author}</h4>
                                        <p className="text-sm text-primary font-semibold mb-2">{post.authorRole}</p>
                                        <p className="text-sm text-slate-600 leading-relaxed">
                                            Expert contributor sharing insights on e-commerce, online shopping, and digital retail trends in Pakistan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </article>

                        {/* Related Posts */}
                        {relatedPosts.length > 0 && (
                            <div className="mt-16">
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900">Related Articles</h2>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    {relatedPosts.map((relatedPost) => (
                                        <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                                            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all h-full flex flex-col group">
                                                <div className="aspect-[16/10] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <TrendingUp className="w-6 h-6 text-primary" />
                                                    </div>
                                                </div>

                                                <div className="p-6 flex-1 flex flex-col">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3 w-fit">
                                                        {relatedPost.category}
                                                    </div>

                                                    <h3 className="text-lg font-bold text-slate-900 mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                        {relatedPost.title}
                                                    </h3>

                                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-auto pt-4 border-t border-slate-100">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{relatedPost.readTime}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPost;
