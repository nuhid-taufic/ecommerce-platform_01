"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  X,
  Sparkles,
  Loader2,
  Minus,
  Plus,
  MoveUpRight,
} from "lucide-react";
import Link from "next/link";
import { useCartStore } from "../../store/cartStore.js";
import toast from "react-hot-toast";
import { useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ShopContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [aiSearchResults, setAiSearchResults] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [sortBy, setSortBy] = useState("Default");
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const desktopSortDropdownRef = useRef<HTMLDivElement>(null);
  const mobileSortDropdownRef = useRef<HTMLDivElement>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartItems, addToCart, increaseQuantity, decreaseQuantity, removeFromCart } = useCartStore();

  // Sync with URL Category
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory("All");
    }
  }, [urlCategory]);

  const totalItems = cartItems.reduce(
    (acc: number, item: any) => acc + item.quantity,
    0,
  );
  const totalPrice = cartItems.reduce(
    (acc: number, item: any) => acc + item.price * item.quantity,
    0,
  );
  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 2,
    }).format(amount);

  useEffect(() => {
    const fetchProducts = async () => {
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
          let products = data.products
            .filter((p: any) => p.stock > 0)
            .reverse();

          products = products.map((p: any) => {
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

          setAllProducts(products);
          setAiSearchResults(products);

          const uniqueCategories = Array.from(
            new Set(products.map((p: any) => p.category)),
          ).filter(Boolean) as string[];
          setCategories(["All", ...uniqueCategories]);
        }
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideDesktop =
        desktopSortDropdownRef.current &&
        !desktopSortDropdownRef.current.contains(event.target as Node);
      const isOutsideMobile =
        mobileSortDropdownRef.current &&
        !mobileSortDropdownRef.current.contains(event.target as Node);

      if (isOutsideDesktop && isOutsideMobile) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let result = [...aiSearchResults];
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }
    result = result.filter((p) => p.price <= priceRange);

    // Apply Sorting
    if (sortBy === "Price Low to High") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "Price high to low") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "Latest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sortBy === "Oldest") {
      result.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, priceRange, aiSearchResults, sortBy]);

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setAiSearchResults(allProducts);
      return;
    }
    setIsAILoading(true);
    toast("AI is analyzing your request...", { icon: "🤖" });

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/search?query=${encodeURIComponent(searchQuery)}`,
      );
      const data = await res.json();

      if (data.success) {
        setAiSearchResults(data.products);
        toast.success("AI found the best matches!");
      } else {
        setAiSearchResults([]);
        toast.error("No matches found.");
      }
    } catch (error) {
      console.error("AI Search Error:", error);
      toast.error("AI Search failed.");
    } finally {
      setIsAILoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setPriceRange(10000);
    setAiSearchResults(allProducts);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] selection:bg-black selection:text-white">
      <div className="pt-16 pb-10 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-black">Collection</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight">
          The Collection.
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-24 flex flex-col lg:flex-row gap-12">
        <div className="lg:hidden border-b border-gray-200 pb-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-sm">
              {filteredProducts.length} Results
            </span>
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
          </div>

          <div className="relative" ref={mobileSortDropdownRef}>
            <button
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              className="w-full flex items-center justify-between text-sm font-medium text-black bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm"
            >
              <span className="flex items-center gap-2">
                <span className="text-gray-400 uppercase text-[10px] tracking-widest font-bold">
                  Sort By:
                </span>{" "}
                {sortBy}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isSortDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isSortDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {[
                  "Default",
                  "Latest",
                  "Oldest",
                  "Price Low to High",
                  "Price high to low",
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setIsSortDropdownOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 text-sm transition-colors ${sortBy === option ? "bg-black text-white font-bold" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside
          className={`fixed inset-0 z-50 bg-white p-6 lg:p-0 lg:relative lg:bg-transparent lg:block lg:w-64 shrink-0 transition-transform duration-300 ${isMobileFilterOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          <div className="flex justify-between items-center lg:hidden mb-8">
            <h2 className="text-xl font-medium tracking-tight">Filters</h2>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-10 lg:sticky lg:top-28">
            <div className="relative group">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-purple-500" /> AI Assistant
                Search
              </h3>
              <form onSubmit={handleAISearch} className="relative">
                <input
                  type="text"
                  placeholder="Describe what you need..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value === "") setAiSearchResults(allProducts);
                  }}
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 shadow-sm transition-all placeholder:text-gray-400"
                  disabled={isAILoading}
                />
                <button
                  type="submit"
                  disabled={isAILoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-purple-600 transition-colors"
                >
                  {isAILoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </button>
              </form>
              <p className="text-[10px] text-gray-400 mt-2 font-medium">
                Try: "Formal wear for summer office"
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                Categories
              </h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={`w-4 h-4 border flex items-center justify-center transition-colors ${selectedCategory === category ? "border-black bg-black" : "border-gray-300 group-hover:border-black"}`}
                    >
                      {selectedCategory === category && (
                        <div className="w-1.5 h-1.5 bg-white"></div>
                      )}
                    </div>
                    <input
                      type="radio"
                      name="category"
                      className="hidden"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(category)}
                    />
                    <span
                      className={`text-sm transition-colors ${selectedCategory === category ? "font-medium text-black" : "text-gray-500 group-hover:text-black"}`}
                    >
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                Max Price: ${priceRange}
              </h3>
              <input
                type="range"
                min="0"
                max="10000"
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              />
            </div>

            <button
              onClick={clearFilters}
              className="text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <div className="hidden lg:flex items-center justify-between text-sm text-gray-500 mb-8 border-b border-gray-200 pb-4">
            <div>
              Showing {filteredProducts.length} result
              {filteredProducts.length !== 1 ? "s" : ""}
            </div>

            <div className="relative" ref={desktopSortDropdownRef}>
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-2 font-medium text-black hover:opacity-70 transition-opacity"
              >
                <span className="text-gray-400 uppercase text-[10px] tracking-widest font-bold">
                  Sort By:
                </span>
                <span className="min-w-[100px] text-left">{sortBy}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${isSortDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isSortDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 shadow-2xl rounded-2xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {[
                    "Default",
                    "Latest",
                    "Oldest",
                    "Price Low to High",
                    "Price high to low",
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-3 text-sm transition-colors ${sortBy === option ? "bg-black text-white font-bold" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading || isAILoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 uppercase tracking-widest text-sm gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
              {isAILoading
                ? "AI is scanning the inventory..."
                : "Loading Collection..."}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-xl font-medium text-gray-900 mb-2">
                No pieces found.
              </p>
              <p className="text-gray-500 font-light text-sm">
                Try adjusting your filters or AI search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
              {filteredProducts.map((product) => (
                <Link
                  href={`/product/${product._id}`}
                  key={product._id}
                  className="group cursor-pointer flex flex-col h-full"
                >
                  <div className="aspect-[3/4] bg-[#f8f8f8] rounded-2xl overflow-hidden mb-5 relative">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <ShoppingBag className="h-8 w-8 mb-2 opacity-20" />
                      </div>
                    )}
                  </div>

                  {/* 🚀 NEW DETAILS & CART AREA (Bolder Typography) */}
                  <div className="flex items-start justify-between gap-4 mt-auto pt-2">
                    <div>
                      <h3 className="font-bold text-[#111111] text-base sm:text-[17px] leading-tight mb-1 line-clamp-1 group-hover:text-gray-600 transition-colors tracking-tight">
                        {product.name}
                      </h3>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          {product.originalPrice && (
                            <span className="text-gray-400 text-xs line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                          <p
                            className={`text-sm sm:text-base font-black tracking-tight ${product.isFlashSale ? "text-red-500" : "text-black"}`}
                          >
                            ${product.price}
                          </p>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">
                          {product.stock} in stock
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({ ...product, quantity: 1 });
                        toast.success("Added to bag!");
                      }}
                      className="h-9 w-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-900 hover:bg-black hover:border-black hover:text-white transition-all shrink-0"
                      title="Add to Cart"
                    >
                      <ShoppingBag className="h-[18px] w-[18px]" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
      {/* Floating Cart Button (Middle-right, always visible) */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 w-[68px] overflow-hidden rounded-l-2xl rounded-r-none border border-r-0 border-gray-300 bg-black text-white shadow-[-10px_12px_24px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-[52%] hover:shadow-[-14px_16px_30px_rgba(0,0,0,0.22)] sm:w-[90px]"
      >
        <div className="flex flex-col items-center py-2 px-1 sm:py-3.5 sm:px-1.5">
          <ShoppingBag className="h-3.5 w-3.5 mb-0.5 sm:h-4.5 sm:w-4.5 sm:mb-1" />
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-wide leading-none">
            {totalItems} Items
          </span>
        </div>
        <div className="bg-white text-black text-[9px] sm:text-[11px] font-bold px-1 py-1.5 sm:px-1.5 sm:py-2 border-t border-gray-300">
          {formatPrice(totalPrice)}
        </div>
      </button>

      {/* Side Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Close cart"
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          <aside className="absolute right-0 top-0 h-full w-[92%] sm:w-[420px] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.25)] flex flex-col border-l border-gray-200/70 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white/90 backdrop-blur-md">
              <h3 className="text-lg font-bold uppercase tracking-wide text-gray-900">
                Shopping Cart
              </h3>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-sm text-gray-500 hover:text-black flex items-center gap-1 transition-colors"
              >
                Close <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <ShoppingBag className="h-9 w-9 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">Your cart is empty.</p>
                </div>
              ) : (
                cartItems.map((item: any) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-gray-200/90 bg-white p-3.5 flex items-center gap-3 shadow-sm"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold line-clamp-1 text-gray-900">
                        {item.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => decreaseQuantity(item._id)}
                            className="px-2 py-1 hover:bg-gray-50 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-1.5 text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item._id)}
                            disabled={item.quantity >= (item.stock || 999)}
                            className="px-2 py-1 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-gray-600 font-medium">
                          x {formatPrice(item.price)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="ml-auto text-gray-400 hover:text-red-500 text-xs"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-200 p-5 bg-gradient-to-b from-[#fafafa] to-[#f3f3f3]">
              <div className="flex items-center justify-between font-bold text-lg mb-4">
                <span className="text-gray-700">Total:</span>
                <span className="text-gray-900">{formatPrice(totalPrice)}</span>
              </div>
              <Link
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold uppercase tracking-wide ${
                  cartItems.length > 0
                    ? "bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/15"
                    : "bg-gray-300 text-gray-500 pointer-events-none"
                }`}
              >
                Checkout <MoveUpRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-200" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
