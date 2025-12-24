import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Clock, X, Mic, MicOff, TrendingUp, ArrowRight } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { debounce } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const SEARCH_HISTORY_KEY = "product-search-history";
const MAX_HISTORY_ITEMS = 5;

const trendingSearches = ["Summer Collection", "New Arrivals", "Best Sellers", "Sale"];

export const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearch(transcript);
        handleSearchChange(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error('Voice search failed. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(50);
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
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
      const filtered = products.filter(product => {
        const title = product.node.title.toLowerCase();
        const description = product.node.description?.toLowerCase() || "";
        return title.includes(lowerQuery) || description.includes(lowerQuery);
      }).slice(0, 6);

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

  const saveSearchToHistory = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) return;

    const updatedHistory = [
      trimmedQuery,
      ...searchHistory.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase())
    ].slice(0, MAX_HISTORY_ITEMS);

    setSearchHistory(updatedHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  const handleSelectProduct = (productHandle: string) => {
    saveSearchToHistory(search);
    setOpen(false);
    setSearch("");
    setFilteredProducts([]);
    navigate(`/product/${productHandle}`);
  };

  const handleSelectHistoryItem = (query: string) => {
    setSearch(query);
    handleSearchChange(query);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  const removeHistoryItem = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = searchHistory.filter(item => item !== query);
    setSearchHistory(updatedHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) {
      toast.error('Voice search is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
      toast.info('Listening... Speak now');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div 
          className={`relative w-full md:w-[280px] lg:w-[320px] transition-all duration-300 ${isFocused ? 'md:w-[320px] lg:w-[380px]' : ''}`}
        >
          <div className={`relative flex items-center rounded-2xl transition-all duration-300 ${isFocused ? 'ring-2 ring-primary/20 bg-background shadow-lg' : 'bg-muted/50 hover:bg-muted'}`}>
            <Search className="absolute left-4 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                setOpen(true);
                setIsFocused(true);
              }}
              onBlur={() => setIsFocused(false)}
              className="w-full pl-11 pr-20 py-3 bg-transparent border-none rounded-2xl text-sm font-medium placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearch("");
                    setFilteredProducts([]);
                    inputRef.current?.focus();
                  }}
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
                  type="button"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVoiceSearch}
                className={`h-7 w-7 rounded-lg ${isListening ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
                type="button"
              >
                {isListening ? <MicOff className="h-3.5 w-3.5 animate-pulse" /> : <Mic className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-[360px] p-0 rounded-2xl shadow-2xl border-border/50" align="start" side="bottom" sideOffset={8}>
        <Command shouldFilter={false}>
          <CommandList className="max-h-[400px]">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-8"
                >
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
            
            {!loading && !search && (
              <>
                {/* Trending Searches */}
                <CommandGroup heading={
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Trending
                  </div>
                }>
                  <div className="flex flex-wrap gap-2 p-2">
                    {trendingSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSelectHistoryItem(term)}
                        className="px-3 py-1.5 text-xs font-semibold bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </CommandGroup>

                {searchHistory.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading={
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          Recent
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearHistory}
                          className="h-6 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear
                        </Button>
                      </div>
                    }>
                      {searchHistory.map((query, index) => (
                        <CommandItem
                          key={index}
                          value={query}
                          onSelect={() => handleSelectHistoryItem(query)}
                          className="flex items-center gap-3 p-3 cursor-pointer rounded-xl mx-1"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 font-medium">{query}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => removeHistoryItem(query, e)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </>
            )}
            
            {!loading && search && filteredProducts.length === 0 && (
              <CommandEmpty className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No products found</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Try a different search term</p>
              </CommandEmpty>
            )}
            
            {!loading && filteredProducts.length > 0 && (
              <CommandGroup heading={
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Products
                </span>
              }>
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.node.id}
                    value={product.node.handle}
                    onSelect={() => handleSelectProduct(product.node.handle)}
                    className="flex items-center gap-4 p-3 cursor-pointer rounded-xl mx-1 group"
                  >
                    <div className="w-14 h-14 flex-shrink-0 bg-muted rounded-xl overflow-hidden">
                      {product.node.images?.edges?.[0]?.node && (
                        <img
                          src={product.node.images.edges[0].node.url}
                          alt={product.node.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{product.node.title}</p>
                      <p className="text-sm font-bold text-primary">
                        PKR {parseFloat(product.node.priceRange.minVariantPrice.amount).toLocaleString('en-PK')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
