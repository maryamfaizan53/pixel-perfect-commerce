import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Minus, Plus, Truck, Shield, RotateCcw, Loader2, AlertTriangle, ChevronRight, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storefrontApiRequest, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import { StarRating } from "@/components/reviews/StarRating";
import { useReviews } from "@/hooks/useReviews";

const LOW_STOCK_THRESHOLD = 5;

const PRODUCT_QUERY = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      handle
      availableForSale
      totalInventory
      productType
      vendor
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            quantityAvailable
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
      collections(first: 1) {
        edges {
          node {
            title
            handle
          }
        }
      }
    }
  }
`;

const ProductPage = () => {
  const { handle } = useParams();
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const addItem = useCartStore(state => state.addItem);

  const productId = product?.id?.replace("gid://shopify/Product/", "") || "";
  const { stats: reviewStats } = useReviews(productId, handle || "");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await storefrontApiRequest(PRODUCT_QUERY, { handle });
        if (data.data.product) {
          setProduct(data.data.product);
          setSelectedVariant(data.data.product.variants.edges[0]?.node);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (handle) {
      loadProduct();
    }
  }, [handle]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    const cartItem = {
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions || []
    };

    addItem(cartItem);
    toast.success("Added to cart", {
      description: `${quantity}x ${product.title}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or has been removed.</p>
            <Button asChild size="lg">
              <Link to="/">Browse Products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const price = parseFloat(selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount);
  const currencyCode = selectedVariant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode;
  const isOutOfStock = !product.availableForSale;
  const isLowStock = product.availableForSale && product.totalInventory > 0 && product.totalInventory <= LOW_STOCK_THRESHOLD;
  const collection = product.collections.edges[0]?.node;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 py-12">
        <div className="container-custom">
          {/* Enhanced Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8 text-muted-foreground font-medium">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            {collection && (
              <>
                <Link to={`/category/${collection.handle}`} className="hover:text-primary transition-colors">
                  {collection.title}
                </Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            <span className="text-foreground font-semibold truncate">{product.title}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            {/* Image Section with Micro-animations */}
            <div className="space-y-6">
              <div className="aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 group">
                <img
                  src={product.images.edges[selectedImage]?.node.url || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {product.images.edges.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-24 aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === index ? "border-primary ring-2 ring-primary/10" : "border-slate-100 hover:border-slate-300"
                      }`}
                  >
                    <img src={image.node.url} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Details Section */}
            <div className="flex flex-col">
              <div className="mb-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {collection && (
                      <Badge variant="secondary" className="px-3 py-1 text-xs uppercase tracking-wider font-bold bg-primary/5 text-primary border-none">
                        {collection.title}
                      </Badge>
                    )}
                    {product.productType && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-widest font-bold ml-2">
                        <Tag className="w-3 h-3" />
                        {product.productType}
                      </div>
                    )}
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 lg:text-5xl">{product.title}</h1>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <StarRating rating={reviewStats.averageRating} size="sm" />
                    <a href="#reviews" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors border-b border-transparent hover:border-primary">
                      {reviewStats.totalReviews > 0
                        ? `${reviewStats.averageRating.toFixed(1)} (${reviewStats.totalReviews} reviews)`
                        : "Write first review"}
                    </a>
                  </div>
                  {product.vendor && (
                    <div className="text-sm text-slate-500 font-medium">
                      By <span className="text-slate-900 font-bold">{product.vendor}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 py-4 border-y border-slate-100">
                  <span className="text-4xl font-black text-primary">
                    {currencyCode} {price.toFixed(2)}
                  </span>
                  {isOutOfStock ? (
                    <Badge variant="destructive" className="rounded-full px-4">Out of Stock</Badge>
                  ) : isLowStock ? (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none rounded-full px-4 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      Only {product.totalInventory} left in stock
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none rounded-full px-4">
                      In Stock
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-lg text-slate-600 leading-relaxed max-w-prose mb-8">
                {product.description.split('.')[0]}. {product.description.split('.')[1] || ""}
              </p>

              {product.options.length > 0 && product.options[0].name !== 'Title' && (
                <div className="space-y-6 mb-8">
                  {product.options.map((option: any) => (
                    <div key={option.name} className="space-y-3">
                      <label className="text-sm font-bold uppercase tracking-widest text-slate-900">{option.name}</label>
                      <div className="flex flex-wrap gap-3">
                        {option.values.map((value: string) => (
                          <button
                            key={value}
                            className={`px-6 py-2.5 text-sm font-bold rounded-xl border-2 transition-all duration-300 hover:border-primary ${selectedVariant?.selectedOptions?.some((opt: any) => opt.name === option.name && opt.value === value)
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                              : "bg-white border-slate-200 text-slate-600"
                              }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-8">
                <div className="flex items-center justify-between border-2 border-slate-200 rounded-2xl px-2 py-1 bg-slate-50">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-slate-600 hover:bg-white hover:text-primary rounded-xl"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <span className="px-6 text-lg font-black text-slate-900 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-slate-600 hover:bg-white hover:text-primary rounded-xl"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>

                <Button
                  size="lg"
                  className="flex-1 h-16 text-lg font-bold rounded-2xl bg-primary hover:bg-primary-hover shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  <ShoppingCart className="w-6 h-6 mr-3" />
                  {isOutOfStock ? 'Currently Unavailable' : 'Add to Cart'}
                </Button>

                <Button size="icon" variant="outline" className="h-16 w-16 rounded-2xl border-2 text-slate-400 hover:text-destructive hover:border-destructive transition-all">
                  <Heart className="w-6 h-6" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="flex flex-col items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                  <Truck className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">Shipping</p>
                  <p className="text-[10px] text-slate-500 font-medium text-center">Free on $50+</p>
                </div>
                <div className="flex flex-col items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                  <RotateCcw className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">Returns</p>
                  <p className="text-[10px] text-slate-500 font-medium text-center">30-day window</p>
                </div>
                <div className="flex flex-col items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                  <Shield className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1">Guarantee</p>
                  <p className="text-[10px] text-slate-500 font-medium text-center">Authentic only</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs Section */}
          <Tabs defaultValue="description" className="mb-20" id="reviews">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent px-0 py-4 text-sm font-bold uppercase tracking-widest text-slate-500 data-[state=active]:border-primary data-[state=active]:text-slate-900 transition-all"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent px-0 py-4 text-sm font-bold uppercase tracking-widest text-slate-500 data-[state=active]:border-primary data-[state=active]:text-slate-900 transition-all"
              >
                Customer Reviews ({reviewStats.totalReviews})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {product.description || "No description available for this product."}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProductReviews productId={productId} productHandle={handle || ""} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductPage;
