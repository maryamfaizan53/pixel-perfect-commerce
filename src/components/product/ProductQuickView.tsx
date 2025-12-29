import { motion } from "framer-motion";
import { ShoppingCart, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { useState } from "react";

interface ProductQuickViewProps {
    product: ShopifyProduct;
    index: number;
}

export const ProductQuickView = ({ product, index }: ProductQuickViewProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const addItem = useCartStore(state => state.addItem);

    const price = parseFloat(product.node.priceRange.minVariantPrice.amount);
    const currencyCode = product.node.priceRange.minVariantPrice.currencyCode;
    const image = product.node.images.edges[0]?.node.url || "/placeholder.svg";
    const variant = product.node.variants.edges[0]?.node;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!variant) return;

        const cartItem = {
            product,
            variantId: variant.id,
            variantTitle: variant.title,
            price: variant.price,
            quantity: 1,
            selectedOptions: variant.selectedOptions || []
        };

        addItem(cartItem);
        toast.success("Added to cart", {
            description: product.node.title,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative"
        >
            <Link
                to={`/product/${product.node.handle}`}
                className="block relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
            >
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                    <motion.img
                        src={image}
                        alt={product.node.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        animate={{
                            scale: isHovered ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.6 }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* New Badge */}
                    <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
                            New
                        </span>
                    </div>

                    {/* Wishlist Button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: isHovered ? 1 : 0,
                            scale: isHovered ? 1 : 0.8
                        }}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toast.success("Added to wishlist");
                        }}
                    >
                        <Heart className="w-5 h-5 text-slate-900" />
                    </motion.button>

                    {/* Quick Add to Cart */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                            opacity: isHovered ? 1 : 0,
                            y: isHovered ? 0 : 20
                        }}
                        onClick={handleAddToCart}
                        className="absolute bottom-3 left-3 right-3 h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xl transition-colors"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Quick Add
                    </motion.button>
                </div>

                {/* Product Info */}
                <div className="p-4 space-y-2">
                    <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight">
                        {product.node.title}
                    </h3>
                    <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-primary">
                            {currencyCode} {price.toLocaleString()}
                        </span>
                        <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};
