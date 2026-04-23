"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  ChevronRight,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "../../../store/cartStore.js";

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id;

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCartStore();
  const [activeAccordion, setActiveAccordion] = useState<string | null>(
    "details",
  );

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
        const data = await res.json();

        const flashRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/flash-sales/active`,
        );
        const flashData = await flashRes.json();
        let flashSaleMap = new Map();

        if (flashRes.ok && flashData.success && flashData.sale) {
          flashData.sale.products.forEach((p: any) => {
            if (p.productId) flashSaleMap.set(p.productId._id, p.salePrice);
          });
        }

        if (res.ok && data.success) {
          let foundProduct = data.products.find(
            (p: any) => p._id === productId,
          );

          if (foundProduct && flashSaleMap.has(foundProduct._id)) {
            foundProduct = {
              ...foundProduct,
              originalPrice: foundProduct.price,
              price: flashSaleMap.get(foundProduct._id),
              isFlashSale: true,
            };
          }

          setProduct(foundProduct);

          let related = data.products
            .filter(
              (p: any) =>
                p.category === foundProduct?.category &&
                p._id !== productId &&
                p.stock > 0,
            )
            .slice(0, 4);

          if (related.length === 0) {
            related = data.products
              .filter((p: any) => p._id !== productId && p.stock > 0)
              .slice(0, 4);
          }

          related = related.map((p: any) => {
            if (flashSaleMap.has(p._id)) {
              return {
                ...p,
                originalPrice: p.price,
                price: flashSaleMap.get(p._id),
                isFlashSale: true,
              };
            }
            return p;
          });

          setRelatedProducts(related);
        }
      } catch (error) {
        console.error("Failed to load product details", error);
        toast.error("Could not load product.");
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProductData();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ ...product, quantity: quantity });
    toast.success(`Added ${quantity} item(s) to your bag!`);
  };

  const toggleAccordion = (section: string) =>
    setActiveAccordion(activeAccordion === section ? null : section);

  if (loading)
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="animate-pulse text-xs font-bold uppercase tracking-widest text-gray-400">
          Loading details...
        </div>
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-medium">Product Not Found</h1>
        <Link
          href="/shop"
          className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-500 transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="hover:text-black transition-colors">
            Collection
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-black line-clamp-1 max-w-[200px]">
            {product.name}
          </span>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-24 lg:pt-8 flex flex-col lg:flex-row gap-12 lg:gap-20">
        <div className="w-full lg:w-3/5">
          <div className="aspect-[4/5] sm:aspect-square lg:aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden relative">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                <span className="uppercase tracking-widest text-xs font-medium">
                  No Image Available
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-2/5 lg:sticky lg:top-10 h-fit">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">
            {product.category}
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] mb-4">
            {product.name}
          </h1>
          <div className="flex items-center gap-4 mb-8">
            {product.originalPrice && (
              <span className="text-2xl text-gray-400 line-through">
                ${product.originalPrice}
              </span>
            )}
            <span
              className={`text-2xl font-black tracking-tight ${product.isFlashSale ? "text-red-500" : ""}`}
            >
              ${product.price}
            </span>
            {product.isFlashSale && (
              <span className="bg-red-50 text-red-500 border border-red-200 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Flash Sale
              </span>
            )}
          </div>
          <p className="text-gray-500 font-light leading-relaxed mb-10">
            {product.description ||
              "A premium addition to your collection. Crafted with meticulous attention to detail."}
          </p>

          <div className="space-y-6 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                Quantity
              </p>
              <div className="inline-flex items-center border border-gray-300 rounded-full p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                  disabled={product.stock <= 0}
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-10 text-center text-sm font-medium">
                  {product.stock <= 0 ? 0 : quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                  disabled={product.stock <= 0 || quantity >= product.stock}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              {product.stock > 0 && product.stock <= 5 && (
                <p className="text-xs text-red-500 mt-2 font-medium">
                  Only {product.stock} left in stock!
                </p>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="w-full bg-black text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-xl shadow-black/10 flex items-center justify-center gap-2 active:scale-[0.98] disabled:bg-gray-300 disabled:shadow-none disabled:active:scale-100 disabled:cursor-not-allowed"
            >
              {product.stock <= 0
                ? "Out of Stock"
                : `Add to Bag — $${(product.price * quantity).toFixed(2)}`}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-200 mb-8">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 stroke-[1.5] text-gray-400" />
              <span className="text-xs font-medium text-gray-600">
                Free Worldwide <br />
                Shipping
              </span>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 stroke-[1.5] text-gray-400" />
              <span className="text-xs font-medium text-gray-600">
                30-Day Free <br />
                Returns
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleAccordion("details")}
                className="w-full py-4 flex justify-between items-center text-sm font-bold uppercase tracking-widest group"
              >
                Product Details{" "}
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${activeAccordion === "details" ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${activeAccordion === "details" ? "max-h-40 pb-4 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <p className="text-sm text-gray-500 font-light leading-relaxed">
                  Materials: 100% Premium Grade.
                  <br />
                  Care: Wipe clean with a damp cloth.
                  <br />
                  Designed in Studio, ethically manufactured.
                </p>
              </div>
            </div>
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleAccordion("shipping")}
                className="w-full py-4 flex justify-between items-center text-sm font-bold uppercase tracking-widest group"
              >
                Shipping & Returns{" "}
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${activeAccordion === "shipping" ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${activeAccordion === "shipping" ? "max-h-40 pb-4 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <p className="text-sm text-gray-500 font-light leading-relaxed">
                  Standard shipping takes 3-5 business days. Express options
                  available at checkout. Returns accepted within 30 days of
                  delivery in original condition.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🚀 NEW Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-gray-200 py-24 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-2xl font-medium tracking-tight">
              You Might Also Like
            </h2>
            <Link
              href="/shop"
              className="text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {relatedProducts.map((item) => (
              <Link
                href={`/product/${item._id}`}
                key={item._id}
                className="group cursor-pointer flex flex-col h-full"
              >
                <div className="aspect-[3/4] bg-[#f8f8f8] rounded-2xl overflow-hidden mb-5 relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      <ShoppingBag className="h-8 w-8 mb-2 opacity-20" />
                    </div>
                  )}
                </div>

                {/* Details & Cart Area */}
                <div className="flex items-start justify-between gap-4 mt-auto">
                  <div>
                    <h3 className="font-medium text-[#111111] text-sm mb-1 line-clamp-1 group-hover:text-gray-500 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        {item.originalPrice && (
                          <span className="text-gray-400 text-xs line-through">
                            ${item.originalPrice}
                          </span>
                        )}
                        <p
                          className={`text-sm font-light ${item.isFlashSale ? "text-red-500 font-bold" : "text-gray-500"}`}
                        >
                          ${item.price}
                        </p>
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">
                        {item.stock} in stock
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart({ ...item, quantity: 1 });
                      toast.success("Added to bag!");
                    }}
                    className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-900 hover:bg-black hover:border-black hover:text-white transition-all shrink-0"
                    title="Add to Cart"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="bg-black text-white py-12 px-6 lg:px-8 text-center mt-10">
        <h2 className="text-4xl font-bold tracking-tighter mb-6">STUDIO.</h2>
        <p className="text-xs font-light text-gray-500 uppercase tracking-widest">
          © 2026 Studio Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
