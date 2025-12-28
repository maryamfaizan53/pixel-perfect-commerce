import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, Loader2, Search, X, Grid, List, Sparkles, Filter, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchProducts, fetchProductsByCollection, ShopifyProduct, CollectionData } from "@/lib/shopify";
import { motion, AnimatePresence } from "framer-motion";

const brands = ["All Brands", "KitchenPro", "CookMaster", "ChefChoice", "HomeEssentials"];

const colors = [
  { name: "Obsidian", value: "black", hex: "240 10% 4%" },
  { name: "Cloud", value: "white", hex: "0 0% 100%" },
  { name: "Sonic Silver", value: "gray", hex: "240 5% 65%" },
  { name: "Electric Blue", value: "blue", hex: "217 91% 60%" },
  { name: "Crimson", value: "red", hex: "0 84% 60%" },
  { name: "Emerald", value: "green", hex: "142 76% 36%" },
  { name: "Rose Quartz", value: "pink", hex: "330 81% 60%" },
  { name: "Mystic Violet", value: "purple", hex: "271 91% 65%" },
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

const CategoryPage = () => {
  const { category = "all" } = useParams();

  const [priceRange, setPriceRange] = useState([0, 0]);
  const [maxPrice, setMaxPrice] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setCollectionData(null);
      try {
        let list: ShopifyProduct[] = [];

        if (category && category !== "all") {
          const collection = await fetchProductsByCollection(category, 50);
          if (collection) {
            setCollectionData(collection);
            list = collection.products;
          }
        } else {
          list = await fetchProducts(50);
        }

        setProducts(list);

        const prices = list
          .map((p) => Number.parseFloat(p.node.priceRange.minVariantPrice.amount))
          .filter((n) => Number.isFinite(n));
        const computedMax = prices.length ? Math.max(...prices) : 0;
        const roundedMax = computedMax ? Math.ceil(computedMax / 100) * 100 : 0;

        setMaxPrice(roundedMax);
        setPriceRange([0, roundedMax]);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category]);

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const filteredProducts = products.filter(product => {
    const price = parseFloat(product.node.priceRange.minVariantPrice.amount);
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    const matchesStock = !inStockOnly || product.node.variants.edges.some(v => v.node.availableForSale);

    // Search filter
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = !searchLower ||
      product.node.title.toLowerCase().includes(searchLower) ||
      product.node.description.toLowerCase().includes(searchLower);

    return matchesPrice && matchesStock && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = parseFloat(a.node.priceRange.minVariantPrice.amount);
    const priceB = parseFloat(b.node.priceRange.minVariantPrice.amount);

    switch (sortBy) {
      case "price-asc":
        return priceA - priceB;
      case "price-desc":
        return priceB - priceA;
      case "newest":
        return b.node.id.localeCompare(a.node.id);
      case "title-asc":
        return a.node.title.localeCompare(b.node.title);
      case "title-desc":
        return b.node.title.localeCompare(a.node.title);
      case "featured":
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        {/* Dynamic Category Header */}
        <section className="relative pt-24 pb-32 overflow-hidden bg-slate-900 border-b border-white/5">
          {/* Collection Background Image */}
          {collectionData?.image?.url && (
            <div className="absolute inset-0 z-0">
              <img
                src={collectionData.image.url}
                alt={collectionData.image.altText || collectionData.title}
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/70" />
            </div>
          )}

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10">
                <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                {collectionData ? 'Collection' : 'All Products'}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-8">
                {collectionData?.title || (
                  <>All Products</>
                )}
              </h1>
              {collectionData?.description && (
                <p className="text-lg text-white/60 font-medium max-w-2xl mb-8 leading-relaxed">
                  {collectionData.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Products</span>
                  <span className="text-3xl font-black text-white">{sortedProducts.length} <span className="text-sm font-medium text-white/30">items</span></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Curation</span>
                  <span className="text-3xl font-black text-white">Top Tier</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Animated Background Decor */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"
          />
        </section>

        <div className="container-custom -mt-16 relative z-20 pb-24">
          {/* Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-dark border-white/5 bg-white shadow-2xl rounded-[2.5rem] p-6 mb-12 flex flex-col lg:flex-row items-center justify-between gap-8"
          >
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-12 h-16 rounded-2xl border-none bg-slate-100/50 focus:bg-slate-100 font-bold text-lg placeholder:text-muted-foreground/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={`h-12 w-12 rounded-xl transition-all ${viewMode === 'grid' ? 'shadow-lg' : 'text-muted-foreground'}`}
                >
                  <Grid className="w-5 h-5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={`h-12 w-12 rounded-xl transition-all ${viewMode === 'list' ? 'shadow-lg' : 'text-muted-foreground'}`}
                >
                  <List className="w-5 h-5" />
                </Button>
              </div>

              <div className="h-10 w-px bg-slate-200 hidden lg:block mx-2" />

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-[220px] h-16 rounded-2xl border-none bg-slate-100/50 hover:bg-slate-100 font-bold uppercase text-[10px] tracking-widest pl-6">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white">
                  <SelectItem value="featured" className="rounded-xl font-bold py-3">Featured</SelectItem>
                  <SelectItem value="price-asc" className="rounded-xl font-bold py-3">Price Low → High</SelectItem>
                  <SelectItem value="price-desc" className="rounded-xl font-bold py-3">Price High → Low</SelectItem>
                  <SelectItem value="newest" className="rounded-xl font-bold py-3">Latest Arrivals</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="lg:hidden h-16 w-full rounded-2xl border-none bg-slate-100 hover:bg-slate-200 font-black uppercase text-[10px] tracking-widest"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-3 text-primary" />
                Filters
              </Button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-12">
            {/* Elite Sidebar Filters */}
            <aside className={`lg:block ${showFilters ? 'block' : 'hidden'} space-y-8 sticky top-32 h-fit`}>
              {/* Range Selector */}
              <div className="premium-card p-8 bg-white shadow-xl">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Price Ceiling</h3>
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={maxPrice || 0}
                  step={10}
                  className="mb-6"
                />
                <div className="flex items-center justify-between">
                  <div className="px-5 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-900">
                    PKR {priceRange[0].toLocaleString('en-PK')}
                  </div>
                  <div className="px-5 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-black text-slate-900">
                    PKR {priceRange[1].toLocaleString('en-PK')}
                  </div>
                </div>
              </div>

              {/* Chroma Filter */}
              <div className="premium-card p-8 bg-white shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-8 ml-1">Chroma Select</h3>
                <div className="grid grid-cols-4 gap-4">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => toggleColor(color.value)}
                      className="group relative flex flex-col items-center gap-2"
                    >
                      <div
                        className={`w-10 h-10 rounded-[12px] border-2 transition-all duration-500 group-hover:scale-110 flex items-center justify-center ${selectedColors.includes(color.value)
                          ? 'border-primary ring-[6px] ring-primary/10'
                          : 'border-slate-100'
                          }`}
                        style={{ backgroundColor: `hsl(${color.hex})` }}
                      >
                        {selectedColors.includes(color.value) && (
                          <div className={`w-2 h-2 rounded-full ${color.value === 'white' ? 'bg-black' : 'bg-white'}`} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensional Filter */}
              <div className="premium-card p-8 bg-white shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-8 ml-1">Dimensions</h3>
                <div className="grid grid-cols-3 gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`h-11 text-[10px] font-black rounded-xl border-2 transition-all duration-300 hover:border-primary ${selectedSizes.includes(size)
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                        : 'bg-white border-slate-100 text-slate-500'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Authority */}
              <div className="premium-card p-8 bg-white shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-8 ml-1">Design House</h3>
                <div className="space-y-4">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center group cursor-pointer" onClick={() => toggleBrand(brand)}>
                      <div className={`w-5 h-5 rounded-md border-2 transition-all mr-3 flex items-center justify-center ${selectedBrands.includes(brand) ? 'bg-primary border-primary' : 'border-slate-200 group-hover:border-primary'
                        }`}>
                        {selectedBrands.includes(brand) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm font-bold transition-colors ${selectedBrands.includes(brand) ? 'text-primary' : 'text-slate-600 group-hover:text-primary'}`}>
                        {brand}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Elite Products Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-10">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-6">
                      <div className="aspect-[4/5] rounded-[2.5rem] bg-slate-200 animate-pulse" />
                      <div className="h-6 w-2/3 bg-slate-200 rounded-full animate-pulse" />
                      <div className="h-4 w-1/3 bg-slate-200 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : sortedProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-32 text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 text-slate-300" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Zero Matches found</h2>
                  <p className="text-slate-500 font-medium max-w-sm">
                    Our digital catalog yielded no results. Please re-adjust your parameters or search query.
                  </p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery("");
                      setPriceRange([0, 500]);
                      setSelectedColors([]);
                      setSelectedSizes([]);
                    }}
                    className="mt-6 text-primary font-black uppercase text-xs tracking-widest"
                  >
                    Reset Grid
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  layout
                  className={`grid ${viewMode === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-10`}
                >
                  <AnimatePresence>
                    {sortedProducts.map((product, index) => (
                      <motion.div
                        key={product.node.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      >
                        <ProductCard
                          product={product}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {sortedProducts.length > 0 && (
                <div className="mt-24 text-center">
                  <Button size="lg" className="h-16 px-12 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold uppercase text-xs tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-xl">
                    Load More
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
