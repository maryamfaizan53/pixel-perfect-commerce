import { ShoppingCart, Heart, AlertTriangle, Eye, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { HighlightText } from "@/components/ui/highlight-text";
import { useState } from "react";
import { motion } from "framer-motion";

const LOW_STOCK_THRESHOLD = 5;

interface ProductCardProps {
  product: ShopifyProduct;
  badge?: "sale" | "new" | "bestseller";
  searchQuery?: string;
  index?: number;
}

export const ProductCard = ({ product, badge, searchQuery = "", index = 0 }: ProductCardProps) => {
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
  const isLowStock = false; // Inventory check requires special API access

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative premium-card overflow-hidden bg-card ${isOutOfStock ? 'opacity-80' : ''}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
        <Link to={`/product/${node.handle}`} className="block h-full">
          {!imageLoaded && (
            <div className="absolute inset-0 animate-pulse bg-slate-200/50" />
          )}
          <motion.img
            src={image}
            alt={node.title}
            onLoad={() => setImageLoaded(true)}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-60' : ''} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500" />
        </Link>

        {/* Status Badges */}
        <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
          {isOutOfStock ? (
            <Badge variant="destructive" className="rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-xl border-none">
              Out of Stock
            </Badge>
          ) : (
            <>
              {badge && (
                <Badge
                  className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-none shadow-xl ${badge === "sale"
                    ? "bg-rose-500 text-white"
                    : badge === "new"
                      ? "bg-primary text-white"
                      : "bg-amber-500 text-white"
                    }`}
                >
                  <Sparkles className="w-3 h-3 mr-2 inline" />
                  {badge}
                </Badge>
              )}
              {isLowStock && (
                <Badge className="bg-orange-500 text-white border-none rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" />
                  Rare Find
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-5 right-5 flex flex-col gap-3 transform translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 z-10">
          <Button
            size="icon"
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className={`w-12 h-12 rounded-2xl glass border-white/20 shadow-2xl transition-all hover:scale-110 ${inWishlist ? "text-rose-500 fill-rose-500" : "text-white hover:text-rose-500"
              }`}
          >
            <Heart className="w-5 h-5" />
          </Button>
          <Link to={`/product/${node.handle}`}>
            <Button
              size="icon"
              className="w-12 h-12 rounded-2xl glass border-white/20 shadow-2xl text-white hover:text-primary transition-all hover:scale-110"
            >
              <Eye className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Quick Add (Hover Only) */}
        {!isOutOfStock && (
          <div className="absolute bottom-6 left-6 right-6 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10 hidden sm:block">
            <Button
              onClick={handleAddToCart}
              className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-primary hover:text-white font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        )}
      </div>

      <div className="p-8">
        <Link to={`/product/${node.handle}`} className="block group/title mb-3">
          <h3 className="font-bold text-foreground line-clamp-1 text-xl group-hover/title:text-primary transition-colors flex items-center justify-between">
            <HighlightText text={node.title} highlight={searchQuery} />
            <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all text-primary" />
          </h3>
        </Link>

        {node.description && (
          <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed font-medium">
            <HighlightText text={node.description} highlight={searchQuery} />
          </p>
        )}

        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">PKR</span>
            <span className="text-3xl font-black text-foreground leading-none tracking-tighter">
              {(price * 280).toLocaleString('en-PK')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-4 py-2 rounded-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Ready to ship
          </div>
        </div>
      </div>
    </motion.div>
  );
};
