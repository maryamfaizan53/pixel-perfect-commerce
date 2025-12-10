import { ShoppingCart, Heart, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { HighlightText } from "@/components/ui/highlight-text";

const LOW_STOCK_THRESHOLD = 5;

interface ProductCardProps {
  product: ShopifyProduct;
  badge?: "sale" | "new" | "bestseller";
  searchQuery?: string;
}

export const ProductCard = ({ product, badge, searchQuery = "" }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
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
    <div className={`group bg-card border border-border rounded-lg overflow-hidden product-card ${isOutOfStock ? 'opacity-75' : ''}`}>
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link to={`/product/${node.handle}`}>
          <img
            src={image}
            alt={node.title}
            className={`w-full h-full object-cover transition-transform duration-300 ${isOutOfStock ? 'grayscale' : 'group-hover:scale-105'}`}
            loading="lazy"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm font-semibold">
                Out of Stock
              </Badge>
            </div>
          )}
        </Link>

        {!isOutOfStock && badge && (
          <Badge
            className={`absolute top-2 left-2 ${
              badge === "sale"
                ? "badge-sale"
                : badge === "new"
                ? "badge-new"
                : "badge-bestseller"
            }`}
          >
            {badge === "sale" && "Sale"}
            {badge === "new" && "New"}
            {badge === "bestseller" && "Best Seller"}
          </Badge>
        )}
        
        {!isOutOfStock && isLowStock && (
          <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-600 text-white">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Only {node.totalInventory} left
          </Badge>
        )}

        <Button
          size="icon"
          variant="outline"
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          className={`absolute top-2 right-2 bg-background hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity ${
            inWishlist ? "opacity-100" : ""
          }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? "fill-destructive text-destructive" : ""}`} />
        </Button>

        {!isOutOfStock && (
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-secondary hover:bg-secondary-hover"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        )}
      </div>

      <div className="p-4">
        <Link to={`/product/${node.handle}`}>
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
            <HighlightText text={node.title} highlight={searchQuery} />
          </h3>
        </Link>

        {searchQuery && node.description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            <HighlightText text={node.description} highlight={searchQuery} />
          </p>
        )}

        <div className="flex items-baseline gap-2">
          <span className="price-current">{currencyCode} {price.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
