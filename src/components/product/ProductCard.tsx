import { Star, ShoppingCart, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: "sale" | "new" | "bestseller";
  category: string;
}

export const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  rating,
  reviewCount,
  image,
  badge,
  category,
}: ProductCardProps) => {
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-card border border-border rounded-lg overflow-hidden product-card">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link to={`/products/${id}`}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {badge && (
          <Badge
            className={`absolute top-2 left-2 ${
              badge === "sale"
                ? "badge-sale"
                : badge === "new"
                ? "badge-new"
                : "badge-bestseller"
            }`}
          >
            {badge === "sale" && discount > 0 && `-${discount}%`}
            {badge === "new" && "New"}
            {badge === "bestseller" && "Best Seller"}
          </Badge>
        )}

        <Button
          size="icon"
          variant="outline"
          className="absolute top-2 right-2 bg-white hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-secondary hover:bg-secondary-hover"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>

      <div className="p-4">
        <Link
          to={`/products/${id}`}
          className="block mb-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {category}
        </Link>

        <Link to={`/products/${id}`}>
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(rating)
                  ? "fill-warning text-warning"
                  : "fill-muted text-muted"
              }`}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-1">
            ({reviewCount})
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="price-current">${price.toFixed(2)}</span>
          {originalPrice && originalPrice > price && (
            <>
              <span className="price-original">${originalPrice.toFixed(2)}</span>
              <span className="price-discount">Save {discount}%</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
