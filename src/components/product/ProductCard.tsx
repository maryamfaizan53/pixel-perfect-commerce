import { ShoppingBag, Heart, Star, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: ShopifyProduct;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);

  const { node } = product;
  const inWishlist = isInWishlist(node.id);
  const isOutOfStock = !node.availableForSale;

  const defaultVariant = node.variants.edges[0]?.node;
  const price = parseFloat(node.priceRange.minVariantPrice.amount);
  const currencyCode = node.priceRange.minVariantPrice.currencyCode;

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
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col h-full bg-card rounded-xl overflow-hidden border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300"
    >
      {/* Product Image Section */}
      <Link
        to={`/product/${node.handle}`}
        className="relative aspect-square overflow-hidden bg-muted"
      >
        {/* Status Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {isOutOfStock && (
            <span className="px-2.5 py-1 bg-muted text-muted-foreground text-[10px] font-semibold uppercase rounded-md">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className={`w-9 h-9 rounded-full backdrop-blur-sm transition-all ${inWishlist
              ? 'bg-primary text-primary-foreground'
              : 'bg-white/80 text-foreground/70 hover:bg-white hover:text-primary opacity-0 group-hover:opacity-100'
              }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Product Image */}
        <img
          src={node.images.edges[0]?.node?.url || "/placeholder.svg"}
          alt={node.title}
          onLoad={() => setImageLoaded(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm shadow-lg"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${node.handle}`} className="flex-1">
          <h3 className="text-xs font-medium text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {node.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto pt-2">
          <p className="text-lg font-bold text-foreground">
            <span className="text-xs font-normal text-muted-foreground mr-1">{currencyCode}</span>
            {price.toLocaleString()}
          </p>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-9 h-9 rounded-lg hover:bg-primary/10 hover:text-primary"
          >
            <ShoppingBag className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};