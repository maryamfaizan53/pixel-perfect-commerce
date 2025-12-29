import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search, Loader2, Clock, X, Mic, MicOff, TrendingUp, ArrowRight, Sparkles, Filter,
    ChevronRight, ArrowUpDown, ShoppingBag, Check, SlidersHorizontal, Package, Info
} from "lucide-react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { debounce } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";

const SEARCH_HISTORY_KEY = "product-search-history";
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
    const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured");
    const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number, max: number } | null>(null);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [showFilters, setShowFilters] = useState(false);

    const recognitionRef = useRef<any>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const addItem = useCartStore(state => state.addItem);

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
            return []; // Show nothing initially unless a filter is active
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
            return 0; // Default featured (original order)
        });

        return results.slice(0, 16);
    }, [search, products, selectedCategory, sortBy, selectedPriceRange, inStockOnly]);

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
                const data = await fetchProducts(200);
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
        } else if (e.key === "Enter" && activeIndex >= 0) {
            handleSelectProduct(filteredResults[activeIndex].node.handle);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onKeyDown={handleKeyDown}
                    className="fixed inset-0 z-[100] bg-white flex flex-col font-inter"
                >
                    {/* Header */}
                    <div className="container-custom h-20 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-4 text-primary">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900">Pixel-Perfect Concierge</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className={`rounded-full px-5 text-[10px] font-black uppercase tracking-widest ${showFilters ? 'bg-primary text-white' : 'bg-slate-50'}`}
                            >
                                <SlidersHorizontal className="w-3 h-3 mr-2" />
                                {showFilters ? 'Hide Filters' : 'Advanced Filters'}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full w-10 h-10 hover:bg-slate-100">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pt-10 pb-24">
                        <div className="container-custom max-w-7xl">
                            {/* Input Area */}
                            <div className="relative mb-10 group">
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-primary transition-transform group-focus-within:scale-110" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search the archive..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-transparent border-none text-3xl md:text-5xl font-black pl-14 pr-24 outline-none placeholder:text-slate-100 tracking-tight"
                                />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                    {isListening && (
                                        <div className="flex gap-1 items-end h-6">
                                            {[1, 2, 3, 4].map(i => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ height: ["20%", "100%", "20%"] }}
                                                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                                    className="w-1.5 bg-primary rounded-full"
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        onClick={toggleVoice}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-primary text-white shadow-gold scale-110' : 'hover:bg-slate-50 text-slate-400'}`}
                                    >
                                        <Mic className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Advanced Filter Panel */}
                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mb-12"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort By</h4>
                                                <div className="flex flex-col gap-2">
                                                    {[
                                                        { id: "featured", label: "Featured" },
                                                        { id: "newest", label: "New Arrivals" },
                                                        { id: "price-asc", label: "Price: Low to High" },
                                                        { id: "price-desc", label: "Price: High to Low" }
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => setSortBy(opt.id as any)}
                                                            className={`text-left text-xs font-bold px-4 py-2 rounded-xl transition-all ${sortBy === opt.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price Range (PKR)</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {priceRanges.map((range, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setSelectedPriceRange(selectedPriceRange === range ? null : range)}
                                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedPriceRange === range ? 'bg-primary text-white' : 'bg-white border border-slate-100 text-slate-600 hover:border-primary/30'}`}
                                                        >
                                                            {range.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Availability</h4>
                                                <button
                                                    onClick={() => setInStockOnly(!inStockOnly)}
                                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${inStockOnly ? 'bg-white border-primary/20 text-primary' : 'bg-white border-slate-100 text-slate-500'}`}
                                                >
                                                    <span className="text-xs font-bold">In-Stock Only</span>
                                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${inStockOnly ? 'bg-primary' : 'bg-slate-200'}`}>
                                                        <motion.div
                                                            animate={{ x: inStockOnly ? 20 : 2 }}
                                                            className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                                                        />
                                                    </div>
                                                </button>
                                            </div>

                                            <div className="flex flex-col justify-end">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCategory(null);
                                                        setSortBy("featured");
                                                        setSelectedPriceRange(null);
                                                        setInStockOnly(false);
                                                        setSearch("");
                                                    }}
                                                    className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors"
                                                >
                                                    Reset All Filters
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Category Quick Selector */}
                            {!showFilters && (
                                <div className="flex flex-wrap gap-2 mb-12">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${!selectedCategory ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        All
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
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                                {/* Left side: History & Trending */}
                                <div className="lg:col-span-4 space-y-16">
                                    {searchHistory.length > 0 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300 flex items-center gap-2">
                                                    <Clock className="w-3 h-3" /> Recent Searches
                                                </h3>
                                                <button onClick={clearHistory} className="text-[8px] font-bold uppercase tracking-widest text-primary hover:underline">Clear</button>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {searchHistory.map((term, i) => (
                                                    <button key={i} onClick={() => setSearch(term)} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-premium group transition-all text-left">
                                                        <span className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">{term}</span>
                                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300 flex items-center gap-2">
                                            <TrendingUp className="w-3 h-3" /> Trending Collections
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            {trendingSearches.map((item, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setSearch(item.term)}
                                                    className="group flex items-center justify-between p-5 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-premium border border-transparent hover:border-primary/10 transition-all text-left"
                                                >
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">{item.category}</span>
                                                        <span className="text-base font-bold text-slate-900 tracking-tight">{item.term}</span>
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
                                                {search || selectedCategory || selectedPriceRange || inStockOnly ? (
                                                    <span>Found <span className="text-primary">{filteredResults.length}</span> results</span>
                                                ) : (
                                                    "Concierge Picks"
                                                )}
                                            </h2>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                                                <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Quick Navigation: Arrows + Enter</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {filteredResults.map((p, i) => (
                                                <motion.div
                                                    key={p.node.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.02 }}
                                                    onClick={() => handleSelectProduct(p.node.handle)}
                                                    className={`group relative flex gap-5 cursor-pointer p-4 rounded-3xl transition-all border ${activeIndex === i ? 'bg-primary/5 border-primary/20 shadow-premium' : 'hover:bg-slate-50 border-transparent hover:border-slate-100'}`}
                                                >
                                                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                                                        {p.node.images.edges[0] && (
                                                            <img src={p.node.images.edges[0].node.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col justify-center gap-1.5 overflow-hidden">
                                                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] truncate">
                                                            {p.node.productType || p.node.handle.split('-')[0]}
                                                        </span>
                                                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{p.node.title}</h4>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <p className="text-xs font-black text-slate-950">
                                                                <span className="text-[10px] font-bold mr-1 text-slate-400">{p.node.priceRange.minVariantPrice.currencyCode}</span>
                                                                {parseFloat(p.node.priceRange.minVariantPrice.amount).toLocaleString()}
                                                            </p>
                                                            <button
                                                                onClick={(e) => handleQuickAdd(e, p)}
                                                                className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all hover:bg-primary hover:text-white hover:border-primary shadow-sm"
                                                                title="Quick Add"
                                                            >
                                                                <ShoppingBag className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}

                                            {(search || selectedCategory || selectedPriceRange || inStockOnly) && filteredResults.length === 0 && (
                                                <div className="col-span-full py-20 text-center">
                                                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                                                        <Package className="w-8 h-8 text-slate-200" />
                                                    </div>
                                                    <h3 className="text-2xl font-black text-slate-900 mb-2">No matches found</h3>
                                                    <p className="text-slate-400 text-sm mb-8">Try adjusting your filters or search terms for better results.</p>
                                                    <button
                                                        onClick={() => {
                                                            setSearch("");
                                                            setSelectedCategory(null);
                                                            setSelectedPriceRange(null);
                                                            setInStockOnly(false);
                                                        }}
                                                        className="px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-gold hover:scale-105 transition-transform"
                                                    >
                                                        Clear All Filters
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
