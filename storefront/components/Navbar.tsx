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
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";

export default function Navbar() {
  const { user, login } = useAuthStore();
  const { items } = useCartStore();
  const { settings, fetchSettings } = useSettingsStore();
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
    fetchSettings();
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

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isClient) return null;

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Announcement Bar */}
      {settings?.showAnnouncement && (
        <div className="bg-primary text-white py-2 px-4 sm:px-6 text-center border-b border-white/10 overflow-hidden">
          <Link 
            href={settings.announcementLink || "#"} 
            className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] hover:opacity-80 transition-opacity block truncate"
          >
            {settings.announcementText}
          </Link>
        </div>
      )}

      {/* Main Navbar */}
      <nav 
        className={`transition-all duration-300 ${
          scrolled 
            ? "bg-white/95 backdrop-blur-md border-b border-gray-100 py-1.5 sm:py-2" 
            : "bg-white py-3 sm:py-4"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between gap-4 h-10 sm:h-12">
            {/* Left: Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
                {settings?.logoUrl && !settings.logoUrl.startsWith("blob:") ? (
                  <img 
                    src={settings.logoUrl} 
                    alt={settings.storeName || "Logo"} 
                    className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                  </div>
                )}
                <span className="text-base sm:text-xl font-black tracking-tighter uppercase text-gray-900 whitespace-nowrap">
                  {settings?.storeName || "STUDIO."}
                </span>
              </Link>
            </div>

            {/* Center: Search & Navigation (Desktop Only) */}
            <div className="hidden lg:flex flex-1 items-center justify-center gap-12">
              <div className="w-full max-w-[280px] relative">
                <div className="relative group flex items-center">
                  <Sparkles className="h-4 w-4 text-primary mr-3 animate-pulse" />
                  <input
                    type="text"
                    placeholder="Ask AI Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full bg-transparent border-b-2 border-gray-100 py-1.5 pr-8 text-[14px] font-black text-gray-900 placeholder:text-gray-300 focus:border-primary transition-all outline-none"
                  />
                  <Search size={18} className="absolute right-0 text-gray-400" strokeWidth={2.5} />
                </div>

                {/* Desktop Search Results Dropdown */}
                {searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-4 bg-white/95 backdrop-blur-xl rounded-[24px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 max-h-[400px] overflow-y-auto no-scrollbar">
                      {isSearching ? (
                        <div className="py-8 text-center">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">AI Scanning...</p>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 px-2">Top Suggestions</p>
                          {searchResults.map((product) => (
                            <Link
                              key={product._id}
                              href={`/product/${product._id}`}
                              onClick={() => {
                                setSearchQuery("");
                                setSearchResults([]);
                              }}
                              className="flex items-center gap-4 p-2.5 hover:bg-gray-50 rounded-2xl transition-all group"
                            >
                              <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={product.name} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-gray-900 truncate tracking-tight">{product.name}</p>
                                <p className="text-[11px] text-gray-400 font-black tracking-tight">${product.price}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-sm font-bold text-gray-900">No results found</p>
                          <p className="text-xs text-gray-400 mt-1">Try a different keyword</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-10">
                <Link href="/shop" className="text-[14px] font-black uppercase tracking-[0.2em] text-gray-900 hover:text-primary transition-all">
                  Store
                </Link>
                {categories.slice(0, 6).map((cat) => (
                  <Link
                    key={cat}
                    href={`/shop?category=${encodeURIComponent(cat)}`}
                    className="text-[14px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-all whitespace-nowrap"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Actions (Mobile Optimized) */}
            <div className="flex items-center gap-2 sm:gap-6 ml-auto lg:ml-0">
              {/* Mobile Search Icon */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden text-gray-900 p-2 hover:bg-gray-50 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search size={22} strokeWidth={2.5} />
              </button>

              <Link 
                href="/cart" 
                className="group relative p-2 transition-all hover:-translate-y-0.5 active:scale-90" 
                aria-label="Cart"
              >
                 <div className="relative">
                   <ShoppingBag 
                     size={24} 
                     strokeWidth={2} 
                     className="text-gray-900 group-hover:text-primary transition-colors" 
                   />
                   {cartItems.length > 0 && (
                     <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-white animate-in zoom-in duration-300">
                       {cartItems.length}
                     </span>
                   )}
                 </div>
              </Link>

              {user ? (
                 <Link href="/profile" className="hidden sm:block w-9 h-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden hover:border-primary transition-all">
                   {user.image ? <img src={user.image} className="w-full h-full object-cover" /> : <User size={18} className="m-2 text-gray-400" />}
                 </Link>
              ) : (
                <div className="hidden sm:block">
                  <Link 
                    href="/login" 
                    className="bg-gray-900 text-white text-[11px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-full hover:bg-primary transition-all whitespace-nowrap"
                  >
                    Log in
                  </Link>
                </div>
              )}
              
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-gray-900 p-2 hover:bg-gray-50 rounded-full transition-colors"
                aria-label="Menu"
              >
                <Menu size={26} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-white z-[70] p-6 animate-in fade-in slide-in-from-top-4 duration-300">
           <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-primary">AI Powered Search</span>
              <button onClick={() => setIsSearchOpen(false)} className="p-2"><X size={28} /></button>
           </div>
           <div className="relative border-b-2 border-gray-900 pb-4">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-2xl font-black placeholder:text-gray-200 outline-none bg-transparent"
                autoFocus
              />
              <Sparkles className="absolute right-0 top-1 text-primary h-6 w-6" />
           </div>
           
           {searchQuery.length > 0 && (
             <div className="mt-8 overflow-y-auto max-h-[60vh] space-y-4">
                {isSearching ? (
                  <div className="py-12 text-center text-gray-300 animate-pulse text-xs font-bold">Scanning...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(product => (
                    <Link key={product._id} href={`/shop/${product._id}`} onClick={() => setIsSearchOpen(false)} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-xl">
                       <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0"><img src={product.image} className="w-full h-full object-cover" /></div>
                       <div>
                          <p className="font-black text-sm">{product.name}</p>
                          <p className="text-xs text-gray-400 font-bold">${product.price}</p>
                       </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-12 text-center text-gray-400 text-sm">No results for "{searchQuery}"</div>
                )}
             </div>
           )}
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-[60] py-10 px-8 flex flex-col gap-10 animate-in slide-in-from-right-full duration-300 overflow-y-auto">
           <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-black uppercase tracking-tighter text-gray-900">{settings?.storeName}</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-full"><X size={28} /></button>
           </div>
           
           <div className="flex flex-col gap-8">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border-b border-gray-100 pb-2">Navigation</p>
              <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black uppercase tracking-tighter hover:text-primary transition-colors">Store</Link>
              {categories.map(cat => (
                <Link key={cat} href={`/shop?category=${encodeURIComponent(cat)}`} onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-black uppercase tracking-tighter text-gray-300 hover:text-gray-900 transition-colors">{cat}</Link>
              ))}
           </div>

           <div className="mt-auto pt-10 border-t border-gray-100 flex flex-col gap-6">
              {!user ? (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="bg-gray-900 text-white py-5 rounded-2xl text-center text-sm font-black uppercase tracking-widest shadow-xl shadow-black/10">Log in / Join</Link>
              ) : (
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="bg-gray-50 py-5 rounded-2xl text-center text-sm font-black uppercase tracking-widest text-gray-900">My Account</Link>
              )}
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-center text-xs font-black uppercase tracking-widest text-gray-400">Customer Support</Link>
           </div>
        </div>
      )}
    </header>
  );
}
