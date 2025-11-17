import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Star, Heart, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProductDetail = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = {
    name: "Premium Stainless Steel Cookware Set",
    price: 129.99,
    originalPrice: 199.99,
    rating: 4.5,
    reviewCount: 342,
    inStock: true,
    images: [
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1585515320310-259814833379?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1584990347449-c8f12e82fa77?w=800&h=800&fit=crop",
    ],
    description: "Transform your cooking experience with our premium stainless steel cookware set. Featuring professional-grade construction, even heat distribution, and elegant design that will elevate any kitchen.",
    features: [
      "Professional-grade 18/10 stainless steel construction",
      "Triple-layer aluminum core for even heat distribution",
      "Oven safe up to 500°F",
      "Compatible with all cooktops including induction",
      "Dishwasher safe for easy cleaning",
      "Limited lifetime warranty",
    ],
    specifications: {
      "Material": "Stainless Steel",
      "Set Includes": "10 pieces",
      "Oven Safe": "Up to 500°F",
      "Dishwasher Safe": "Yes",
      "Warranty": "Lifetime",
    },
  };

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container-custom">
          {/* Breadcrumb */}
          <nav className="text-sm mb-6 text-muted-foreground">
            <a href="/" className="hover:text-primary">Home</a>
            {" / "}
            <a href="/category/kitchen" className="hover:text-primary">Kitchen</a>
            {" / "}
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-primary" : "border-border"
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <Badge className="badge-sale mb-4">Save {discount}%</Badge>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-warning text-warning"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-foreground">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xl text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
                <Badge variant="destructive">-{discount}%</Badge>
              </div>

              <p className="text-muted-foreground mb-6">{product.description}</p>

              {/* Quantity and Add to Cart */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <Button size="lg" className="flex-1 bg-secondary hover:bg-secondary-hover">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>

                <Button size="lg" variant="outline">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <Truck className="w-6 h-6 text-primary mb-2" />
                  <p className="text-sm font-medium text-center">Free Shipping</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <RotateCcw className="w-6 h-6 text-primary mb-2" />
                  <p className="text-sm font-medium text-center">30-Day Returns</p>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <Shield className="w-6 h-6 text-primary mb-2" />
                  <p className="text-sm font-medium text-center">Authentic Guarantee</p>
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 text-accent font-medium">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                In Stock - Ships within 24 hours
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details" className="mb-12">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Product Details
              </TabsTrigger>
              <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Specifications
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Reviews ({product.reviewCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="specs" className="mt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-4 bg-muted rounded-lg">
                    <span className="font-medium">{key}:</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <p className="text-muted-foreground">Customer reviews will be displayed here.</p>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
