import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  product_id: string;
  product_handle: string;
  created_at: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string, productHandle: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string, productHandle: string) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Fetch wishlist items
  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    fetchWishlist();

    const channel = supabase
      .channel('wishlist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlists',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchWishlist();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const addToWishlist = async (productId: string, productHandle: string) => {
    if (!user) {
      toast.error("Please log in to add items to your wishlist");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId,
          product_handle: productHandle,
        });

      if (error) throw error;
      toast.success("Added to wishlist");
    } catch (error: any) {
      console.error('Error adding to wishlist:', error);
      toast.error(error.message || "Failed to add to wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      toast.success("Removed from wishlist");
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      toast.error(error.message || "Failed to remove from wishlist");
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId: string, productHandle: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId, productHandle);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
