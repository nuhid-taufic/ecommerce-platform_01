"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  User,
  Search,
  X,
  Sparkles,
  ArrowRight,
  Menu,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
  const { user, login } = useAuthStore();
  const { items } = useCartStore();
  const cartItems = items || [];
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // AI Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories); // Show all categories
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setIsClient(true);

    // Handle Google OAuth Redirect Hydration
    if (window.location.search.includes("token=")) {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const userStr = params.get("user");

      if (token && userStr) {
        try {
          const userData = JSON.parse(decodeURIComponent(userStr));
          login(userData, token);

          // Clean up URL
          params.delete("token");
          params.delete("user");
          const newSearch = params.toString() ? `?${params.toString()}` : "";
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname + newSearch,
          );
        } catch (e) {
          console.error("Failed to parse user data from URL", e);
        }
      }
    }
  }, [login]);

  useEffect(() => {
    if (!isSearchOpen) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isSearchOpen]);

  // Smart AI Search Logic
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    const delaySearch = setTimeout(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/search?query=${encodeURIComponent(searchQuery)}`,
        );
        const data = await res.json();

        if (data.success) {
          setSearchResults(data.products);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("AI Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  if (!isClient) return null;

  const handleLoginClick = () => {
    sessionStorage.setItem("redirectUrl", pathname);
  };

  return (
    <nav className="bg-[#FAFAFA] py-5 border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between relative">
        {/* 1. Logo and Mobile Menu Toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-black hover:opacity-70 transition-opacity"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center group-hover:scale-90 transition-transform">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <span className="text-xl font-bold tracking-tighter">STUDIO.</span>
          </Link>
        </div>

        {/* 2. Dynamic Categories Navigation */}
        {!isSearchOpen && (
          <div className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-[0.15em] absolute left-1/2 -translate-x-1/2">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/shop?category=${encodeURIComponent(cat)}`}
                className={`transition-all duration-300 ${
                  pathname === "/shop" &&
                  new URLSearchParams(
                    typeof window !== "undefined" ? window.location.search : "",
                  ).get("category") === cat
                    ? "text-black scale-110"
                    : "text-gray-400 hover:text-black hover:scale-105"
                }`}
              >
                {cat}
              </Link>
            ))}
            {categories.length === 0 && (
              <Link href="/shop" className="text-gray-400 hover:text-black">
                Shop All
              </Link>
            )}
          </div>
        )}

        {/* 3. Actions (Right Side) */}
        <div className="flex items-center gap-4 sm:gap-6 ml-auto">
          {/* Store Link */}
          <Link
            href="/shop"
            className={`text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors hidden sm:block ${isSearchOpen ? "sm:hidden" : ""}`}
          >
            Store
          </Link>

          {/* Inline Search System */}
          <div className="flex items-center relative">
            {/* Search Input Box */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out flex items-center ${isSearchOpen ? "w-48 sm:w-64 opacity-100 mr-2" : "w-0 opacity-0 mr-0"}`}
            >
              <input
                id="navbarSearch"
                type="text"
                placeholder="Ask AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-b border-black py-1 px-2 text-sm outline-none placeholder:text-gray-400 text-black font-medium"
                autoComplete="off"
              />
            </div>

            {/* Search Toggle Button */}
            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (!isSearchOpen)
                  setTimeout(
                    () => document.getElementById("navbarSearch")?.focus(),
                    100,
                  );
              }}
              className="text-gray-900 hover:opacity-70 transition-opacity z-10"
            >
              {isSearchOpen ? (
                <X className="h-5 w-5 stroke-[1.5]" />
              ) : (
                <Search className="h-5 w-5 stroke-[1.5]" />
              )}
            </button>

            {/* Dropdown Results Box */}
            {isSearchOpen && searchQuery.length > 0 && (
              <div className="absolute top-[150%] right-0 w-[calc(100vw-48px)] sm:w-[400px] bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50">
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                  {isSearching ? (
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest py-8 animate-pulse">
                      <Sparkles className="h-4 w-4" /> AI is thinking...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-2">
                        Top Matches
                      </p>
                      {searchResults.map((product) => (
                        <Link
                          key={product._id}
                          href={`/shop/${product._id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200"></div>
                              )}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-black group-hover:text-gray-600 transition-colors line-clamp-1">
                                {product.name}
                              </h4>
                              <p className="text-[10px] text-gray-400 capitalize">
                                {product.category || "Premium Item"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 pl-2">
                            <span className="text-sm font-medium">
                              ${product.price}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : searchQuery.length > 2 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500 font-medium">
                        No results found
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Try describing it differently.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-gray-400">
                      Type at least 2 characters...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart Option */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-gray-500 transition-colors"
          >
            <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
            <span className="hidden sm:inline">Cart</span>
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </Link>

          {/* Account / Login Icon */}
          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black hover:text-gray-500 transition-colors"
            >
              <User className="h-5 w-5 stroke-[1.5]" />
              <span className="hidden sm:inline">
                {user.name?.split(" ")[0]}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={handleLoginClick}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
            >
              <User className="h-5 w-5 stroke-[1.5]" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl z-40 py-8 px-8 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">Categories</p>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/shop?category=${encodeURIComponent(cat)}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-bold uppercase tracking-tight text-black hover:text-gray-500"
            >
              {cat}
            </Link>
          ))}
          <div className="pt-6 border-t border-gray-50 mt-2 flex flex-col gap-4">
             <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-gray-400">View All Collection</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
