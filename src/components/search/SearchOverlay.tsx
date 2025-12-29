import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search, Loader2, Clock, X, Mic, MicOff, TrendingUp, ArrowRight, Sparkles, Filter,
    ChevronRight, ArrowUpDown, ShoppingBag, Check, SlidersHorizontal, Package, Info,
    Zap, Bookmark, Eye, Trophy, Layers, CreditCard
} from "lucide-react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { debounce } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";

const SEARCH_HISTORY_KEY = "product-search-history";
const RECENTLY_VIEWED_KEY = "recently-viewed-products";
const MAX_HISTORY_ITEMS = 6;

const trendingSearches = [
    { term: "Luxury Kitchenware", category: "Culinary" },
    { term: "Organic Wellness", category: "Health" },
    { term: "Designer Fragrance", category: "Boutique" },
    { term: "Sustainable Living", category: "Lifestyle" }
];

const priceRanges = [
    { label: "Under 5k", min: 0, max: 5000 },
    { label: "5k - 15k", min: 5000, max: 15000 },
    { label: "15k - 30k", min: 15000, max: 30000 },
    { label: "Premium 30k+", min: 30000, max: Infinity }
];

const getAILabel = (product: ShopifyProduct) => {
    const handle = product.node.handle.toLowerCase();
    const title = product.node.title.toLowerCase();
    const price = parseFloat(product.node.priceRange.minVariantPrice.amount);

    if (price > 40000) return { text: "Investment Grade", icon: Trophy, color: "text-amber-500 bg-amber-50" };
    if (handle.includes('new')) return { text: "Fresh Arrival", icon: Zap, color: "text-blue-500 bg-blue-50" };
    if (title.includes('organic') || title.includes('pure')) return { text: "Eco-Conscious", icon: Bookmark, color: "text-emerald-500 bg-emerald-50" };
    if (product.node.availableForSale) return { text: "Highly Coveted", icon: Sparkles, color: "text-primary bg-primary/5" };
    return { text: "Limited Edition", icon: Layers, color: "text-slate-500 bg-slate-50" };
};

interface SearchBarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SearchOverlay = ({ isOpen, onClose }: SearchBarProps) => {
    const [search, setSearch] = useState("");
    const [suggestion, setSuggestion] = useState("");
    const [products, setProducts] = useState<ShopifyProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [recentlyViewed, setRecentlyViewed] = useState<ShopifyProduct[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured");
    const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number, max: number } | null>(null);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [showFilters, setShowFilters] = useState(false);

    const recognitionRef = useRef<any>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const addItem = useCartStore(state => state.addItem);

    // AI Typeahead Logic
    useEffect(() => {
        if (!search.trim()) {
            setSuggestion("");
            return;
        }

        const match = trendingSearches.find(t =>
            t.term.toLowerCase().startsWith(search.toLowerCase())
        );

        if (match && match.term.toLowerCase() !== search.toLowerCase()) {
            setSuggestion(match.term);
        } else {
            setSuggestion("");
        }
    }, [search]);

