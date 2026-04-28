"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [categories, setCategories] = useState<string[]>([]);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories.slice(0, 6));
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
        const data = await res.json();
        if (data.success) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      }
    };

    fetchCategories();
    fetchSettings();
  }, []);

  return (
    <footer className="bg-primary text-white pt-32 pb-10 px-6 lg:px-8 rounded-t-[3rem] mt-20 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-24">
          <h2 className="text-[14vw] sm:text-[10rem] font-bold tracking-tighter leading-none mb-6 opacity-90 select-none">
            {settings?.storeName?.toUpperCase() || "STUDIO."}
          </h2>
          <p className="text-gray-500 max-w-lg text-sm sm:text-base font-light leading-relaxed">
            Curating the finest essentials for design-conscious individuals worldwide. Minimalist aesthetics meets premium quality.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-16 text-left border-t border-white/10 pt-20">
          {/* 1. Our Info */}
          <div className="flex flex-col gap-5">
            <span className="uppercase tracking-[0.2em] text-[11px] text-gray-500 font-black">Our Info</span>
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <Link href="/about" className="hover:text-white transition-colors">Our Story</Link>
              <Link href="/journal" className="hover:text-white transition-colors">Journal</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              <Link href="/shop" className="hover:text-white transition-colors">All Collections</Link>
            </div>
          </div>

          {/* 2. Support */}
          <div className="flex flex-col gap-5">
            <span className="uppercase tracking-[0.2em] text-[11px] text-gray-500 font-black">Support</span>
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <button 
                onClick={() => document.getElementById("support-widget-btn")?.click()}
                className="text-left hover:text-white transition-colors flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Live Chat
              </button>
              <a href={`mailto:${settings?.contactEmail || "support@studio.com"}`} className="hover:text-white transition-colors">Email Support</a>
              {settings?.storeAddress && (
                <span className="mt-2 text-xs leading-relaxed opacity-50">{settings.storeAddress}</span>
              )}
            </div>
          </div>

          {/* 3. Policy */}
          <div className="flex flex-col gap-5">
            <span className="uppercase tracking-[0.2em] text-[11px] text-gray-500 font-black">Policy</span>
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <Link href={settings?.privacyPolicyUrl || "/privacy"} className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href={settings?.termsUrl || "/terms"} className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href={settings?.refundPolicyUrl || "/shipping-returns"} className="hover:text-white transition-colors">Shipping & Returns</Link>
            </div>
          </div>

          {/* 4. Shoped By (Categories) */}
          <div className="flex flex-col gap-5">
            <span className="uppercase tracking-[0.2em] text-[11px] text-gray-500 font-black">Shoped By</span>
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              {categories.map((cat) => (
                <Link key={cat} href={`/shop?category=${encodeURIComponent(cat)}`} className="hover:text-white transition-colors capitalize">
                  {cat}
                </Link>
              ))}
              {categories.length === 0 && <p className="italic opacity-50">Loading categories...</p>}
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row justify-between items-center text-[10px] sm:text-xs text-gray-600 mt-28 pt-8 border-t border-white/5 uppercase tracking-widest font-bold">
          <p>{settings?.footerText || `© ${new Date().getFullYear()} ${settings?.storeName || 'Studio Inc'}. Crafted with precision.`}</p>
          <div className="flex gap-8 mt-6 sm:mt-0">
            {settings?.socialLinks?.instagram && <a href={settings.socialLinks.instagram} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>}
            {settings?.socialLinks?.facebook && <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Facebook</a>}
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
