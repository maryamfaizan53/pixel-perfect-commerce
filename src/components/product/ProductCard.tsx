import { ShoppingCart, Heart, AlertTriangle, Eye, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { HighlightText } from "@/components/ui/highlight-text";
import { useState } from "react";

const LOW_STOCK_THRESHOLD = 5;

interface ProductCardProps {
  product: ShopifyProduct;
  badge?: "sale" | "new" | "bestseller";
  searchQuery?: string;
}

export const ProductCard = ({ product, badge, searchQuery = "" }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const { node } = product;

  const price = parseFloat(node.priceRange.minVariantPrice.amount);
  const currencyCode = node.priceRange.minVariantPrice.currencyCode;
  const image = node.images.edges[0]?.node.url || "/placeholder.svg";
  const defaultVariant = node.variants.edges[0]?.node;
  const inWishlist = isInWishlist(node.id);

  const isOutOfStock = !node.availableForSale;
  const isLowStock = node.availableForSale && node.totalInventory > 0 && node.totalInventory <= LOW_STOCK_THRESHOLD;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }

    if (!defaultVariant) {
      toast.error("Product variant not available");
      return;
    }

    const cartItem = {
      product,
      variantId: defaultVariant.id,
      variantTitle: defaultVariant.title,
      price: defaultVariant.price,
      quantity: 1,
      selectedOptions: defaultVariant.selectedOptions || []
    };

    addItem(cartItem);
    toast.success("Added to cart", {
      description: node.title,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(node.id, node.handle);
  };

  return (
    <div className={`group relative bg-white border border-slate-100 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 ${isOutOfStock ? 'opacity-80' : ''}`}>
      {/* Image Container with Optimized Display */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
        <Link to={`/product/${node.handle}`} className="block h-full">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-slate-200/50" />
          )}
          <img
            src={image}
            alt={node.title}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ease-out sm:group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-60' : ''} ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            loading="lazy"
          />

          {/* Subtle Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500" />
        </Link>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isOutOfStock ? (
            <Badge variant="destructive" className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-destructive/20 border-none">
              Out of Stock
            </Badge>
          ) : (
            <>
              {badge && (
                <Badge
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none shadow-lg ${badge === "sale"
                      ? "bg-rose-500 text-white shadow-rose-500/20"
                      : badge === "new"
                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                        : "bg-indigo-500 text-white shadow-indigo-500/20"
                    }`}
                >
                  {badge}
                </Badge>
              )}
              {isLowStock && (
                <Badge className="bg-amber-500 text-white border-none rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  Limited
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Quick Actions (Hover Only on Desktop) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 transform translate-x-4 opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 transition-all duration-300">
          <Button
            size="icon"
            variant="outline"
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className={`w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border-none shadow-xl transition-all hover:scale-110 ${inWishlist ? "text-rose-500 fill-rose-500" : "text-slate-600 hover:text-rose-500"
              }`}
          >
            <Heart className="w-4.5 h-4.5" />
          </Button>
          <Link to={`/product/${node.handle}`}>
            <Button
              size="icon"
              variant="outline"
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border-none shadow-xl text-slate-600 hover:text-primary transition-all hover:scale-110"
            >
              <Eye className="w-4.5 h-4.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Quick Add (Visible on mobile, bottom of image) */}
        {!isOutOfStock && (
          <div className="absolute bottom-4 left-4 right-4 sm:hidden">
            <Button
              onClick={handleAddToCart}
              className="w-full h-10 rounded-full bg-primary text-white text-xs font-bold shadow-lg active:scale-95 transition-transform"
            >
              Add to Cart
            </Button>
          </div>
        )}

        {/* Desktop Quick Add (Hover) */}
        {!isOutOfStock && (
          <div className="absolute bottom-6 left-6 right-6 translate-y-8 opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-500 hidden sm:block">
            <Button
              onClick={handleAddToCart}
              className="w-full h-12 rounded-2xl bg-white text-slate-900 hover:bg-primary hover:text-white font-bold shadow-2xl transition-all active:scale-[0.98]"
            >
              <ShoppingCart className="w-4.5 h-4.5 mr-2" />
              Quick Add
            </Button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <Link to={`/product/${node.handle}`} className="block group/title">
          <h3 className="font-bold text-slate-900 mb-2 line-clamp-1 text-lg group-hover/title:text-primary transition-colors flex items-center justify-between">
            <HighlightText text={node.title} highlight={searchQuery} />
            <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all text-primary" />
          </h3>
        </Link>

        {node.description && (
          <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
            <HighlightText text={node.description} highlight={searchQuery} />
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{currencyCode}</span>
            <span className="text-2xl font-black text-slate-900 leading-none">
              {price.toFixed(2)}
            </span>
          </div>
          <div className="h-8 w-[1px] bg-slate-100 mx-4 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ready to ship
          </div>
        </div>
      </div>
    </div>
  );
};
