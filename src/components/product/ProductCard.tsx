import { ShoppingBag, Heart, Star, ShoppingCart, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: ShopifyProduct;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const { node } = product;
  const inWishlist = isInWishlist(node.id);
  const isOutOfStock = !node.availableForSale;
  const isNew = node.handle.includes('new');

  const defaultVariant = node.variants.edges[0]?.node;

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

  const handleOrderNow = async (e: React.MouseEvent) => {
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

    try {
      setCheckoutLoading(true);
      const { createStorefrontCheckout } = await import("@/lib/shopify");
      const checkoutUrl = await createStorefrontCheckout([{
        product,
        variantId: defaultVariant.id,
        variantTitle: defaultVariant.title,
        price: defaultVariant.price,
        quantity: 1,
        selectedOptions: defaultVariant.selectedOptions || []
      }]);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Direct checkout failed:", error);
      toast.error("Checkout failed, please try adding to cart");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(node.id, node.handle);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col h-full bg-white rounded-[2.5rem] overflow-hidden border border-slate-50 hover:border-primary/20 transition-all duration-700 shadow-sm hover:shadow-premium"
    >
      {/* Product Image Section */}
      <Link
        to={`/product/${node.handle}`}
        className="relative aspect-[4/5] overflow-hidden bg-slate-50 cursor-pointer block"
      >
        {/* Badges */}
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
          {isOutOfStock && (
            <span className="px-5 py-2 bg-secondary text-primary text-[8px] font-black uppercase tracking-[0.4em] rounded-full shadow-lg border border-primary/20 scale-90 sm:scale-100">
              Reserved
            </span>
          )}
          {isNew && (
            <span className="px-5 py-2 bg-primary text-white text-[8px] font-black uppercase tracking-[0.4em] rounded-full shadow-gold scale-90 sm:scale-100">
              New Arrival
            </span>
          )}
        </div>

        {/* Wishlist Toggle Overlay */}
        <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-90 sm:scale-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className={`w-12 h-12 rounded-full backdrop-blur-md border transition-all duration-500 ${inWishlist
              ? 'bg-primary border-primary text-white'
              : 'bg-white/20 border-white/33 text-white hover:bg-primary hover:border-primary'
              }`}
          >
            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Primary and Secondary Images */}
        <div className="relative w-full h-full">
          <motion.img
            src={node.images.edges[0]?.node?.url || "/placeholder.svg"}
            alt={node.title}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${node.images.edges[1] ? 'group-hover:opacity-0' : ''}`}
          />
          {node.images.edges[1] && (
            <img
              src={node.images.edges[1].node.url}
              alt={node.title}
              className="absolute inset-0 w-full h-full object-cover scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-1000"
            />
          )}
        </div>

        {/* Quick View Trigger Overlay */}
        <div className="absolute inset-0 bg-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
          <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
            <span className="px-8 py-3 bg-white text-secondary text-[10px] font-bold uppercase tracking-widest rounded-full shadow-premium uppercase">
              Inspect Piece
            </span>
          </div>
        </div>
      </Link>

      {/* Product Content Section */}
      <div className="p-8 flex flex-col flex-1 space-y-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <span className="label-premium">
              {node.handle.split('-')[0]} Boutique
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-primary fill-current" />
              <span className="label-premium">4.9</span>
            </div>
          </div>
          <Link to={`/product/${node.handle}`}>
            <h3 className="text-xl md:text-2xl font-bold text-slate-950 leading-tight group-hover:text-primary transition-colors duration-500 line-clamp-1">
              {node.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 h-8">
            {node.description}
          </p>
        </div>

        <div className="pt-6 border-t border-slate-50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Investment</span>
              <span className="text-2xl font-black text-slate-900">
                <span className="text-xs font-bold mr-1">{node.priceRange.minVariantPrice.currencyCode}</span>
                {parseFloat(node.priceRange.minVariantPrice.amount).toLocaleString()}
              </span>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-secondary hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all duration-500 group/btn"
              title="Add to Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
            </Button>
          </div>

          <Button
            onClick={handleOrderNow}
            disabled={isOutOfStock || checkoutLoading}
            className="w-full h-12 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-gold hover:shadow-gold-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-500"
          >
            {checkoutLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>Order Now <ArrowRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
