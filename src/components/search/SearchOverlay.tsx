import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Clock, X, Mic, MicOff, TrendingUp, ArrowRight, Sparkles, Filter, ChevronRight } from "lucide-react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { debounce } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const SEARCH_HISTORY_KEY = "product-search-history";
const MAX_HISTORY_ITEMS = 6;

const trendingSearches = [
    { term: "Luxury Kitchenware", category: "Culinary" },
    { term: "Organic Wellness", category: "Health" },
    { term: "Designer Fragrance", category: "Boutique" },
    { term: "Sustainable Living", category: "Lifestyle" }
];

interface SearchBarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SearchOverlay = ({ isOpen, onClose }: SearchBarProps) => {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<ShopifyProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Extract unique categories from products
    const categories = useMemo(() => {
        const cats = new Set<string>();
        products.forEach(p => {
            if (p.node.productType) cats.add(p.node.productType);
            // Fallback: handle often contains category-like info
            const handlePart = p.node.handle.split('-')[0];
            if (handlePart) cats.add(handlePart.charAt(0).toUpperCase() + handlePart.slice(1));
        });
        return Array.from(cats).slice(0, 8);
    }, [products]);

    const filteredResults = useMemo(() => {
        let results = products;
        if (search.trim()) {
            const lowerQuery = search.toLowerCase();
            results = results.filter(p =>
                p.node.title.toLowerCase().includes(lowerQuery) ||
                p.node.description.toLowerCase().includes(lowerQuery)
            );
        } else if (!selectedCategory) {
            return []; // Show nothing if no search and no category selected
        }

        if (selectedCategory) {
            results = results.filter(p =>
                p.node.productType === selectedCategory ||
                p.node.handle.startsWith(selectedCategory.toLowerCase())
            );
        }

        return results.slice(0, 12);
    }, [search, products, selectedCategory]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    useEffect(() => {
        const history = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (history) setSearchHistory(JSON.parse(history));
    }, []);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.onresult = (e: any) => {
                const transcript = e.results[0][0].transcript;
                setSearch(transcript);
                setIsListening(false);
            };
            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchProducts(100);
                setProducts(data);
            } catch (e) {
                console.error('Search preload failed', e);
            }
        };
        loadProducts();
    }, []);

    const handleSelectProduct = (handle: string) => {
        saveToHistory(search);
        onClose();
        navigate(`/product/${handle}`);
        setSearch("");
    };

    const saveToHistory = (query: string) => {
        if (!query.trim()) return;
        const updated = [query, ...searchHistory.filter(h => h !== query)].slice(0, MAX_HISTORY_ITEMS);
        setSearchHistory(updated);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem(SEARCH_HISTORY_KEY);
    };

    const toggleVoice = () => {
        if (!recognitionRef.current) return toast.error("Speech recognition not supported in this browser");
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-white flex flex-col"
                >
                    {/* Header */}
                    <div className="container-custom h-20 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-4 text-primary">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Search the Gallery</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full w-10 h-10 hover:bg-slate-100 transition-colors">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto pt-12 pb-24">
                        <div className="container-custom max-w-6xl">
                            {/* Input Area */}
                            <div className="relative mb-12 group">
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-primary transition-transform group-focus-within:scale-110" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search brands, products, collections..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-transparent border-none text-3xl md:text-5xl font-black pl-14 pr-24 outline-none placeholder:text-slate-200 tracking-tight"
                                />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                    {isListening && (
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map(i => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ height: [8, 16, 8] }}
                                                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                                    className="w-1 bg-primary rounded-full"
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        onClick={toggleVoice}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-primary text-white shadow-gold' : 'hover:bg-slate-50 text-slate-400'}`}
                                    >
                                        <Mic className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Category Quick Filters */}
                            <div className="flex flex-wrap gap-2 mb-16">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${!selectedCategory ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                >
                                    All Categories
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-gold' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                                {/* Left side: History & Trending */}
                                <div className="lg:col-span-4 space-y-16">
                                    {searchHistory.length > 0 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                                                    <Clock className="w-3 h-3" /> Recent Searches
                                                </h3>
                                                <button onClick={clearHistory} className="text-[8px] font-bold uppercase tracking-widest text-primary hover:underline">Clear All</button>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {searchHistory.map((term, i) => (
                                                    <button key={i} onClick={() => setSearch(term)} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-primary/5 group transition-colors">
                                                        <span className="text-sm font-medium text-slate-600 group-hover:text-primary transition-colors">{term}</span>
                                                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                                            <TrendingUp className="w-3 h-3" /> Popular Right Now
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {trendingSearches.map((item, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setSearch(item.term)}
                                                    className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-premium border border-transparent hover:border-primary/10 transition-all text-left"
                                                >
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[8px] font-bold text-primary uppercase tracking-widest">{item.category}</span>
                                                        <span className="text-sm font-bold text-slate-900">{item.term}</span>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right side: Dynamic Results */}
                                <div className="lg:col-span-8">
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">
                                                {search || selectedCategory ? (
                                                    <span>Found <span className="text-primary">{filteredResults.length}</span> Masterpieces</span>
                                                ) : (
                                                    "Curated Recommendations"
                                                )}
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {filteredResults.map((p, i) => (
                                                <motion.div
                                                    key={p.node.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    onClick={() => handleSelectProduct(p.node.handle)}
                                                    className="group flex gap-5 cursor-pointer p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                                                >
                                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                                        {p.node.images.edges[0] && (
                                                            <img src={p.node.images.edges[0].node.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col justify-center gap-1 overflow-hidden">
                                                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] truncate">
                                                            {p.node.productType || p.node.handle.split('-')[0]}
                                                        </span>
                                                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{p.node.title}</h4>
                                                        <p className="text-[11px] font-black text-slate-950">
                                                            {p.node.priceRange.minVariantPrice.currencyCode} {parseFloat(p.node.priceRange.minVariantPrice.amount).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            ))}

                                            {(search || selectedCategory) && filteredResults.length === 0 && (
                                                <div className="col-span-full py-20 text-center">
                                                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                                                        <Search className="w-6 h-6 text-slate-300" />
                                                    </div>
                                                    <p className="text-xl font-bold text-slate-900">No pieces found matching your criteria</p>
                                                    <button
                                                        onClick={() => { setSearch(""); setSelectedCategory(null); }}
                                                        className="mt-4 text-primary font-bold text-xs uppercase tracking-widest hover:underline"
                                                    >
                                                        Clear all filters
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
