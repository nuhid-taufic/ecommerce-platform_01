import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      addToCart: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i._id === product._id);
        const quantityToAdd = product.quantity || 1;

        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity + quantityToAdd,
            product.stock || existingItem.stock,
          );
          set({
            items: currentItems.map((i) =>
              i._id === product._id ? { ...i, quantity: newQuantity } : i,
            ),
          });
        } else {
          const newQuantity = Math.min(quantityToAdd, product.stock);
          set({
            items: [...currentItems, { ...product, quantity: newQuantity }],
          });
        }
      },

      increaseQuantity: (id) => {
        const currentItems = get().items;
        set({
          items: currentItems.map((i) => {
            if (i._id === id) {
              return {
                ...i,
                quantity: Math.min(i.quantity + 1, i.stock || i.quantity + 1),
              };
            }
            return i;
          }),
        });
      },

      decreaseQuantity: (id) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i._id === id);

        if (existingItem && existingItem.quantity > 1) {
          set({
            items: currentItems.map((i) =>
              i._id === id ? { ...i, quantity: i.quantity - 1 } : i,
            ),
          });
        } else {
          set({ items: currentItems.filter((i) => i._id !== id) });
        }
      },

      removeFromCart: (id) => {
        set({ items: get().items.filter((i) => i._id !== id) });
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
    },
  ),
);
