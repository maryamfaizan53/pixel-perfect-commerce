import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, X, Grid, List, Filter, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { ShopifyProduct, CollectionData } from "@/lib/shopify";
import { getProducts, searchProducts, getCategory } from "@/lib/api";
import { toShopifyShape, fromShopifyShape } from "@/lib/compat";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { CategoryCards } from "@/components/common/CategoryCards";
import { getCategories } from "@/lib/api";
import { useSEO } from "@/hooks/useSEO";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { EASE, reduceMotion } from "@/lib/motion";

const CategoryPage = () => {
  const { category = "all" } = useParams();

  const { data: allCategories = [] } = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [maxPrice, setMaxPrice] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [collectionData, setCollectionData] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      // Trigger reload when search changes (handled in loadProducts via dependency or separate effect)
      // Actually, better to separate the load logic or include searchQuery in dependency of loadProducts 
      // But since loadProducts is big, let's just make it depend on searchQuery
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setCollectionData(null);
      try {
        let list: ShopifyProduct[] = [];

        if (searchQuery.trim()) {
          const cards = await searchProducts(searchQuery.trim(), 50);
          list = cards.map(toShopifyShape);
        } else if (category && category !== "all") {
          const data = await getCategory(category, 60);
          setCollectionData({
            title: data.category.title,
            description: data.category.description,
            handle: data.category.slug,
            image: data.category.image ? { url: data.category.image.url, altText: data.category.image.alt } : undefined,
            products: [],
          });
          list = data.products.map(toShopifyShape);
        } else {
          list = (await getProducts(0, 60)).items.map(toShopifyShape);
        }

        setProducts(list);

        // Meta Pixel: Track ViewContent for category pages
        if (category && category !== "all" && list.length > 0) {
          trackMetaEvent('ViewContent', {
            content_type: 'product_group',
            content_category: category,
            num_items: list.length,
          });
        }

        const prices = list
          .map((p) => Number.parseFloat(p.node.priceRange.minVariantPrice.amount))
          .filter((n) => Number.isFinite(n));
        const computedMax = prices.length ? Math.max(...prices) : 0;
        const roundedMax = computedMax ? Math.ceil(computedMax / 100) * 100 : 0;

        setMaxPrice(roundedMax);
        // Only reset price range if it's 0-0 or we loaded a new category/search context
        if (priceRange[1] === 0) {
          setPriceRange([0, roundedMax]);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(loadProducts, 300); // Debounce the effect execution
    return () => clearTimeout(timeoutId);
  }, [category, searchQuery]); // Re-run when category or search changes

  const filteredProducts = products.filter(product => {
    const price = parseFloat(product.node.priceRange.minVariantPrice.amount);
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    const matchesStock = !inStockOnly || product.node.variants.edges.some(v => v.node.availableForSale);

    // Note: Search filtering is now done Server-Side in loadProducts

    return matchesPrice && matchesStock;
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
        return b.node.id.localeCompare(a.node.id); // Approximation for newest if IDs are sequential/time-based, or use createdAt if available
      case "title-asc":
        return a.node.title.localeCompare(b.node.title);
      case "title-desc":
        return b.node.title.localeCompare(a.node.title);
      case "featured":
      default:
        // If searching, Score is best, but here we just keep default order returned by API (relevance)
        return 0;
    }
  });

  const localizedTitle = useMemo(() => {
    if (collectionData) {
      const base = collectionData.title;
      return `${base} Sale Pakistan`.split(/\s+/).slice(0, 5).join(' ');
    }
    return "Online Store Pakistan";
  }, [collectionData]);

  useSEO({
    title: localizedTitle,
    description: collectionData?.description
      ? `${collectionData.description} Shop this collection at AI Bazar, the leading online store in Pakistan for lowest prices and original quality. Featuring ${collectionData.title} with COD & Free Shipping.`
      : "Shop the best selection of affordable products at AI Bazar, Pakistan's top online store. Enjoy lowest prices, original quality, and fast shipping nationwide.",
    keywords: collectionData
      ? `${collectionData.title.toLowerCase()}, online store pakistan, best online shopping pakistan, buy ${collectionData.title.toLowerCase()} online, ${collectionData.title.toLowerCase()} price in pakistan`
      : "online store pakistan, affordable products pakistan, lowest price shopping pakistan",
    schema: collectionData ? [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `Is the ${collectionData.title} collection available for COD in Pakistan?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Yes, all items in the ${collectionData.title} collection at AI Bazar are available for Cash on Delivery (COD) across Pakistan, with free express shipping.`
            }
          },
          {
            "@type": "Question",
            "name": `How long does delivery take for ${collectionData.title} items?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We dispatch orders within 24 hours. Delivery typically takes 1-3 business days nationwide."
            }
          }
        ]
      }
    ] : []
  });

  // Pro-Level AI Schema: CollectionPage, ItemList & Breadcrumb
  useEffect(() => {
    if (products.length > 0) {
      const schemaId = 'category-seo-json-ld';
      let script = document.getElementById(schemaId) as HTMLScriptElement;

      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = schemaId;
        document.head.appendChild(script);
      }

      const siteUrl = 'https://www.aibazar.pk';
      const canonicalUrl = `${siteUrl}/collections/${category}`;

      const collectionSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": collectionData?.title || "All Products",
        "description": collectionData?.description || "Browse our full catalog of high-quality products at the lowest prices in Pakistan.",
        "url": canonicalUrl,
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": sortedProducts.length,
          "itemListElement": sortedProducts.slice(0, 30).map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `${siteUrl}/products/${product.node.handle}`,
            "name": product.node.title,
            "image": product.node.media?.edges?.[0]?.node?.image?.url || product.node.media?.edges?.[0]?.node?.previewImage?.url
          }))
        }
      };

      const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": siteUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Collections",
            "item": `${siteUrl}/category`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": collectionData?.title || category,
            "item": canonicalUrl
          }
        ]
      };

      script.text = JSON.stringify([collectionSchema, breadcrumbSchema]);

      return () => {
        const existingScript = document.getElementById(schemaId);
        if (existingScript) existingScript.remove();
      };
    }
  }, [products, collectionData, sortedProducts, category]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1">
        {/* Dynamic Category Header */}
        <section className="relative pt-28 sm:pt-32 pb-24 overflow-hidden bg-secondary border-b border-white/5">
          {/* Collection Background Image */}
          {collectionData?.image?.url && (
            <div className="absolute inset-0 z-0">
              <img
                src={collectionData.image.url}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900/70" />
            </div>
          )}

          <div className="container-custom relative z-10">
            <motion.div
              initial={reduceMotion() ? undefined : { opacity: 0, y: 24 }}
              animate={reduceMotion() ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="max-w-4xl"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/10 text-white text-[11px] font-bold uppercase tracking-[0.16em] mb-8">
                <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                {collectionData ? 'Collection' : 'All Products'}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-4 sm:mb-6">
                {collectionData?.title || 'All Products'}
              </h1>
              {collectionData?.description && (
                <p className="text-base text-white/60 leading-relaxed max-w-2xl mb-8">
                  {collectionData.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-8 sm:gap-10">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.14em] mb-1">Products</span>
                  <span className="text-2xl sm:text-3xl font-bold text-white">{sortedProducts.length} <span className="text-sm font-medium text-white/40">items</span></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-[0.14em] mb-1">Delivery</span>
                  <span className="text-2xl sm:text-3xl font-bold text-white">1–3 days</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories navigation */}
        <div className="bg-background border-b border-border py-10">
          <div className="container-custom">
            <CategoryCards categories={allCategories.filter((c) => c.slug !== "more")} limit={8} />
          </div>
        </div>

        <div className="container-custom pt-10 pb-20">
          {/* Action Bar */}
          <motion.div
            initial={reduceMotion() ? undefined : { opacity: 0, y: 16 }}
            animate={reduceMotion() ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
            className="bg-card border border-border shadow-card rounded-2xl p-3 sm:p-5 mb-8 sm:mb-10 flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6"
          >
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-10 h-11 sm:h-12 rounded-full border border-border bg-muted/50 focus:bg-background font-medium text-sm placeholder:text-muted-foreground/60 transition-colors"
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

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full lg:w-auto">
              <div className="flex bg-muted p-1 rounded-full flex-1 sm:flex-initial justify-center sm:justify-start">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={`h-9 w-9 rounded-full transition-colors ${viewMode === 'grid' ? '' : 'text-muted-foreground'}`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={`h-9 w-9 rounded-full transition-colors ${viewMode === 'list' ? '' : 'text-muted-foreground'}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-8 w-px bg-border hidden lg:block mx-1" />

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-[200px] h-11 sm:h-12 rounded-full border border-border bg-muted/50 hover:bg-muted font-semibold text-xs tracking-wide pl-5">
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
                className="lg:hidden h-11 sm:h-12 w-full rounded-full border border-border bg-muted hover:bg-muted/80 font-semibold text-xs tracking-wide"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-3 text-primary" />
                Filters
              </Button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8 lg:gap-10">
            {/* Sidebar filters */}
            <aside className={`lg:block ${showFilters ? 'block' : 'hidden'} space-y-4 lg:sticky lg:top-28 h-fit`}>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <h3 className="text-sm font-semibold text-foreground mb-4">Price</h3>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={maxPrice || 0}
                  step={10}
                  className="mb-4"
                />
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <span className="px-3 py-1.5 rounded-lg bg-muted border border-border">
                    PKR {priceRange[0].toLocaleString('en-PK')}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-muted border border-border">
                    PKR {priceRange[1].toLocaleString('en-PK')}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox checked={inStockOnly} onCheckedChange={(v) => setInStockOnly(v === true)} />
                  <span className="text-sm font-medium text-foreground">In stock only</span>
                </label>
              </div>

              {(priceRange[0] > 0 || priceRange[1] < maxPrice || inStockOnly) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setPriceRange([0, maxPrice]); setInStockOnly(false); }}
                  className="text-primary"
                >
                  Clear filters
                </Button>
              )}
            </aside>

            {/* Products */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <div className="aspect-[4/5] rounded-[14px] bg-muted animate-pulse" />
                      <div className="h-4 w-2/3 bg-muted rounded-full animate-pulse" />
                      <div className="h-4 w-1/3 bg-muted rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">No products found</h2>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Try a different search, or clear the price and stock filters.
                  </p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery("");
                      setPriceRange([0, maxPrice]);
                      setInStockOnly(false);
                    }}
                    className="mt-4 text-primary"
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 max-w-2xl'} gap-4 md:gap-6`}>
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.node.id} product={fromShopifyShape(product)} />
                  ))}
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
