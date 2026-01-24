import { ShoppingBag, Heart, Star, Loader2, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { formatProductId, trackMetaEvent } from "@/lib/meta-pixel";

interface ProductCardProps {
  product: ShopifyProduct;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { node } = product;

  // Find the first video media
  const videoMedia = node.media?.edges.find(
    edge => edge.node.mediaContentType === 'VIDEO' || edge.node.mediaContentType === 'EXTERNAL_VIDEO'
  );
  const hasVideo = !!videoMedia;
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

    // Meta Pixel: Track AddToCart
    trackMetaEvent('AddToCart', {
      content_ids: [formatProductId(node.id)],
      content_name: node.title,
      content_type: 'product',
      value: price,
      currency: currencyCode || 'PKR'
    });

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col h-full bg-card rounded-xl sm:rounded-2xl overflow-hidden border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300"
    >
      {/* Product Image Section */}
      <Link
        to={`/product/${node.handle}`}
        className="relative aspect-square overflow-hidden"
      >
        {/* Status Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 flex flex-col gap-1 sm:gap-1.5">
          {isOutOfStock && (
            <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-muted text-muted-foreground text-[8px] sm:text-[10px] font-semibold uppercase rounded-md">
              Sold Out
            </span>
          )}
          {hasVideo && !isOutOfStock && (
            <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-primary/90 text-primary-foreground text-[8px] sm:text-[10px] font-bold uppercase rounded-md flex items-center gap-0.5 sm:gap-1 shadow-lg">
              <Play className="w-2 sm:w-2.5 h-2 sm:h-2.5 fill-current" />
              Video
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full backdrop-blur-sm transition-all ${inWishlist
              ? 'bg-primary text-primary-foreground'
              : 'bg-white/80 text-foreground/70 hover:bg-white hover:text-primary opacity-0 group-hover:opacity-100'
              }`}
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>

        {/* Product Image */}
        <OptimizedImage
          src={node.media?.edges[0]?.node?.previewImage?.url || node.media?.edges[0]?.node?.image?.url || "/placeholder.svg"}
          alt={node.title}
          width={400}
          mobileWidth={300}
          quality={80}
          containerClassName="w-full h-full"
          className={`transition-transform duration-500 group-hover:scale-105 ${isHovered && hasVideo ? 'opacity-0' : 'opacity-100'}`}
        />

        {/* Video Preview Overlay */}
        {hasVideo && isHovered && (
          <div className="absolute inset-0 z-0">
            {videoMedia.node.mediaContentType === 'VIDEO' && videoMedia.node.sources?.[0] ? (
              <video
                src={videoMedia.node.sources[0].url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : videoMedia.node.mediaContentType === 'EXTERNAL_VIDEO' && videoMedia.node.embeddedUrl ? (
              <iframe
                src={`${videoMedia.node.embeddedUrl}${videoMedia.node.embeddedUrl.includes('?') ? '&' : '?'}autoplay=1&mute=1&controls=0&loop=1&playlist=${videoMedia.node.embeddedUrl.split('/').pop()}`}
                className="w-full h-full pointer-events-none"
                allow="autoplay; encrypted-media"
              />
            ) : null}
          </div>
        )}

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full h-8 sm:h-10 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-[10px] sm:text-sm shadow-lg px-2"
          >
            <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {isOutOfStock ? 'Short' : 'Add to Collection'}
          </Button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${node.handle}`} className="flex-1">
          <h3 className="text-sm md:text-base font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {node.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto pt-1 sm:pt-2">
          <p className="text-sm sm:text-lg font-black text-foreground">
            <span className="text-[10px] sm:text-xs font-normal text-muted-foreground mr-0.5 sm:mr-1 uppercase tracking-tight">{currencyCode}</span>
            {price.toLocaleString()}
          </p>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg hover:bg-primary/10 hover:text-primary hidden sm:flex"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};