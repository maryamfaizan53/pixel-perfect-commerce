import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";

const products = [
  {
    id: "1",
    name: "Premium Stainless Steel Cookware Set",
    price: 129.99,
    originalPrice: 199.99,
    rating: 4.5,
    reviewCount: 342,
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=400&fit=crop",
    badge: "sale" as const,
    category: "Kitchen",
  },
  {
    id: "7",
    name: "Professional Chef Knife Set",
    price: 149.99,
    rating: 4.8,
    reviewCount: 423,
    image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400&h=400&fit=crop",
    badge: "bestseller" as const,
    category: "Kitchen",
  },
  {
    id: "9",
    name: "Non-Stick Frying Pan Set",
    price: 79.99,
    originalPrice: 99.99,
    rating: 4.6,
    reviewCount: 234,
    image: "https://images.unsplash.com/photo-1585515320310-259814833379?w=400&h=400&fit=crop",
    badge: "sale" as const,
    category: "Kitchen",
  },
  {
    id: "10",
    name: "Glass Food Storage Containers",
    price: 39.99,
    rating: 4.4,
    reviewCount: 567,
    image: "https://images.unsplash.com/photo-1584990347449-c8f12e82fa77?w=400&h=400&fit=crop",
    category: "Kitchen",
  },
  {
    id: "11",
    name: "Electric Kettle",
    price: 49.99,
    rating: 4.7,
    reviewCount: 312,
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop",
    badge: "new" as const,
    category: "Kitchen",
  },
  {
    id: "12",
    name: "Silicone Baking Mat Set",
    price: 24.99,
    rating: 4.5,
    reviewCount: 189,
    image: "https://images.unsplash.com/photo-1628959451239-5c8eef5d46ee?w=400&h=400&fit=crop",
    category: "Kitchen",
  },
];

const brands = ["All Brands", "KitchenPro", "CookMaster", "ChefChoice", "HomeEssentials"];

const CategoryPage = () => {
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [showFilters, setShowFilters] = useState(false);

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Kitchen Essentials</h1>
              <p className="text-muted-foreground">Showing {products.length} products</p>
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

              <Select defaultValue="featured">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Customer Rating</SelectItem>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                </SelectContent>
              </Select>
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

              {/* Brands */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Brand</h3>
                <div className="space-y-3">
                  {brands.map((brand) => (
                    <div key={brand} className="flex items-center gap-2">
                      <Checkbox id={brand} />
                      <Label htmlFor={brand} className="cursor-pointer">
                        {brand}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Customer Rating</h3>
                <div className="space-y-3">
                  {[4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2">
                      <Checkbox id={`rating-${rating}`} />
                      <Label htmlFor={`rating-${rating}`} className="cursor-pointer">
                        {rating}+ Stars
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
                    <Checkbox id="in-stock" />
                    <Label htmlFor="in-stock" className="cursor-pointer">
                      In Stock
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="on-sale" />
                    <Label htmlFor="on-sale" className="cursor-pointer">
                      On Sale
                    </Label>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>

              {/* Load More */}
              <div className="mt-12 text-center">
                <Button size="lg" variant="outline">
                  Load More Products
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
