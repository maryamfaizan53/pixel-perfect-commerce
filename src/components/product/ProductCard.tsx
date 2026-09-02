import { ShoppingBag, Heart, Star, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { ProductCard as ProductCardType } from "@/types/catalog";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { formatProductId, trackMetaEvent } from "@/lib/meta-pixel";

interface ProductCardProps {
  product: ProductCardType;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

  const { id, slug, title, price, compareAtPrice, inStock, hasVideo, currency } = product;
  const image = product.images[0]?.url || "/placeholder.svg";
  const inWishlist = isInWishlist(id);
  const onSale = compareAtPrice != null && compareAtPrice > price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock) {
      toast.error("This product is out of stock");
      return;
    }

    const cartItem: CartItem = {
      productId: id,
      slug,
      title,
      image: product.images[0]?.url ?? null,
      variantKey: null,
      variantTitle: null,
      price,
      currency,
      quantity: 1,
    };
    addItem(cartItem);

    trackMetaEvent("AddToCart", {
      content_ids: [formatProductId(id)],
      content_name: title,
      content_type: "product",
      value: price,
      currency,
    });

    toast.success("Added to cart", { description: title });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id, slug);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col h-full bg-card rounded-xl sm:rounded-2xl overflow-hidden border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300"
    >
      <Link to={`/product/${slug}`} className="relative aspect-square overflow-hidden">
        {/* Status badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 flex flex-col gap-1 sm:gap-1.5">
          {!inStock && (
            <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-muted text-muted-foreground text-[8px] sm:text-[10px] font-semibold uppercase rounded-md">
              Sold Out
            </span>
          )}
          {onSale && inStock && (
            <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-rose-500 text-white text-[8px] sm:text-[10px] font-bold uppercase rounded-md">
              -{Math.round(((compareAtPrice! - price) / compareAtPrice!) * 100)}%
            </span>
          )}
          {hasVideo && inStock && !onSale && (
            <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-primary/90 text-primary-foreground text-[8px] sm:text-[10px] font-bold uppercase rounded-md flex items-center gap-0.5 sm:gap-1 shadow-lg">
              <Play className="w-2 sm:w-2.5 h-2 sm:h-2.5 fill-current" />
              Video
            </span>
          )}
        </div>

        {/* Wishlist */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full backdrop-blur-sm transition-all ${
              inWishlist
                ? "bg-primary text-primary-foreground"
                : "bg-white/80 text-foreground/70 hover:bg-white hover:text-primary opacity-0 group-hover:opacity-100"
            }`}
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>

        <OptimizedImage
          src={image}
          alt={title}
          width={400}
          mobileWidth={300}
          quality={80}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
          containerClassName="w-full h-full"
          className="transition-transform duration-500 group-hover:scale-105"
        />

        {/* Quick add */}
        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="w-full h-8 sm:h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-[10px] sm:text-sm shadow-lg px-2"
          >
            <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {inStock ? "Add to Cart" : "Sold Out"}
          </Button>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${slug}`} className="flex-1">
          <h3 className="text-sm md:text-base font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        {product.rating && product.rating.count > 0 && (
          <div className="flex items-center gap-1 mb-1.5 text-[11px] text-muted-foreground">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-foreground">{product.rating.average.toFixed(1)}</span>
            <span>({product.rating.count})</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-1 sm:pt-2">
          <p className="text-sm sm:text-lg font-black text-foreground">
            <span className="text-[10px] sm:text-xs font-normal text-muted-foreground mr-0.5 sm:mr-1 uppercase tracking-tight">
              {currency}
            </span>
            {price.toLocaleString()}
            {onSale && (
              <span className="ml-1.5 text-[10px] sm:text-xs font-normal text-muted-foreground line-through">
                {compareAtPrice!.toLocaleString()}
              </span>
            )}
          </p>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddToCart}
            disabled={!inStock}
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg hover:bg-primary/10 hover:text-primary hidden sm:flex"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
