import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Clock, X, Mic, MicOff } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { debounce } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SEARCH_HISTORY_KEY = "product-search-history";
const MAX_HISTORY_ITEMS = 5;

export const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
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

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
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
        return;
      }

      const lowerQuery = query.toLowerCase();
      const filtered = products.filter(product => {
        const title = product.node.title.toLowerCase();
        const description = product.node.description?.toLowerCase() || "";
        return title.includes(lowerQuery) || description.includes(lowerQuery);
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
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setOpen(true)}
            className="w-full pl-10 pr-16 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVoiceSearch}
            className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 ${isListening ? 'text-primary animate-pulse' : 'text-muted-foreground hover:text-foreground'}`}
            type="button"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start" side="bottom">
        <Command shouldFilter={false}>
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
            
            {!loading && !search && searchHistory.length > 0 && (
              <>
                <CommandGroup heading="Recent Searches">
                  {searchHistory.map((query, index) => (
                    <CommandItem
                      key={index}
                      value={query}
                      onSelect={() => handleSelectHistoryItem(query)}
                      className="flex items-center gap-3 p-3 cursor-pointer"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{query}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => removeHistoryItem(query, e)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                <div className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    Clear History
                  </Button>
                </div>
              </>
            )}
            
            {!loading && search && filteredProducts.length === 0 && (
              <CommandEmpty>No products found.</CommandEmpty>
            )}
            
            {!loading && filteredProducts.length > 0 && (
              <CommandGroup heading="Products">
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.node.id}
                    value={product.node.handle}
                    onSelect={() => handleSelectProduct(product.node.handle)}
                    className="flex items-center gap-3 p-3 cursor-pointer"
                  >
                    <div className="w-12 h-12 flex-shrink-0 bg-muted rounded overflow-hidden">
                      {product.node.images?.edges?.[0]?.node && (
                        <img
                          src={product.node.images.edges[0].node.url}
                          alt={product.node.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.node.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.node.priceRange.minVariantPrice.currencyCode}{" "}
                        {parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
                      </p>
                    </div>
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
