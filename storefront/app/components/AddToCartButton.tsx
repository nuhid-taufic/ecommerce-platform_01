"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../../store/cartStore.js";
import toast from "react-hot-toast";

export default function AddToCartButton({ product }: { product: any }) {
  const { cartItems, addToCart } = useCartStore();

  const handleAdd = () => {
    const existingItem = cartItems.find(
      (item: any) => item._id === product._id,
    );
    if (existingItem && existingItem.quantity >= product.stock) {
      toast.error(`Only ${product.stock} items available in stock.`);
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to your cart!`);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={product.stock <= 0}
      className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.24)] hover:-translate-y-0.5"
    >
      <ShoppingCart className="h-6 w-6" />
      {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
    </button>
  );
}
