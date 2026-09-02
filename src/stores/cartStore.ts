import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLineInput } from "@/types/catalog";

export interface CartItem {
  productId: string; // Sanity _id
  slug: string;
  title: string;
  image: string | null;
  variantKey: string | null;
  variantTitle: string | null;
  price: number; // unit price PKR at add time — re-validated at /checkout/quote
  currency: string;
  quantity: number;
}

/** Stable identity for a line = product + chosen variant. */
export const lineKey = (i: Pick<CartItem, "productId" | "variantKey">) =>
  `${i.productId}::${i.variantKey ?? ""}`;

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
  toLines: () => CartLineInput[];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const key = lineKey(item);
        const existing = get().items.find((i) => lineKey(i) === key);
        if (existing) {
          set({
            items: get().items.map((i) =>
              lineKey(i) === key ? { ...i, quantity: i.quantity + item.quantity } : i,
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set({
          items: get().items.map((i) => (lineKey(i) === key ? { ...i, quantity } : i)),
        });
      },

      removeItem: (key) => set({ items: get().items.filter((i) => lineKey(i) !== key) }),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((n, i) => n + i.quantity, 0),

      subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),

      toLines: () =>
        get().items.map((i) => ({
          productId: i.productId,
          slug: i.slug,
          variantKey: i.variantKey,
          quantity: i.quantity,
        })),
    }),
    {
      name: "aibazar-cart",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // v1 (Shopify) carts are incompatible — drop them.
      migrate: () => ({ items: [] }),
    },
  ),
);
