"use client";

import React, { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FloatingCart() {
  const { items, getTotalPrice, increaseQuantity, decreaseQuantity, removeFromCart } = useCartStore();
  const { settings } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const cartItems = items || [];
  const totalPrice = getTotalPrice();
  const currency = settings?.currencySymbol || "BDT";

  const handleCheckout = () => {
    setIsOpen(false);
    router.push("/cart");
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col cursor-pointer shadow-2xl rounded-l-xl overflow-hidden transition-transform hover:-translate-x-1"
        >
          <div className="bg-primary text-white p-3 flex flex-col items-center justify-center gap-1 min-w-[70px]">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-[10px] font-bold mt-1">
              {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
            </span>
          </div>
          <div className="bg-white text-secondary p-2 flex items-center justify-center font-bold text-[10px] border border-gray-100">
            {currency} {totalPrice.toFixed(2)}
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Panel Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] max-w-[100vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-sm font-bold uppercase tracking-widest text-secondary">
            Shopping Cart
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-secondary transition-colors"
          >
            Close <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col">
          {cartItems.length === 0 ? (
            <div className="m-auto flex flex-col items-center justify-center text-center">
              <ShoppingBag className="h-12 w-12 text-gray-200 mb-4" />
              <p className="text-sm text-gray-500 mb-6">Your cart is empty.</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold uppercase tracking-widest bg-primary text-white px-8 py-3 rounded-full hover:opacity-90 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item: any) => (
                <div key={item._id} className="flex gap-4 items-center group">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden shrink-0 relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <Link
                        href={`/shop/${item._id}`}
                        onClick={() => setIsOpen(false)}
                        className="text-sm font-bold text-secondary hover:text-gray-500 transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">
                      {item.category || "Premium Item"}
                    </p>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-1">
                        <button
                          onClick={() => decreaseQuantity(item._id)}
                          className="text-gray-400 hover:text-secondary transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increaseQuantity(item._id)}
                          className="text-gray-400 hover:text-secondary transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-sm font-bold">
                        {currency} {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-secondary">Total:</span>
            <span className="text-sm font-bold text-secondary">
              {currency} {totalPrice.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Checkout ↗
          </button>
        </div>
      </div>
    </>
  );
}
