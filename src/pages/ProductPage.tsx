import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Minus, Plus, Truck, Shield, RotateCcw, Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { storefrontApiRequest, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

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
    }
  }
`;

const ProductPage = () => {
  const { handle } = useParams();
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const addItem = useCartStore(state => state.addItem);

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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container-custom">
          <nav className="text-sm mb-6 text-muted-foreground">
            <a href="/" className="hover:text-primary">Home</a>
            {" / "}
            <span className="text-foreground">{product.title}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div>
              <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
                <img
                  src={product.images.edges[selectedImage]?.node.url || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {product.images.edges.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-primary" : "border-border"
                    }`}
                  >
                    <img src={image.node.url} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold">{product.title}</h1>
                {isOutOfStock && (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
                {isLowStock && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Only {product.totalInventory} left
                  </Badge>
                )}
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-foreground">
                  {currencyCode} {price.toFixed(2)}
                </span>
              </div>

              <p className="text-muted-foreground mb-6">{product.description}</p>

              {product.options.length > 0 && product.options[0].name !== 'Title' && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Options</h3>
                  {product.options.map((option) => (
                    <div key={option.name} className="mb-4">
                      <label className="text-sm font-medium mb-2 block">{option.name}</label>
                      <div className="flex gap-2">
                        {option.values.map((value) => (
                          <Button key={value} variant="outline" size="sm">
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

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

                <Button 
                  size="lg" 
                  className="flex-1 bg-secondary hover:bg-secondary-hover"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant?.availableForSale}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {selectedVariant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}
                </Button>

                <Button size="lg" variant="outline">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

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

              <div className={`flex items-center gap-2 font-medium ${isOutOfStock ? 'text-destructive' : isLowStock ? 'text-amber-500' : 'text-accent'}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${isOutOfStock ? 'bg-destructive' : isLowStock ? 'bg-amber-500' : 'bg-accent'}`} />
                {isOutOfStock 
                  ? 'Currently Unavailable' 
                  : isLowStock 
                    ? `Low Stock - Only ${product.totalInventory} left!` 
                    : 'In Stock - Ships within 24 hours'}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductPage;
