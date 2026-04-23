"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ShoppingBag,
  MoveUpRight,
  Sparkles,
  Heart,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCartStore } from "../store/cartStore.js";
import { useWishlistStore } from "../store/wishlistStore.js";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [bentoBoxData, setBentoBoxData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } =
    useWishlistStore();

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products`,
        );
        const productsData = await productsRes.json();

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

        if (productsRes.ok && productsData.success) {
          let allProducts = productsData.products
            .filter((p: any) => p.stock > 0)
            .reverse();

          // Apply flash sale prices
          allProducts = allProducts.map((p: any) => {
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

          setProducts(allProducts.slice(0, 8));

          const flashSaleItems = allProducts.filter((p: any) => p.isFlashSale);
          const featured = allProducts.filter((p: any) => p.isFeaturedHero);

          let sliderItems = [...flashSaleItems, ...featured];
          if (sliderItems.length === 0) sliderItems = allProducts;

          // Remove duplicates
          sliderItems = Array.from(
            new Map(sliderItems.map((item: any) => [item._id, item])).values(),
          );

          setHeroSlides(sliderItems.slice(0, 4));
        }

        const settingsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/home-settings`,
        );
        const settingsData = await settingsRes.json();

        if (settingsRes.ok && settingsData.success) {
          setBentoBoxData(settingsData.settings?.bentoBox || []);
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] selection:bg-black selection:text-white overflow-hidden">
      {/* Infinite Marquee Banner */}
      <div className="border-b border-gray-200 bg-white overflow-hidden py-3 flex whitespace-nowrap relative z-20">
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .animate-scroll { animation: scroll 25s linear infinite; }
          `,
          }}
        />
        <div className="animate-scroll flex gap-12 items-center uppercase tracking-[0.2em] text-[10px] font-bold text-gray-400">
          <span>Cosmetics</span>{" "}
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
          <span>Electronics</span>{" "}
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
          <span>Clothing</span>{" "}
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
          <span>Accessories</span>{" "}
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
          <span>Minimalist Design</span>{" "}
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
          <span>Premium Quality</span>{" "}
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
          <span>Cosmetics</span>{" "}
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
          <span>Electronics</span>{" "}
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
          <span>Clothing</span>{" "}
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
          <span>Accessories</span>{" "}
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
          <span>Minimalist Design</span>{" "}
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
          <span>Premium Quality</span>{" "}
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
        </div>
      </div>

      {/* Synchronized Real-Product Hero Section */}
      <section className="relative pt-12 pb-12 lg:pt-20 lg:pb-16 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 z-10 w-full relative h-[350px] sm:h-[400px]">
          {heroSlides.map((slide, index) => {
            const words = slide.name.split(" ");
            const firstWord = words[0];
            const restWords = words.slice(1).join(" ") || "Edition.";

            return (
              <div
                key={slide._id}
                className={`absolute inset-0 flex flex-col justify-center transition-opacity duration-1000 ease-in-out ${currentSlide === index ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"}`}
              >
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${slide.isFlashSale ? "border-red-200 bg-red-50 text-red-500" : "border-gray-200 bg-white"} text-xs font-medium uppercase tracking-widest mb-8 w-fit`}
                >
                  <Sparkles className="h-3 w-3" />{" "}
                  {slide.isFlashSale
                    ? "⚡ FLASH SALE"
                    : slide.category || "Featured"}
                </div>

                <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-medium leading-[1.1] tracking-tighter mb-8">
                  {firstWord} <br />
                  <span className="text-gray-400 italic font-serif capitalize">
                    {restWords}
                  </span>
                </h1>

                <p className="text-lg text-gray-500 max-w-md mb-10 leading-relaxed font-light line-clamp-3">
                  {slide.description ||
                    "Curated essentials for the modern minimalist. Premium quality guaranteed."}
                </p>

                <div className="flex items-center gap-6">
                  <Link
                    href={`/shop/${slide._id}`}
                    className="group inline-flex items-center gap-4 text-sm font-medium uppercase tracking-widest"
                  >
                    <span className="w-12 h-[1px] bg-black group-hover:w-20 transition-all duration-500 ease-out"></span>
                    Explore Details
                  </Link>
                  <div className="flex items-center gap-3">
                    {slide.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ${slide.originalPrice}
                      </span>
                    )}
                    <span
                      className={`text-lg font-medium ${slide.isFlashSale ? "text-red-500 font-bold" : ""}`}
                    >
                      ${slide.price}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex-1 w-full relative">
          <div className="aspect-[4/5] sm:aspect-square lg:aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden relative group shadow-2xl shadow-black/5">
            {heroSlides.length > 0 ? (
              heroSlides.map((slide, index) => (
                <div
                  key={slide._id}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                >
                  <img
                    src={
                      slide.image ||
                      "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=1000"
                    }
                    alt={slide.name}
                    className="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
                  />
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 uppercase text-xs tracking-widest font-bold">
                No Products Found
              </div>
            )}

            {heroSlides.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20 bg-white/80 backdrop-blur-md px-3 py-2 rounded-full opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${currentSlide === index ? "w-5 bg-black" : "bg-gray-400 hover:bg-gray-600"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic Bento Box Categories */}
      <section className="py-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <h2 className="text-4xl font-medium tracking-tighter leading-tight">
            Curated <br />{" "}
            <span className="text-gray-400 italic font-serif">Categories.</span>
          </h2>
          <p className="text-gray-500 max-w-sm font-light">
            Explore our carefully selected ranges, designed to seamlessly
            integrate into your professional life.
          </p>
        </div>

        <div className="space-y-4">
          {Array.from({
            length: Math.ceil((bentoBoxData.length || 3) / 3),
          }).map((_, rowIndex) => {
            const items =
              bentoBoxData.length > 0
                ? bentoBoxData.slice(rowIndex * 3, rowIndex * 3 + 3)
                : [
                    {
                      title: "Workspace",
                      imageUrls: [
                        "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=1000",
                      ],
                      linkTo: "/shop",
                    },
                    {
                      title: "Tech Accs.",
                      imageUrls: [
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500",
                      ],
                      linkTo: "/shop",
                    },
                    { title: "New Arrivals", imageUrls: [""], linkTo: "/shop" },
                  ].slice(rowIndex * 3, rowIndex * 3 + 3);

            if (items.length === 0) return null;
            const isEvenRow = rowIndex % 2 === 0;

            if (items.length === 1) {
              return (
                <div key={rowIndex} className="h-[300px] sm:h-[400px] mb-4">
                  <CategorySliderCard
                    data={items[0]}
                    className="h-full w-full bg-gray-100"
                    type="large"
                  />
                </div>
              );
            }
            if (items.length === 2) {
              return (
                <div
                  key={rowIndex}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] sm:h-[400px] mb-4"
                >
                  <CategorySliderCard
                    data={items[0]}
                    className="h-full bg-gray-100"
                    type="large"
                  />
                  <CategorySliderCard
                    data={items[1]}
                    className="h-full bg-gray-200"
                    type="large"
                  />
                </div>
              );
            }
            return (
              <div
                key={rowIndex}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[600px] mb-4"
              >
                {isEvenRow ? (
                  <>
                    <CategorySliderCard
                      data={items[0]}
                      className="md:col-span-2 h-[400px] md:h-full bg-gray-100"
                      type="large"
                    />
                    <div className="grid grid-rows-2 gap-4 h-[600px] md:h-full">
                      <CategorySliderCard
                        data={items[1]}
                        className="h-full bg-gray-200"
                        type="small-top"
                      />
                      <CategorySliderCard
                        data={items[2]}
                        className={`h-full ${items[2].imageUrls?.[0] ? "" : "bg-[#111]"}`}
                        type="small-bottom"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-rows-2 gap-4 h-[600px] md:h-full order-2 md:order-1">
                      <CategorySliderCard
                        data={items[0]}
                        className="h-full bg-gray-200"
                        type="small-top"
                      />
                      <CategorySliderCard
                        data={items[1]}
                        className={`h-full ${items[1].imageUrls?.[0] ? "" : "bg-[#111]"}`}
                        type="small-bottom"
                      />
                    </div>
                    <CategorySliderCard
                      data={items[2]}
                      className="md:col-span-2 h-[400px] md:h-full bg-gray-100 order-1 md:order-2"
                      type="large"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Minimalist Product Grid (UPDATED TYPOGRAPHY) */}
      <section className="pb-32 pt-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12 border-b border-gray-200 pb-6">
          <h2 className="text-2xl font-medium tracking-tight">Latest Pieces</h2>
          <Link
            href="/shop"
            className="text-sm font-medium uppercase tracking-widest hover:text-gray-500 transition-colors"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400 uppercase tracking-widest text-sm">
            Loading Collection...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {products.map((product) => (
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

                {/* 🚀 NEW Details & Cart Icon Area with BOLDER Fonts */}
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

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (isInWishlist(product._id)) {
                          removeFromWishlist(product._id);
                          toast.success("Removed from wishlist");
                        } else {
                          addToWishlist(product);
                          toast.success("Added to wishlist");
                        }
                      }}
                      className={`h-9 w-9 rounded-full border border-gray-200 shadow-sm flex items-center justify-center transition-all shrink-0 ${
                        isInWishlist(product._id)
                          ? "bg-red-50 text-red-500 border-red-200"
                          : "bg-white text-gray-900 hover:bg-gray-50"
                      }`}
                      title="Wishlist"
                    >
                      <Heart
                        className={`h-[18px] w-[18px] ${isInWishlist(product._id) ? "fill-current" : ""}`}
                      />
                    </button>
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      {/* Big Typography Footer */}
      <footer className="bg-black text-white pt-32 pb-10 px-6 lg:px-8 rounded-t-[2.5rem] mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-[12vw] sm:text-[8rem] font-bold tracking-tighter leading-none mb-10 opacity-90">
            STUDIO.
          </h2>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 text-left border-t border-white/10 pt-16 mt-10">
            <div className="md:col-span-1">
              <p className="text-sm text-gray-400 font-light max-w-xs leading-relaxed">
                Curating the finest essentials for design-conscious individuals
                worldwide.
              </p>
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <span className="uppercase tracking-widest text-xs text-gray-500 mb-2 font-bold">
                Navigation
              </span>
              <Link
                href="/shop"
                className="hover:text-gray-300 transition-colors"
              >
                Shop All
              </Link>
              <Link
                href="/about"
                className="hover:text-gray-300 transition-colors"
              >
                Our Story
              </Link>
              <Link
                href="/contact"
                className="hover:text-gray-300 transition-colors"
              >
                Contact
              </Link>
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <span className="uppercase tracking-widest text-xs text-gray-500 mb-2 font-bold">
                Legal
              </span>
              <Link
                href="/privacy"
                className="hover:text-gray-300 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-gray-300 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/shipping-returns"
                className="hover:text-gray-300 transition-colors"
              >
                Shipping Returns
              </Link>
            </div>

            {/* Support Section */}
            <div className="flex flex-col gap-3 text-sm">
              <span className="uppercase tracking-widest text-xs text-gray-500 mb-2 font-bold">
                Support
              </span>
              <button
                onClick={() => {
                  const widgetBtn =
                    document.getElementById("support-widget-btn");
                  if (widgetBtn) widgetBtn.click();
                }}
                className="text-left text-white hover:text-gray-300 transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>{" "}
                Live Chat
              </button>
              <a
                href="mailto:support@studio.com"
                className="hover:text-gray-300 transition-colors"
              >
                Email Us
              </a>
            </div>
          </div>

          <div className="w-full flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 mt-24 pt-8 border-t border-white/10">
            <p>© 2026 Studio Inc. All rights reserved.</p>
            <div className="flex gap-4 mt-4 sm:mt-0 uppercase tracking-widest">
              <Link href="#" className="hover:text-white transition-colors">
                Instagram
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Twitter
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Category Slideshow Card
function CategorySliderCard({
  data,
  className,
  type,
}: {
  data: any;
  className: string;
  type: "large" | "small-top" | "small-bottom";
}) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const images =
    data.imageUrls?.filter((url: string) => url.trim() !== "") || [];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(
      () => {
        setCurrentImgIndex((prev) => (prev + 1) % images.length);
      },
      3000 + Math.random() * 2000,
    );
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <Link
      href={data.linkTo || "/shop"}
      className={`relative rounded-2xl overflow-hidden group block ${className}`}
    >
      {images.length > 0 ? (
        images.map((url: string, index: number) => (
          <img
            key={index}
            src={url}
            alt={data.title}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out group-hover:scale-105 ${index === currentImgIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
          />
        ))
      ) : type !== "small-bottom" ? (
        <div className="absolute inset-0 w-full h-full bg-gray-200"></div>
      ) : null}

      {type === "large" && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-20 transition-opacity duration-500 group-hover:opacity-80"></div>
          <div className="absolute bottom-8 left-8 z-30">
            <p className="text-white text-3xl font-medium tracking-tight mb-2">
              {data.title}
            </p>
            <span className="inline-flex items-center gap-2 text-white/80 text-sm font-medium uppercase tracking-widest group-hover:text-white transition-colors">
              Shop Now <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </>
      )}

      {type === "small-top" && (
        <>
          <div className="absolute inset-0 bg-black/20 z-20 group-hover:bg-black/40 transition-colors duration-500"></div>
          <div className="absolute bottom-6 left-6 z-30">
            <p className="text-white text-xl font-medium tracking-tight">
              {data.title}
            </p>
          </div>
        </>
      )}

      {type === "small-bottom" && (
        <>
          {images.length > 0 && (
            <div className="absolute inset-0 bg-black/40 z-20 group-hover:bg-black/60 transition-colors duration-500"></div>
          )}
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center z-30">
            <div className="text-white group-hover:-translate-y-2 transition-transform duration-500">
              <Sparkles className="h-8 w-8 mb-4 mx-auto opacity-50" />
              <p className="text-xl font-medium tracking-tight mb-2">
                {data.title}
              </p>
              <span className="text-white/50 text-xs uppercase tracking-widest">
                Discover
              </span>
            </div>
          </div>
        </>
      )}
    </Link>
  );
}
