import React from "react";
import Link from "next/link";
import { ChevronRight, Truck, RotateCcw } from "lucide-react";

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] py-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-10">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-black">Shipping & Returns</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-16">
          Shipping & Returns.
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Shipping Info Box */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <Truck className="h-8 w-8 text-black mb-6" />
            <h2 className="text-xl font-medium text-black mb-4">
              Shipping Policy
            </h2>
            <ul className="space-y-4 text-sm text-gray-500 font-light">
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span>Standard Shipping (3-5 days)</span>
                <span className="font-medium text-black">Free</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span>Express Shipping (1-2 days)</span>
                <span className="font-medium text-black">৳150.00</span>
              </li>
              <li className="flex justify-between pb-2">
                <span>International (7-14 days)</span>
                <span className="font-medium text-black">৳250.00</span>
              </li>
            </ul>
            <p className="text-xs text-gray-400 mt-6 mt-4">
              Orders are processed within 24 hours. Tracking information will be
              emailed once dispatched.
            </p>
          </div>

          {/* Returns Info Box */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <RotateCcw className="h-8 w-8 text-black mb-6" />
            <h2 className="text-xl font-medium text-black mb-4">
              Return Policy
            </h2>
            <p className="text-sm text-gray-500 font-light leading-relaxed mb-4">
              We accept returns within 30 days of delivery for a full refund or
              exchange. Items must be in their original, unworn condition with
              all tags attached.
            </p>
            <ul className="space-y-2 text-sm text-gray-500 font-light list-disc pl-4">
              <li>Final sale items cannot be returned.</li>
              <li>
                Return shipping costs are the responsibility of the customer.
              </li>
              <li>
                Refunds are processed within 5-7 business days of receipt.
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center p-8 bg-gray-100 rounded-2xl">
          <h3 className="font-medium text-black mb-2">
            Need help with an order?
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Our customer service team is available 24/7 to assist you.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-black text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
