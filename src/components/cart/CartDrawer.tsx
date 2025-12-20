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
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2, Sparkles, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  const currencyCode = items[0]?.price.currencyCode || 'USD';

  const handleCheckout = async () => {
    try {
      await createCheckout();
      const checkoutUrl = useCartStore.getState().checkoutUrl;
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
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
        <Button variant="ghost" size="icon" className="relative w-12 h-12 rounded-2xl hover:bg-primary/5 group">
          <ShoppingBag className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-black bg-primary text-white border-none shadow-premium">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col h-full glass-dark border-white/10 p-0 overflow-hidden">
        <SheetHeader className="p-8 pb-4 space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <SheetTitle className="text-2xl font-black text-white tracking-tight">Your Curation</SheetTitle>
          </div>
          <SheetDescription className="text-white/40 font-medium">
            {totalItems === 0 ? "The vault is currently empty." : `${totalItems} artisan pieces selected.`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col flex-1 pt-4 min-h-0 bg-white/5 border-t border-white/5">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                <ShoppingBag className="h-10 w-10 text-white/20" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-bold text-white">Begin your journey</p>
                <p className="text-white/30 text-sm max-w-[200px] mx-auto">Explore our master catalog to fill your personal treasury.</p>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="rounded-xl border-white/10 text-white hover:bg-white/10"
              >
                Start Exploring
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.variantId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.1 }}
                      className="group flex gap-5 p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="w-20 h-20 bg-slate-800 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img
                            src={item.product.node.images.edges[0].node.url}
                            alt={item.product.node.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 py-1">
                        <h4 className="font-bold text-white tracking-tight truncate mb-1">{item.product.node.title}</h4>
                        {item.variantTitle !== 'Default Title' && (
                          <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">{item.variantTitle}</p>
                        )}
                        <div className="flex items-center justify-between mt-auto">
                          <p className="font-black text-white/90">
                            <span className="text-[10px] text-white/30 mr-1">{currencyCode}</span>
                            {parseFloat(item.price.amount).toFixed(2)}
                          </p>

                          <div className="flex items-center gap-2 bg-black/20 rounded-xl p-1 border border-white/5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-6 text-center text-xs font-black text-white">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-white/10 hover:text-rose-500 hover:bg-rose-500/10 self-start transition-colors"
                        onClick={() => removeItem(item.variantId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex-shrink-0 p-8 space-y-6 glass-noise bg-black/40 border-t border-white/10">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                    <span>Subtotal</span>
                    <span>{currencyCode} {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black text-white tracking-tight">Total Investment</span>
                    <span className="text-2xl font-black text-primary text-glow font-mono">
                      {totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full h-16 btn-premium text-white font-black uppercase tracking-widest text-xs"
                  disabled={items.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Securing...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5 mr-3" />
                      Finalize Acquisition
                    </>
                  )}
                </Button>
                <p className="text-center text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                  Secure Checkout powered by Shopify
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
