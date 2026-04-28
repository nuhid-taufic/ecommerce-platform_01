import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] flex flex-col">
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 lg:px-8 pt-24 pb-24">
        {/* Hero Section */}
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-gray-200 bg-white px-4 py-1.5 rounded-full mb-8 inline-block shadow-sm">
            Redefining Basics
          </span>
          <h1 className="text-5xl sm:text-7xl font-medium tracking-tight mb-8 leading-tight">
            Design that <br />
            <span className="italic text-gray-400">speaks.</span>
          </h1>
        </div>

        {/* Story Content */}
        <div className="space-y-10 text-lg sm:text-xl text-gray-600 font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 ease-out fill-mode-both">
          <p>
            Curated essentials for the modern minimalist. Every piece is a
            statement of intent, crafted with an unwavering commitment to
            quality and timeless design.
          </p>
          <p>
            We started{" "}
            <strong className="font-medium text-secondary">STUDIO.</strong> with a
            simple philosophy: strip away the unnecessary and focus on what
            truly matters. In a world of fast fashion and disposable goods, we
            believe in creating pieces that endure—both in style and substance.
          </p>
          <p>
            Our journey began in a small workspace, driven by a passion for
            clean lines, neutral palettes, and materials that age beautifully.
            Today, we continue to collaborate with skilled artisans who share
            our vision, ensuring that every item bearing our name is a testament
            to exceptional craftsmanship.
          </p>
        </div>

        {/* Call to Action */}
        <div className="mt-24 pt-12 border-t border-gray-200 animate-in fade-in duration-1000 delay-300 fill-mode-both">
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest border-b-2 border-primary pb-1 hover:text-gray-500 hover:border-gray-500 transition-all group"
          >
            Explore the Collection
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>
    </div>
  );
}
