import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (product) => {
        const currentItems = get().cartItems;
        const existingItem = currentItems.find((i) => i._id === product._id);
        const quantityToAdd = product.quantity || 1;

        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity + quantityToAdd,
            product.stock || existingItem.stock,
          );
          set({
            cartItems: currentItems.map((i) =>
              i._id === product._id ? { ...i, quantity: newQuantity } : i,
            ),
          });
        } else {
          const newQuantity = Math.min(quantityToAdd, product.stock);
          set({
            cartItems: [...currentItems, { ...product, quantity: newQuantity }],
          });
        }
      },

      increaseQuantity: (id) => {
        const currentItems = get().cartItems;
        set({
          cartItems: currentItems.map((i) => {
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
        const currentItems = get().cartItems;
        const existingItem = currentItems.find((i) => i._id === id);

        if (existingItem && existingItem.quantity > 1) {
          set({
            cartItems: currentItems.map((i) =>
              i._id === id ? { ...i, quantity: i.quantity - 1 } : i,
            ),
          });
        } else {
          set({ cartItems: currentItems.filter((i) => i._id !== id) });
        }
      },

      removeFromCart: (id) => {
        set({ cartItems: get().cartItems.filter((i) => i._id !== id) });
      },

      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: "cart-storage",
    },
  ),
);
