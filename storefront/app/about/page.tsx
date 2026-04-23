"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] selection:bg-black selection:text-white flex flex-col overflow-hidden">
      {/* Minimal Navbar */}

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">
            Our Story
          </p>
          <h1 className="text-5xl sm:text-7xl lg:text-[6rem] font-medium tracking-tighter leading-[1.1] mb-8">
            Crafting{" "}
            <span className="text-gray-400 italic font-serif">minimalism</span>{" "}
            <br /> for the modern era.
          </h1>
        </section>

        {/* Editorial Image Split */}
        <section className="px-6 lg:px-8 max-w-7xl mx-auto pb-24 flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 w-full">
            <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000"
                alt="Studio Architecture"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </div>
          </div>
          <div className="flex-1 w-full md:pl-10">
            <h2 className="text-3xl font-medium tracking-tight mb-6">
              Intentional Design.
            </h2>
            <p className="text-gray-500 font-light leading-relaxed mb-6 text-lg">
              Founded in 2026, STUDIO was born from a desire to strip away the
              unnecessary. We believe that true luxury lies in simplicity,
              quality materials, and meticulous craftsmanship.
            </p>
            <p className="text-gray-500 font-light leading-relaxed mb-10 text-lg">
              Every piece in our collection is thoughtfully designed to serve a
              purpose while elevating your everyday experience. No loud logos,
              no fast fashion—just timeless essentials.
            </p>
            <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-200">
              <div>
                <h3 className="text-4xl font-medium tracking-tighter mb-2">
                  100%
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Ethically Sourced
                </p>
              </div>
              <div>
                <h3 className="text-4xl font-medium tracking-tighter mb-2">
                  0%
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Compromise
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="bg-black text-white py-32 px-6 lg:px-8 text-center mt-10">
          <h2 className="text-4xl sm:text-6xl font-medium tracking-tighter mb-8">
            Experience the collection.
          </h2>
          <Link
            href="/shop"
            className="inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest group"
          >
            <span className="w-12 h-[1px] bg-white group-hover:w-20 transition-all duration-500 ease-out"></span>
            Shop Now
          </Link>
        </section>
      </main>
    </div>
  );
}
