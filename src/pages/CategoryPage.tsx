import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";

const brands = ["All Brands", "KitchenPro", "CookMaster", "ChefChoice", "HomeEssentials"];

const colors = [
  { name: "Black", value: "black", hex: "0 0% 0%" },
  { name: "White", value: "white", hex: "0 0% 100%" },
  { name: "Gray", value: "gray", hex: "0 0% 50%" },
  { name: "Blue", value: "blue", hex: "217 91% 60%" },
  { name: "Red", value: "red", hex: "0 84% 60%" },
  { name: "Green", value: "green", hex: "142 76% 36%" },
  { name: "Pink", value: "pink", hex: "330 81% 60%" },
  { name: "Purple", value: "purple", hex: "271 91% 65%" },
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

const CategoryPage = () => {
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(20);
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

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
        // Sort by ID (newer products typically have higher IDs)
        return b.node.id.localeCompare(a.node.id);
      case "title-asc":
        return a.node.title.localeCompare(b.node.title);
      case "title-desc":
        return b.node.title.localeCompare(a.node.title);
      case "featured":
      default:
        return 0; // Keep original order
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container-custom">
          {/* Breadcrumb */}
          <nav className="text-sm mb-6 text-muted-foreground">
            <a href="/" className="hover:text-primary">Home</a>
            {" / "}
            <span className="text-foreground">Kitchen</span>
          </nav>

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Kitchen Essentials</h1>
                <p className="text-muted-foreground">Showing {sortedProducts.length} of {products.length} products</p>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                    <SelectItem value="title-asc">Name: A to Z</SelectItem>
                    <SelectItem value="title-desc">Name: Z to A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-12 text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className={`lg:block ${showFilters ? 'block' : 'hidden'} space-y-6`}>
              {/* Price Range */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Price Range</h3>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={200}
                  step={10}
                  className="mb-4"
                />
                <div className="flex items-center justify-between text-sm">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>

              {/* Colors */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => toggleColor(color.value)}
                      className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                        selectedColors.includes(color.value) 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-border'
                      }`}
                      style={{ backgroundColor: `hsl(${color.hex})` }}
                      title={color.name}
                      aria-label={`Select ${color.name}`}
                    />
                  ))}
                </div>
                {selectedColors.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedColors.map(color => {
                      const colorData = colors.find(c => c.value === color);
                      return (
                        <span key={color} className="text-xs bg-muted px-2 py-1 rounded">
                          {colorData?.name}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sizes */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Size</h3>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`py-2 px-3 text-sm font-medium rounded border-2 transition-all hover:border-primary ${
                        selectedSizes.includes(size)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Brand</h3>
                <div className="space-y-3">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center gap-2">
                      <Checkbox 
                        id={brand} 
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => toggleBrand(brand)}
                      />
                      <Label htmlFor={brand} className="cursor-pointer">
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Availability</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="in-stock" 
                      checked={inStockOnly}
                      onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
                    />
                    <Label htmlFor="in-stock" className="cursor-pointer">
                      In Stock
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="on-sale" 
                      checked={onSaleOnly}
                      onCheckedChange={(checked) => setOnSaleOnly(checked as boolean)}
                    />
                    <Label htmlFor="on-sale" className="cursor-pointer">
                      On Sale
                    </Label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold mb-4">No Products Found</h2>
                  <p className="text-muted-foreground">
                    {products.length === 0 
                      ? "Start by creating your first product through the chat!"
                      : "Try adjusting your filters to see more products."
                    }
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedProducts.map((product) => (
                      <ProductCard 
                        key={product.node.id} 
                        product={product} 
                        searchQuery={searchQuery}
                      />
                    ))}
                  </div>

                  {/* Load More */}
                  <div className="mt-12 text-center">
                    <Button size="lg" variant="outline">
                      Load More Products
                    </Button>
                  </div>
                </>
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
