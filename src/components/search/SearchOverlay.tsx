import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/product/ProductCard";
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
    const handle = product.node.handle?.toLowerCase() || "";
    const title = product.node.title?.toLowerCase() || "";
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

    // Debounced Search Handler
    useEffect(() => {
        const performSearch = async () => {
            setLoading(true);
            try {
                // If search is empty, fetch general discovery products (no query)
                // If search has text, fetch matches from Shopify (query provided)
                // Append wildcard * to query to ensure partial matches (e.g. "hair" matches "hair-care")
                const trimmed = search.trim();
                const query = trimmed ? `${trimmed}*` : undefined;
                const limit = query ? 250 : 20; // 250 results for full search visibility

                const data = await fetchProducts(limit, query);
                setProducts(data);
            } catch (e) {
                console.error("Search failed", e);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(performSearch, 300); // 300ms debounce
        return () => clearTimeout(timeoutId);
    }, [search]);

    // Extract unique categories from products
    const categories = useMemo(() => {
        const cats = new Set<string>();
        // Only generate categories from the initial discovery set if possible, 
        // but since we refresh products on search, we might want to keep a separate "discoveryProducts" state if we want persistent categories.
        // For now, dynamic categories based on results are also fine.
        products.forEach(p => {
            const handlePart = p.node.handle.split('-')[0];
            if (handlePart) cats.add(handlePart.charAt(0).toUpperCase() + handlePart.slice(1));
        });
        return Array.from(cats).slice(0, 10);
    }, [products]);

    const filteredResults = useMemo(() => {
        let results = products;

        // Apply Client-Side Ranking to Server-Side Results
        // Shopify returns matches, but we want to ensure "Best Match" logic is applied visually
        if (search.trim()) {
            const lowerQuery = search.toLowerCase();
            const terms = lowerQuery.split(" ").filter(t => t.length > 0);

            results = results
                .map(p => {
                    let score = 0;
                    const title = p.node.title?.toLowerCase() || "";
                    const description = p.node.description?.toLowerCase() || "";
                    const handle = p.node.handle?.toLowerCase() || "";
                    const category = handle.split('-')[0] || "";

                    // Base score for being returned by Shopify (it matched something)
                    score += 1;

                    // Exact match bonus
                    if (title === lowerQuery) score += 100;

                    terms.forEach(term => {
                        if (title.includes(term)) score += 10;
                        if (title.startsWith(term)) score += 5;
                        if (category.includes(term)) score += 8;
                        if (handle.includes(term)) score += 5;
                        if (description.includes(term)) score += 2;
                    });

                    return { product: p, score };
                })
                .sort((a, b) => b.score - a.score)
                .map(item => item.product);
        }

        // Category Filter
        if (selectedCategory) {
            results = results.filter(p =>
                p.node.handle?.toLowerCase().includes(selectedCategory.toLowerCase())
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
        if (sortBy !== 'featured' || !search.trim()) {
            results = [...results].sort((a, b) => {
                const priceA = parseFloat(a.node.priceRange.minVariantPrice.amount);
                const priceB = parseFloat(b.node.priceRange.minVariantPrice.amount);

                if (sortBy === "price-asc") return priceA - priceB;
                if (sortBy === "price-desc") return priceB - priceA;
                if (sortBy === "newest") return b.node.handle.includes('new') ? 1 : -1;
                return 0;
            });
        }

        return results;
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

    const isDiscovery = !search.trim() && !selectedCategory && !selectedPriceRange && !inStockOnly;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onKeyDown={handleKeyDown}
                    className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-3xl flex flex-col font-inter"
                >
                    {/* Header */}
                    <div className="container-custom h-24 flex items-center justify-between border-b border-slate-100/50 bg-white/50 backdrop-blur-md sticky top-0 z-20">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-gold hover:shadow-gold-hover transition-shadow duration-500">
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
                                className={`rounded-2xl px-6 h-12 text-[10px] font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-primary text-white shadow-gold' : 'bg-slate-50 border border-slate-100/50 hover:bg-slate-100'}`}
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
                                {showFilters ? 'Hide Advanced' : 'Tailor Results'}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl w-12 h-12 bg-slate-50 border border-slate-100">
                                <X className="w-5 h-5 text-slate-900" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-scroll overflow-x-hidden pt-12 pb-32 search-overlay-scroll">
                        <div className="container-custom max-w-[1600px]">
                            {/* Cinematic Input Area */}
                            {/* Cinematic Input Area */}
                            <div className="relative mb-12 group max-w-4xl mx-auto px-4">
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                                        <Search className="w-6 h-6" />
                                    </div>

                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="flex w-full border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-14 pr-16 h-16 rounded-2xl border-none bg-slate-100/50 focus:bg-slate-100/80 font-bold text-lg placeholder:text-slate-400/50 transition-all text-slate-900"
                                        placeholder={isDiscovery ? "Search collection..." : "Search..."}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />

                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        {isListening && (
                                            <div className="flex gap-1 items-end h-4 mr-2">
                                                {[1, 2, 3].map(i => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ height: ["20%", "100%", "20%"] }}
                                                        transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.08 }}
                                                        className="w-1 bg-primary rounded-full"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        <button
                                            onClick={toggleVoice}
                                            className={`p-2 rounded-xl transition-all ${isListening ? 'text-primary' : 'text-slate-400 hover:text-primary hover:bg-slate-200/50'}`}
                                        >
                                            <Mic className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                {suggestion && search && suggestion.toLowerCase().startsWith(search.toLowerCase()) && (
                                    <div className="absolute -bottom-6 left-16 flex items-center gap-2 text-[10px] font-bold text-slate-400 ml-4">
                                        <span className="opacity-50">Suggestion:</span>
                                        <span className="text-primary cursor-pointer hover:underline" onClick={() => setSearch(suggestion)}>
                                            {suggestion}
                                        </span>
                                        <span className="ml-2 text-[8px] opacity-40">Press Tab</span>
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
                                        className="overflow-hidden mb-20 max-w-7xl mx-auto"
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

                            {/* Main Layout Area */}
                            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                                {/* Left Sidebar - Categories & History */}
                                <div className="lg:w-64 space-y-12 shrink-0">
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                                            <TrendingUp className="w-4 h-4 text-primary" /> Collections
                                        </h3>
                                        <div className="flex flex-wrap lg:flex-col gap-2">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                                                    className={`px-5 py-3 lg:w-full text-left rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${selectedCategory === cat ? 'bg-primary text-white shadow-gold scale-105' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}`}
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
                                                    <Clock className="w-4 h-4 text-primary" /> Recent
                                                </h3>
                                                <button onClick={clearHistory} className="text-[8px] font-black uppercase tracking-widest text-primary hover:underline">Flush</button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {searchHistory.map((term, i) => (
                                                    <button key={i} onClick={() => setSearch(term)} className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-white hover:shadow-premium border border-transparent hover:border-slate-100 text-xs font-bold text-slate-600 transition-all">
                                                        {term}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Content Area */}
                                <div className="flex-1 min-w-0">
                                    {/* Discovery Header */}
                                    <div className="flex items-end justify-between mb-8 pb-4 border-b border-slate-100">
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
                                                {isDiscovery ? "Trending Now" : `Found ${filteredResults.length} Matches`}
                                            </h2>
                                            <p className="text-slate-400 text-sm font-medium">
                                                {isDiscovery ? "Curated selections based on global trends" : `Showing results for "${search}"`}
                                            </p>
                                        </div>
                                    </div>

                                    {isDiscovery ? (
                                        <div className="space-y-16">
                                            {/* Trending Carousel Scroller */}
                                            <div className="relative -mx-4 lg:-mx-0">
                                                <div className="flex overflow-x-auto gap-6 px-4 lg:px-0 pb-8 snap-x">
                                                    {filteredResults.slice(0, 5).map((p, i) => (
                                                        <motion.div
                                                            key={p.node.id}
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            onClick={() => handleSelectProduct(p.node.handle)}
                                                            className="snap-start shrink-0 w-[280px] group cursor-pointer"
                                                        >
                                                            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-white mb-4 shadow-sm relative">
                                                                <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm">
                                                                    Trend #{i + 1}
                                                                </div>
                                                                {p.node.media?.edges?.[0] && (
                                                                    <img src={p.node.media.edges[0].node.previewImage?.url || p.node.media.edges[0].node.image?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                                )}
                                                            </div>
                                                            <h4 className="text-sm font-black text-slate-900 line-clamp-1">{p.node.title}</h4>
                                                            <p className="text-slate-500 text-xs font-medium">
                                                                <span className="text-primary font-bold mr-1">{p.node.priceRange.minVariantPrice.currencyCode}</span>
                                                                {parseFloat(p.node.priceRange.minVariantPrice.amount).toLocaleString()}
                                                            </p>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Remaining Grid */}
                                            <div className="space-y-8">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Fresh Arrivals</h3>
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                                                    {filteredResults.slice(5).map((p, i) => (
                                                        <ProductCard key={p.node.id} product={p} index={i} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {spotlightProduct && (
                                                <motion.div
                                                    layoutId="spotlight"
                                                    className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden cursor-pointer group shadow-2xl"
                                                    onClick={() => handleSelectProduct(spotlightProduct.node.handle)}
                                                >
                                                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                                    <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                                        <div className="w-full md:w-72 aspect-square rounded-2xl bg-white/5 overflow-hidden">
                                                            {spotlightProduct.node.media?.edges?.[0] && (
                                                                <img src={spotlightProduct.node.media.edges[0].node.previewImage?.url || spotlightProduct.node.media.edges[0].node.image?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 flex flex-col justify-center">
                                                            <div className="flex items-center gap-2 mb-4">
                                                                <div className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full">Top Match</div>
                                                            </div>
                                                            <h3 className="text-3xl font-black mb-2">{spotlightProduct.node.title}</h3>
                                                            <p className="text-slate-400 text-sm mb-6 line-clamp-2 max-w-lg">{spotlightProduct.node.description}</p>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-2xl font-black">{parseFloat(spotlightProduct.node.priceRange.minVariantPrice.amount).toLocaleString()} <span className="text-sm font-bold text-slate-500">{spotlightProduct.node.priceRange.minVariantPrice.currencyCode}</span></span>
                                                                <Button
                                                                    onClick={(e) => handleQuickAdd(e, spotlightProduct)}
                                                                    className="bg-white text-slate-900 hover:bg-gray-100 rounded-xl px-6"
                                                                >
                                                                    Quick Add
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                                                {otherResults.map((p, i) => (
                                                    <ProductCard key={p.node.id} product={p} index={i} />
                                                ))}
                                            </div>

                                            {filteredResults.length === 0 && (
                                                <div className="text-center py-20">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Search className="w-6 h-6 text-slate-300" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-900">No matches found</h3>
                                                    <p className="text-slate-400 text-sm">Try adjusting your terms or filters</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
