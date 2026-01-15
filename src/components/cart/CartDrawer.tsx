import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2, Sparkles, ShoppingBag, Package, Truck } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    items,
    isLoading,
    updateQuantity,
    removeItem,
    createCheckout
  } = useCartStore();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const currencyCode = items[0]?.price.currencyCode || 'PKR';
  const freeShippingThreshold = 5000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);

  const handleCheckout = async () => {
    try {
      await createCheckout();
      const checkoutUrl = useCartStore.getState().checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('Failed to create checkout. Please try again.');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-secondary-foreground hover:bg-white/10 rounded-lg transition-all group">
          <div className="relative">
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
            {totalItems > 0 && (
              <Badge className="absolute -top-2 -right-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-[9px] sm:text-[10px] font-bold bg-primary text-primary-foreground border-2 border-background animate-pulse">
                {totalItems > 99 ? '99+' : totalItems}
              </Badge>
            )}
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-[9px] sm:text-[10px] text-secondary-foreground/70 uppercase tracking-wider">Cart</span>
            <span className="font-bold text-xs sm:text-sm leading-tight">
              {totalItems > 0 ? `${currencyCode} ${totalPrice.toLocaleString('en-PK', { maximumFractionDigits: 0 })}` : 'Empty'}
            </span>
          </div>
        </button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md md:max-w-lg flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-white/10 p-0 overflow-hidden">
        {/* Header */}
        <SheetHeader className="p-4 sm:p-6 md:p-8 pb-3 sm:pb-4 space-y-1 sm:space-y-2 border-b border-white/5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <SheetTitle className="text-xl sm:text-2xl font-black text-white tracking-tight">Shopping Cart</SheetTitle>
          </div>
          <SheetDescription className="text-white/50 text-xs sm:text-sm font-medium">
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>

        {/* Free Shipping Progress */}
        {items.length > 0 && (
          <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-white/5">
            <div className="flex items-center gap-2 sm:gap-3">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {remainingForFreeShipping > 0 ? (
                  <>
                    <p className="text-[10px] sm:text-xs text-white/70 truncate">
                      Add <span className="font-bold text-primary">{currencyCode} {remainingForFreeShipping.toLocaleString('en-PK')}</span> for free shipping
                    </p>
                    <div className="mt-1.5 sm:mt-2 h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((totalPrice / freeShippingThreshold) * 100, 100)}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-xs sm:text-sm font-bold text-emerald-400">🎉 You qualify for FREE shipping!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cart Content */}
        <div className="flex flex-col flex-1 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 space-y-4 sm:space-y-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10"
              >
                <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-white/30" />
              </motion.div>
              <div className="text-center space-y-1 sm:space-y-2">
                <p className="text-lg sm:text-xl font-bold text-white">Your cart is empty</p>
                <p className="text-white/40 text-xs sm:text-sm max-w-[200px] mx-auto">Explore our products and add items to your cart</p>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold px-6 sm:px-8"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 py-3 sm:py-4 space-y-3 sm:space-y-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.variantId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className="group flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-slate-800 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                        {item.product.node.media?.edges?.[0]?.node ? (
                          <img
                            src={item.product.node.media.edges[0].node.previewImage?.url || item.product.node.media.edges[0].node.image?.url}
                            alt={item.product.node.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-white/20" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <h4 className="font-bold text-white text-sm sm:text-base tracking-tight line-clamp-2 leading-tight">{item.product.node.title}</h4>
                          {item.variantTitle !== 'Default Title' && (
                            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-primary/80 mt-0.5">{item.variantTitle}</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2 sm:mt-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1 bg-black/30 rounded-lg p-0.5 border border-white/10">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-7 sm:w-7 rounded-md text-white/60 hover:text-white hover:bg-white/10"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                            <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-bold text-white">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 sm:h-7 sm:w-7 rounded-md text-white/60 hover:text-white hover:bg-white/10"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                          </div>

                          {/* Price */}
                          <p className="font-bold text-white text-sm sm:text-base">
                            <span className="text-[9px] sm:text-[10px] text-white/40 mr-0.5">{currencyCode}</span>
                            {(parseFloat(item.price.amount) * item.quantity).toLocaleString('en-PK')}
                          </p>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-white/20 hover:text-rose-500 hover:bg-rose-500/10 self-start flex-shrink-0 transition-colors"
                        onClick={() => removeItem(item.variantId)}
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Checkout Section */}
              <div className="flex-shrink-0 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5 bg-gradient-to-t from-black/60 to-black/40 backdrop-blur-sm border-t border-white/10">
                {/* Order Summary */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center text-white/50 text-xs sm:text-sm">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>{currencyCode} {totalPrice.toLocaleString('en-PK')}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/50 text-xs sm:text-sm">
                    <span>Shipping</span>
                    <span className={remainingForFreeShipping <= 0 ? "text-emerald-400 font-semibold" : ""}>
                      {remainingForFreeShipping <= 0 ? "FREE" : "Calculated at checkout"}
                    </span>
                  </div>
                  <div className="pt-2 sm:pt-3 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg font-bold text-white">Total</span>
                      <span className="text-xl sm:text-2xl font-black text-primary">
                        {currencyCode} {totalPrice.toLocaleString('en-PK')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  className="w-full h-12 sm:h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold uppercase tracking-wide text-xs sm:text-sm rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                  disabled={items.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Proceed to Checkout
                    </>
                  )}
                </Button>

                {/* View Cart Link */}
                <Link
                  to="/cart"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-xs sm:text-sm text-white/50 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  View full cart
                </Link>

                {/* Trust Badge */}
                <p className="text-center text-[8px] sm:text-[9px] font-semibold text-white/30 uppercase tracking-widest">
                  🔒 Secure checkout • 💳 Cash on Delivery Available
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
