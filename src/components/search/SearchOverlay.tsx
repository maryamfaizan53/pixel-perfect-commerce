import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Clock, X, Mic, MicOff, TrendingUp, ArrowRight, Sparkles, Filter } from "lucide-react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { debounce } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const SEARCH_HISTORY_KEY = "product-search-history";
const MAX_HISTORY_ITEMS = 6;

const trendingSearches = [
    { term: "Limited Edition Heritage", category: "Boutique" },
    { term: "Artisan Kitchen Tools", category: "Culinary" },
    { term: "Architectural Stationery", category: "Studio" },
    { term: "Signature Fragrances", category: "Essence" }
];

interface SearchBarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SearchOverlay = ({ isOpen, onClose }: SearchBarProps) => {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<ShopifyProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

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
                handleSearchChange(transcript);
                setIsListening(false);
            };
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

    const filterProducts = useCallback(
        debounce((query: string) => {
            if (!query.trim()) {
                setFilteredProducts([]);
                setLoading(false);
                return;
            }
            const lowerQuery = query.toLowerCase();
            const filtered = products.filter(p => {
                const title = p.node.title.toLowerCase();
                return title.includes(lowerQuery);
            }).slice(0, 8);
            setFilteredProducts(filtered);
            setLoading(false);
        }, 300),
        [products]
    );

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setLoading(true);
        filterProducts(value);
    };

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
        if (!recognitionRef.current) return toast.error("Not supported");
        if (isListening) recognitionRef.current.stop();
        else {
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
                    className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-3xl flex flex-col"
                >
                    {/* Header */}
                    <div className="container-custom h-24 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-4 text-primary">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Intelligent Curation</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full w-12 h-12 bg-slate-50">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto pt-12 pb-24">
                        <div className="container-custom max-w-5xl">
                            {/* Input Area */}
                            <div className="relative mb-20">
                                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 text-primary/30" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="What are you looking for?"
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full bg-transparent border-none text-4xl md:text-6xl font-playfair italic font-black pl-16 pr-24 outline-none placeholder:text-slate-200"
                                />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-4">
                                    {loading && <Loader2 className="w-8 h-8 animate-spin text-primary" />}
                                    <button onClick={toggleVoice} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-primary text-white scale-110 shadow-gold' : 'bg-slate-50 text-slate-400 hove:text-primary'}`}>
                                        <Mic className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                                {/* Left side: Suggestions */}
                                <div className="lg:col-span-4 space-y-12">
                                    {!search && (
                                        <>
                                            <div className="space-y-6">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Trending Now</h3>
                                                <div className="space-y-4">
                                                    {trendingSearches.map((item, i) => (
                                                        <motion.button
                                                            key={i}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            onClick={() => handleSearchChange(item.term)}
                                                            className="group flex flex-col items-start text-left w-full hover:translate-x-2 transition-transform"
                                                        >
                                                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest text-[8px] mb-1">{item.category}</span>
                                                            <span className="text-xl font-bold font-playfair italic group-hover:text-primary transition-colors">{item.term}</span>
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>

                                            {searchHistory.length > 0 && (
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Recent Visits</h3>
                                                        <button onClick={clearHistory} className="text-[8px] font-black uppercase tracking-widest text-primary">Clear</button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3">
                                                        {searchHistory.map((term, i) => (
                                                            <button key={i} onClick={() => handleSearchChange(term)} className="px-5 py-2 rounded-full bg-slate-50 text-xs font-bold hover:bg-primary/10 hover:text-primary transition-colors border border-slate-100 flex items-center gap-3">
                                                                <Clock className="w-3 h-3 text-slate-300" />
                                                                {term}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Right side: Results */}
                                <div className="lg:col-span-8">
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                                                {search ? `Results for "${search}"` : "Suggested for you"}
                                            </h3>
                                            <div className="flex items-center gap-6">
                                                <span className="text-[10px] font-black text-slate-300">{filteredProducts.length} Items found</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            {filteredProducts.map((p, i) => (
                                                <motion.div
                                                    key={p.node.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    onClick={() => handleSelectProduct(p.node.handle)}
                                                    className="group flex gap-6 cursor-pointer p-2 rounded-3xl hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                                                        {p.node.images.edges[0] && (
                                                            <img src={p.node.images.edges[0].node.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col justify-center gap-1">
                                                        <span className="text-[8px] font-black text-primary uppercase tracking-[0.3em]">{p.node.handle.split('-')[0]}</span>
                                                        <h4 className="text-sm font-bold truncate max-w-[180px]">{p.node.title}</h4>
                                                        <span className="text-xs font-black">PKR {parseFloat(p.node.priceRange.minVariantPrice.amount).toLocaleString()}</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {search && filteredProducts.length === 0 && !loading && (
                                            <div className="py-20 text-center space-y-4">
                                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
                                                    <Search className="w-8 h-8 text-slate-200" />
                                                </div>
                                                <p className="font-playfair italic text-2xl text-slate-300">No pieces match your search</p>
                                            </div>
                                        )}
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
