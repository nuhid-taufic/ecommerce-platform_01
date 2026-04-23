import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] py-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-10">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-black">Terms of Service</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-4">
          Terms of Service.
        </h1>
        <p className="text-sm text-gray-500 mb-12">
          Last updated: April 20, 2026
        </p>

        <div className="space-y-8 text-gray-600 font-light leading-relaxed">
          <section>
            <h2 className="text-xl font-medium text-black mb-3">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using our Website, you agree to be bound by these
              Terms and all applicable laws and regulations. If you do not agree
              with any part of these terms, you may not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-black mb-3">
              2. Intellectual Property
            </h2>
            <p>
              The Service and its original content, features, and functionality
              are and will remain the exclusive property of STUDIO Inc. and its
              licensors. The Service is protected by copyright, trademark, and
              other laws of both the local and foreign countries.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-black mb-3">
              3. Products and Pricing
            </h2>
            <p>
              All products listed on the website are subject to availability. We
              reserve the right to discontinue any product at any time. Prices
              for all products are subject to change without notice. We shall
              not be liable to you or to any third party for any modification,
              price change, suspension, or discontinuance of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-black mb-3">
              4. Limitation of Liability
            </h2>
            <p>
              In no event shall STUDIO Inc., nor its directors, employees,
              partners, agents, suppliers, or affiliates, be liable for any
              indirect, incidental, special, consequential or punitive damages,
              including without limitation, loss of profits, data, use,
              goodwill, or other intangible losses, resulting from your access
              to or use of or inability to access or use the Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
