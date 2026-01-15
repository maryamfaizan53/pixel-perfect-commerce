import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck, Shield, Package, Tag, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

const CartPage = () => {
  const {
    items,
    isLoading,
    updateQuantity,
    removeItem,
    createCheckout
  } = useCartStore();

  const [promoCode, setPromoCode] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const currencyCode = items[0]?.price.currencyCode || 'PKR';
  const freeShippingThreshold = 5000;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);
  const shipping = remainingForFreeShipping <= 0 ? 0 : 250;
  const total = totalPrice + shipping;

  const handleCheckout = async () => {
    try {
      await createCheckout();
      const checkoutUrl = useCartStore.getState().checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('Failed to create checkout. Please try again.');
    }
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    setTimeout(() => {
      setApplyingPromo(false);
      toast.error('Invalid promo code');
    }, 1000);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
        <Header />
        <main className="flex-1 py-8 sm:py-12 md:py-16">
          <div className="container-custom text-center px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 rounded-full bg-muted/50 flex items-center justify-center"
            >
              <ShoppingBag className="w-10 h-10 sm:w-14 sm:h-14 text-muted-foreground" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Explore our products and find something you'll love!
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 sm:px-8" asChild>
              <Link to="/">
                Start Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Header />

      <main className="flex-1 py-4 sm:py-6 md:py-8">
        <div className="container-custom px-3 sm:px-4 md:px-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Shopping Cart</h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</p>
            </div>
            <Link to="/" className="text-primary hover:text-primary/80 text-sm sm:text-base font-medium flex items-center gap-1 self-start sm:self-auto">
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Free Shipping Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-2.5 rounded-full bg-primary/20 flex-shrink-0">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                {remainingForFreeShipping > 0 ? (
                  <>
                    <p className="text-xs sm:text-sm text-foreground">
                      Add <span className="font-bold text-primary">{currencyCode} {remainingForFreeShipping.toLocaleString('en-PK')}</span> more for <span className="font-bold">FREE shipping!</span>
                    </p>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((totalPrice / freeShippingThreshold) * 100, 100)}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-sm sm:text-base font-bold text-emerald-600">🎉 Congratulations! You qualify for FREE shipping!</p>
                )}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {/* Desktop Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 rounded-xl text-sm font-semibold text-muted-foreground">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={item.variantId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-all"
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      <div className="flex gap-3 sm:gap-4">
                        {/* Image */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0">
                          {item.product.node.media?.edges?.[0]?.node ? (
                            <img
                              src={item.product.node.media.edges[0].node.previewImage?.url || item.product.node.media.edges[0].node.image?.url}
                              alt={item.product.node.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base line-clamp-2 leading-tight">{item.product.node.title}</h3>
                              {item.variantTitle !== 'Default Title' && (
                                <p className="text-xs text-muted-foreground mt-0.5">{item.variantTitle}</p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                              onClick={() => removeItem(item.variantId)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            {/* Quantity */}
                            <div className="flex items-center border border-border rounded-lg overflow-hidden">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </Button>
                              <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </Button>
                            </div>

                            {/* Price */}
                            <p className="text-base sm:text-lg font-bold">
                              {currencyCode} {(parseFloat(item.price.amount) * item.quantity).toLocaleString('en-PK')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      {/* Product */}
                      <div className="col-span-6 flex gap-4">
                        <div className="w-20 h-20 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                          {item.product.node.media?.edges?.[0]?.node ? (
                            <img
                              src={item.product.node.media.edges[0].node.previewImage?.url || item.product.node.media.edges[0].node.image?.url}
                              alt={item.product.node.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold line-clamp-2 leading-tight">{item.product.node.title}</h3>
                          {item.variantTitle !== 'Default Title' && (
                            <p className="text-sm text-muted-foreground mt-1">{item.variantTitle}</p>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive mt-2 p-0 h-auto"
                            onClick={() => removeItem(item.variantId)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-2 text-center font-medium">
                        {currencyCode} {parseFloat(item.price.amount).toLocaleString('en-PK')}
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2 flex justify-center">
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="col-span-2 text-right font-bold text-lg">
                        {currencyCode} {(parseFloat(item.price.amount) * item.quantity).toLocaleString('en-PK')}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 sticky top-20 sm:top-24 space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-bold">Order Summary</h2>

                {/* Promo Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyPromo}
                      disabled={applyingPromo}
                      className="flex-shrink-0"
                    >
                      {applyingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                </div>

                {/* Summary Details */}
                <div className="space-y-3 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                    <span className="font-medium">{currencyCode} {totalPrice.toLocaleString('en-PK')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? "text-emerald-600" : ""}`}>
                      {shipping === 0 ? "FREE" : `${currencyCode} ${shipping.toLocaleString('en-PK')}`}
                    </span>
                  </div>

                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg font-bold">Total</span>
                      <span className="text-xl sm:text-2xl font-bold text-primary">
                        {currencyCode} {total.toLocaleString('en-PK')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Including all taxes</p>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  size="lg"
                  className="w-full h-12 sm:h-14 bg-primary hover:bg-primary/90 text-white font-bold text-sm sm:text-base rounded-xl"
                  onClick={handleCheckout}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Checkout
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-10 sm:h-12 rounded-xl text-sm"
                  asChild
                >
                  <Link to="/">Continue Shopping</Link>
                </Button>

                {/* Trust Badges */}
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Secure SSL Checkout</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>Fast Delivery Across Pakistan</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Package className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span>Cash on Delivery Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
