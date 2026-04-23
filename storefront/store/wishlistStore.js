import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => item._id === product._id,
        );
        if (!existingItem) {
          set({ items: [...currentItems, product] });
        }
      },
      removeFromWishlist: (productId) => {
        set({ items: get().items.filter((item) => item._id !== productId) });
      },
      isInWishlist: (productId) => {
        return get().items.some((item) => item._id === productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "wishlist-storage",
    },
  ),
);
