"use client";

import React from "react";
import Link from "next/link";
import { X, ArrowLeft, ShoppingBag } from "lucide-react";

export default function CancelPage() {
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
        <div className="w-full max-w-md text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Cancel Icon */}
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <X className="h-10 w-10 text-gray-400 stroke-[2]" />
          </div>

          <h1 className="text-4xl font-medium tracking-tight mb-4">
            Payment Cancelled.
          </h1>
          <p className="text-gray-500 font-light mb-10 leading-relaxed">
            Your transaction could not be completed or was cancelled. No charges
            were made to your account.
          </p>

          <div className="flex flex-col gap-4">
            <Link
              href="/cart"
              className="w-full bg-black text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-lg shadow-black/10 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" /> Return to Bag
            </Link>
            <Link
              href="/shop"
              className="w-full bg-transparent text-gray-500 hover:text-black py-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Store
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