    // Recently Viewed Logic
    useEffect(() => {
        const loadRecent = () => {
            const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setRecentlyViewed(parsed.slice(0, 4));
                } catch (e) {
                    console.error("Failed to parse recently viewed", e);
                }
            }
        };
        if (isOpen) loadRecent();
    }, [isOpen]);

    // Extract unique categories from products
    const categories = useMemo(() => {
        const cats = new Set<string>();
        products.forEach(p => {
            if (p.node.productType) cats.add(p.node.productType);
            const handlePart = p.node.handle.split('-')[0];
            if (handlePart) cats.add(handlePart.charAt(0).toUpperCase() + handlePart.slice(1));
        });
        return Array.from(cats).slice(0, 10);
    }, [products]);

    const filteredResults = useMemo(() => {
        let results = products;

        // Text Search
        if (search.trim()) {
            const lowerQuery = search.toLowerCase();
            results = results.filter(p =>
                p.node.title.toLowerCase().includes(lowerQuery) ||
                p.node.description.toLowerCase().includes(lowerQuery)
            );
        } else if (!selectedCategory && !selectedPriceRange && !inStockOnly) {
            return [];
        }

        // Category Filter
        if (selectedCategory) {
            results = results.filter(p =>
                p.node.productType === selectedCategory ||
                p.node.handle.toLowerCase().includes(selectedCategory.toLowerCase())
            );
        }

        // Price Filter
        if (selectedPriceRange) {
            results = results.filter(p => {
                const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
                return price >= selectedPriceRange.min && price <= selectedPriceRange.max;
            });
        }

        // Availability Filter
        if (inStockOnly) {
            results = results.filter(p => p.node.availableForSale);
        }

        // Sorting
        results = [...results].sort((a, b) => {
            const priceA = parseFloat(a.node.priceRange.minVariantPrice.amount);
            const priceB = parseFloat(b.node.priceRange.minVariantPrice.amount);

            if (sortBy === "price-asc") return priceA - priceB;
            if (sortBy === "price-desc") return priceB - priceA;
            if (sortBy === "newest") return b.node.handle.includes('new') ? 1 : -1;
            return 0;
        });

        return results.slice(0, 16);
    }, [search, products, selectedCategory, sortBy, selectedPriceRange, inStockOnly]);

    const spotlightProduct = useMemo(() => {
        if (search.trim() && filteredResults.length > 0) {
            return filteredResults[0];
        }
        return null;
    }, [search, filteredResults]);

    const otherResults = useMemo(() => {
        return spotlightProduct ? filteredResults.slice(1) : filteredResults;
    }, [spotlightProduct, filteredResults]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => inputRef.current?.focus(), 100);
            setActiveIndex(-1);
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
                const data = await fetchProducts(250);
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

    const handleQuickAdd = (e: React.MouseEvent, p: ShopifyProduct) => {
        e.stopPropagation();
        const variant = p.node.variants.edges[0]?.node;
        if (!variant) return;

        addItem({
            product: p,
            variantId: variant.id,
            variantTitle: variant.title,
            price: variant.price,
            quantity: 1,
            selectedOptions: variant.selectedOptions || []
        });

        toast.success("Added to collection", {
            description: p.node.title,
            icon: <ShoppingBag className="w-4 h-4" />
        });
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
        if (!recognitionRef.current) return toast.error("Speech recognition not supported");
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (filteredResults.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Tab" && suggestion) {
            e.preventDefault();
            setSearch(suggestion);
            setSuggestion("");
        } else if (e.key === "Enter" && activeIndex >= 0) {
            handleSelectProduct(filteredResults[activeIndex].node.handle);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onKeyDown={handleKeyDown}
                    className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-2xl flex flex-col font-inter"
                >
                    {/* Header */}
                    <div className="container-custom h-24 flex items-center justify-between border-b border-slate-100 bg-white/50 sticky top-0 z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-gold">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Elite Ultra-Search</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Concierge v2.4</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className={`rounded-2xl px-6 h-12 text-[10px] font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-primary text-white shadow-gold' : 'bg-slate-50 border border-slate-100'}`}
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
                                {showFilters ? 'Hide Advanced' : 'Tailor Results'}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl w-12 h-12 bg-slate-50 border border-slate-100">
                                <X className="w-5 h-5 text-slate-900" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pt-16 pb-32">
                        <div className="container-custom max-w-7xl">
                            {/* Cinematic Input Area */}
                            <div className="relative mb-16 group">
                                <div className="absolute -left-4 top-1/2 -translate-y-1/2 p-4">
                                    <Search className="w-10 h-10 text-primary transition-transform group-focus-within:scale-110" />
                                </div>

                                <div className="relative">
                                    {/* Typeahead Suggestion Background */}
                                    <div className="absolute left-16 top-1/2 -translate-y-1/2 text-4xl md:text-7xl font-black text-slate-100 pointer-events-none select-none tracking-tighter truncate w-full">
                                        {suggestion && search && suggestion.toLowerCase().startsWith(search.toLowerCase()) && (
                                            <>
                                                <span className="opacity-0">{search}</span>
                                                <span className="opacity-100">{suggestion.slice(search.length)}</span>
                                            </>
                                        )}
                                    </div>

                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="What are you seeking?"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full bg-transparent border-none text-4xl md:text-7xl font-black pl-16 pr-24 outline-none placeholder:text-slate-100 tracking-tighter text-slate-900 caret-primary"
                                    />
                                </div>

                                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-4">
                                    {isListening && (
                                        <div className="flex gap-1.5 items-end h-8">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ height: ["20%", "100%", "20%"] }}
                                                    transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.08 }}
                                                    className="w-2 bg-primary rounded-full shadow-gold"
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        onClick={toggleVoice}
                                        className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all ${isListening ? 'bg-primary text-white shadow-gold scale-110' : 'bg-slate-50 text-slate-400 hover:text-primary hover:bg-white hover:shadow-premium'}`}
                                    >
                                        <Mic className="w-6 h-6" />
                                    </button>
                                </div>
                                {suggestion && (
                                    <div className="absolute -bottom-8 left-16 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                        <Zap className="w-3 h-3 text-primary animate-pulse" />
                                        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">Tab</kbd> to autocomplete</span>
                                    </div>
                                )}
                            </div>

                            {/* Advanced Filter Panel */}
                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0, y: -20 }}
                                        animate={{ height: "auto", opacity: 1, y: 0 }}
                                        exit={{ height: 0, opacity: 0, y: -20 }}
                                        className="overflow-hidden mb-20"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 p-10 bg-slate-50/50 backdrop-blur-md rounded-[3rem] border border-slate-100 shadow-inner">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2">
                                                    <ArrowUpDown className="w-4 h-4 text-primary" />
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort Matrix</h4>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {[
                                                        { id: "featured", label: "Curated Masterpieces" },
                                                        { id: "newest", label: "Fresh Arrivals" },
                                                        { id: "price-asc", label: "Investment: Low to High" },
                                                        { id: "price-desc", label: "Investment: High to Low" }
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => setSortBy(opt.id as any)}
                                                            className={`text-left text-sm font-bold px-6 py-3 rounded-2xl transition-all ${sortBy === opt.id ? 'bg-white text-primary shadow-premium border border-primary/10' : 'text-slate-500 hover:text-slate-900'}`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-primary" />
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price Tier</h4>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {priceRanges.map((range, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setSelectedPriceRange(selectedPriceRange === range ? null : range)}
                                                            className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border ${selectedPriceRange === range ? 'bg-primary text-white border-primary shadow-gold' : 'bg-white border-slate-100 text-slate-500 hover:border-primary/30'}`}
                                                        >
                                                            {range.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center gap-2">
                                                    <Info className="w-4 h-4 text-primary" />
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Availability</h4>
                                                </div>
                                                <button
                                                    onClick={() => setInStockOnly(!inStockOnly)}
                                                    className={`w-full flex items-center justify-between p-5 rounded-[2rem] border bg-white transition-all ${inStockOnly ? 'border-primary/20 bg-primary/5 text-primary' : 'border-slate-100 text-slate-500'}`}
                                                >
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="text-xs font-bold">Immediate Collection</span>
                                                        <span className="text-[8px] opacity-70 uppercase tracking-widest">In-Stock Only</span>
                                                    </div>
                                                    <div className={`w-12 h-6 rounded-full relative transition-colors ${inStockOnly ? 'bg-primary' : 'bg-slate-200'}`}>
                                                        <motion.div
                                                            animate={{ x: inStockOnly ? 24 : 4 }}
                                                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                                                        />
                                                    </div>
                                                </button>
                                            </div>

                                            <div className="flex flex-col justify-end gap-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedCategory(null);
                                                        setSortBy("featured");
                                                        setSelectedPriceRange(null);
                                                        setInStockOnly(false);
                                                        setSearch("");
                                                    }}
                                                    className="w-full h-14 rounded-2xl border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
                                                >
                                                    Flush Parameters
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                                {/* Left side: History & Trending */}
                                <div className="lg:col-span-4 space-y-16">
                                    {recentlyViewed.length > 0 && (
                                        <div className="space-y-6 pt-4">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                                                <Eye className="w-4 h-4 text-primary" /> Recently Admired
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {recentlyViewed.map((p, i) => (
                                                    <button
                                                        key={p.node.id}
                                                        onClick={() => handleSelectProduct(p.node.handle)}
                                                        className="group relative aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100"
                                                    >
                                                        {p.node.images.edges[0] && (
                                                            <img src={p.node.images.edges[0].node.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                        )}
                                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                                            <span className="text-[8px] font-bold text-white uppercase truncate block">{p.node.title}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-8">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                                            <TrendingUp className="w-4 h-4 text-primary" /> Curated Discoveries
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-primary text-white shadow-gold border-primary' : 'bg-slate-50 border border-slate-100 text-slate-500 hover:bg-white hover:border-primary/20'}`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {searchHistory.length > 0 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                                                    <Clock className="w-4 h-4 text-primary" /> Recent Enquiries
                                                </h3>
                                                <button onClick={clearHistory} className="text-[8px] font-black uppercase tracking-widest text-primary hover:underline">Flush</button>
                                            </div>
                                            <div className="space-y-2">
                                                {searchHistory.map((term, i) => (
                                                    <button key={i} onClick={() => setSearch(term)} className="w-full flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 hover:bg-white hover:shadow-premium group transition-all text-left">
                                                        <span className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">{term}</span>
                                                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-primary" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right side: Cinematic Dynamic Results */}
                                <div className="lg:col-span-8">
                                    <div className="space-y-12">
                                        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                                            <div className="flex flex-col gap-1">
                                                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                                    {search || selectedCategory || selectedPriceRange || inStockOnly ? (
                                                        <span>Discovery results <span className="text-primary">({filteredResults.length})</span></span>
                                                    ) : (
                                                        "Elite Curations"
                                                    )}
                                                </h2>
                                                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                                    <Info className="w-3 h-3 text-primary" />
                                                    <span>Proprietary Search Algorithm Active</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-12">
                                            {/* Spotlight Card */}
                                            {spotlightProduct && (
                                                <motion.div
                                                    layoutId="spotlight"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="group relative bg-slate-950 rounded-[3rem] overflow-hidden p-8 flex flex-col md:flex-row gap-8 shadow-2xl cursor-pointer"
                                                    onClick={() => handleSelectProduct(spotlightProduct.node.handle)}
                                                >
                                                    <div className="w-full md:w-1/2 aspect-square rounded-[2rem] overflow-hidden relative">
                                                        <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-primary/95 backdrop-blur-md rounded-xl text-[8px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2 shadow-gold">
                                                            <Trophy className="w-3 h-3" /> Masterpiece Selection
                                                        </div>
                                                        {spotlightProduct.node.images.edges[0] && (
                                                            <img src={spotlightProduct.node.images.edges[0].node.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt="" />
                                                        )}
                                                    </div>
                                                    <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
                                                        <div className="space-y-2">
                                                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Primary Match</span>
                                                            <h3 className="text-3xl md:text-4xl font-black text-white leading-none tracking-tighter">
                                                                {spotlightProduct.node.title}
                                                            </h3>
                                                            <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed font-medium">
                                                                {spotlightProduct.node.description}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Acquisition Vault</span>
                                                                <span className="text-2xl font-black text-white tracking-tight">
                                                                    <span className="text-xs mr-1 text-primary">{spotlightProduct.node.priceRange.minVariantPrice.currencyCode}</span>
                                                                    {parseFloat(spotlightProduct.node.priceRange.minVariantPrice.amount).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                className="h-14 w-14 rounded-2xl bg-white text-slate-900 hover:bg-primary hover:text-white transition-all shadow-xl"
                                                                onClick={(e) => handleQuickAdd(e, spotlightProduct)}
                                                            >
                                                                <ShoppingBag className="w-6 h-6" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Results Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                {otherResults.map((p, i) => {
                                                    const aiLabel = getAILabel(p);
                                                    const Icon = aiLabel.icon;

                                                    return (
                                                        <motion.div
                                                            key={p.node.id}
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            onClick={() => handleSelectProduct(p.node.handle)}
                                                            className={`group relative flex flex-col gap-4 cursor-pointer p-6 rounded-[2.5rem] transition-all border-2 ${activeIndex === i + (spotlightProduct ? 1 : 0) ? 'border-primary shadow-premium bg-white' : 'border-transparent bg-slate-50/50 hover:bg-white hover:shadow-premium hover:border-slate-100'}`}
                                                        >
                                                            <div className={`absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full ${aiLabel.color} flex items-center gap-2 scale-90 opacity-0 group-hover:opacity-100 transition-all duration-300`}>
                                                                <Icon className="w-3 h-3" />
                                                                <span className="text-[8px] font-black uppercase tracking-widest">{aiLabel.text}</span>
                                                            </div>

                                                            <div className="aspect-square rounded-[2rem] overflow-hidden bg-white shadow-sm">
                                                                {p.node.images.edges[0] && (
                                                                    <img src={p.node.images.edges[0].node.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-3 px-2">
                                                                <div className="space-y-1">
                                                                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em]">
                                                                        {p.node.productType || p.node.handle.split('-')[0]} Boutique
                                                                    </span>
                                                                    <h4 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight line-clamp-1">{p.node.title}</h4>
                                                                </div>
                                                                <div className="flex items-center justify-between pt-3 border-t border-slate-100/10">
                                                                    <p className="text-xl font-black text-slate-950 tracking-tight">
                                                                        <span className="text-[10px] font-bold mr-1 text-slate-400">{p.node.priceRange.minVariantPrice.currencyCode}</span>
                                                                        {parseFloat(p.node.priceRange.minVariantPrice.amount).toLocaleString()}
                                                                    </p>
                                                                    <button
                                                                        onClick={(e) => handleQuickAdd(e, p)}
                                                                        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-primary hover:text-white hover:shadow-gold"
                                                                        title="Quick Add"
                                                                    >
                                                                        <ShoppingBag className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}

                                                {(search || selectedCategory || selectedPriceRange || inStockOnly) && filteredResults.length === 0 && (
                                                    <div className="col-span-full py-24 text-center">
                                                        <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mx-auto mb-8 shadow-inner">
                                                            <Search className="w-10 h-10 text-slate-200" />
                                                        </div>
                                                        <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter">No masterpieces match your criteria</h3>
                                                        <p className="text-slate-400 text-sm mb-12 max-w-md mx-auto font-medium">The archive is vast, but currently elusive. Try broadening your parameters for better acquisition paths.</p>
                                                        <button
                                                            onClick={() => {
                                                                setSearch("");
                                                                setSelectedCategory(null);
                                                                setSelectedPriceRange(null);
                                                                setInStockOnly(false);
                                                            }}
                                                            className="px-10 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-premium hover:bg-primary hover:shadow-gold transition-all"
                                                        >
                                                            Reset Matrix
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
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
