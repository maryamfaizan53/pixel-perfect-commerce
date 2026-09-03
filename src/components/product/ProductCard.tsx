import { ShoppingBag, Heart, Star, Play, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { ProductCard as ProductCardType } from "@/types/catalog";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { formatProductId, trackMetaEvent } from "@/lib/meta-pixel";
import { EASE, hoverLift, reduceMotion } from "@/lib/motion";

interface ProductCardProps {
  product: ProductCardType;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const reduce = reduceMotion();

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
      initial={reduce ? undefined : { opacity: 0, y: 18 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.05, ease: EASE }}
      whileHover={reduce ? undefined : hoverLift}
      className="group relative flex flex-col h-full bg-card rounded-[14px] overflow-hidden border border-border shadow-soft hover:shadow-card-hover transition-shadow duration-300"
    >
      <Link to={`/product/${slug}`} className="relative aspect-square overflow-hidden bg-muted">
        {/* badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
          {!inStock && (
            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wide rounded-md border border-border">
              Sold out
            </span>
          )}
          {onSale && inStock && (
            <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase rounded-md">
              -{Math.round(((compareAtPrice! - price) / compareAtPrice!) * 100)}%
            </span>
          )}
          {hasVideo && inStock && !onSale && (
            <span className="px-2 py-0.5 bg-secondary text-white text-[10px] font-bold uppercase rounded-md inline-flex items-center gap-1">
              <Play className="w-2.5 h-2.5 fill-current" /> Video
            </span>
          )}
        </div>

        {/* wishlist */}
        <button
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          aria-label="Wishlist"
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
            inWishlist
              ? "bg-primary text-primary-foreground"
              : "bg-white/85 text-foreground/70 hover:text-primary opacity-0 group-hover:opacity-100"
          }`}
        >
          <Heart className="w-4 h-4" />
        </button>

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

        {/* COD trust pill */}
        <span className="absolute bottom-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-trust text-trust-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          <BadgeCheck className="w-3 h-3" /> COD
        </span>

        {/* quick add */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            onClick={handleAddToCart}
            disabled={!inStock}
            size="sm"
            className="w-full shadow-card"
          >
            <ShoppingBag className="w-4 h-4" />
            {inStock ? "Add to cart" : "Sold out"}
          </Button>
        </div>
      </Link>

      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        <Link to={`/product/${slug}`} className="flex-1">
          <h3 className="text-sm md:text-[15px] font-semibold text-foreground line-clamp-2 mb-1.5 leading-snug group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>

        {product.rating && product.rating.count > 0 && (
          <div className="flex items-center gap-1 mb-1.5 text-[11px] text-muted-foreground">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span className="font-semibold text-foreground">{product.rating.average.toFixed(1)}</span>
            <span>({product.rating.count})</span>
          </div>
        )}

        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-base sm:text-lg font-extrabold text-foreground">
            <span className="text-[11px] font-medium text-muted-foreground mr-1 uppercase">{currency}</span>
            {price.toLocaleString()}
          </span>
          {onSale && (
            <span className="text-xs font-medium text-muted-foreground line-through">
              {compareAtPrice!.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
