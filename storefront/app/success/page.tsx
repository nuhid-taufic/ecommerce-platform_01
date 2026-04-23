"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Check, ArrowRight, Package } from "lucide-react";
import { useCartStore } from "../../store/cartStore.js";

export default function SuccessPage() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] selection:bg-black selection:text-white flex flex-col">
      {/* Minimal Navbar */}
      <nav className="py-6 border-b border-gray-200/50 bg-white absolute top-0 w-full z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center group-hover:scale-90 transition-transform">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <span className="text-xl font-bold tracking-tighter">STUDIO.</span>
          </Link>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center px-6 lg:px-8 pt-24 pb-12">
        <div className="w-full max-w-lg text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-black/20">
            <Check className="h-10 w-10 text-white stroke-[3]" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-4">
            Order Confirmed.
          </h1>
          <p className="text-gray-500 font-light mb-8 leading-relaxed">
            Thank you for your purchase. We've received your order and are
            getting it ready for shipment. A confirmation email has been sent to
            you.
          </p>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-10 flex items-center justify-between text-left">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Order Number
              </p>
              <p className="font-medium text-lg">
                ORD-{Math.floor(100000 + Math.random() * 900000)}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
              <Package className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/profile"
              className="flex-1 bg-black text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg shadow-black/10 flex items-center justify-center gap-2"
            >
              Track Order
            </Link>
            <Link
              href="/shop"
              className="flex-1 bg-white border border-gray-200 text-black px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              Continue Shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
