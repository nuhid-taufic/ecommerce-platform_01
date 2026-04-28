import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] py-20">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-10">
          <Link href="/" className="hover:text-secondary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-secondary">Privacy Policy</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-4">
          Privacy Policy.
        </h1>
        <p className="text-sm text-gray-500 mb-12">
          Last updated: April 20, 2026
        </p>

        <div className="space-y-8 text-gray-600 font-light leading-relaxed">
          <section>
            <h2 className="text-xl font-medium text-secondary mb-3">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us, such as when
              you create or modify your account, request on-demand services,
              contact customer support, or otherwise communicate with us. This
              information may include: name, email, phone number, postal
              address, profile picture, payment method, and other information
              you choose to provide.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-secondary mb-3">
              2. How We Use Your Information
            </h2>
            <p>
              We may use the information we collect about you to provide,
              maintain, and improve our services, such as to facilitate
              payments, send receipts, provide products and services you request
              (and send related information), develop new features, provide
              customer support to Users, develop safety features, authenticate
              users, and send product updates and administrative messages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-secondary mb-3">
              3. Sharing of Information
            </h2>
            <p>
              We may share the information we collect about you as described in
              this Statement or as described at the time of collection or
              sharing, including as follows: With third party service providers;
              in response to a request for information by a competent authority
              if we believe disclosure is in accordance with, or is otherwise
              required by, any applicable law, regulation, or legal process.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-secondary mb-3">4. Security</h2>
            <p>
              We take reasonable measures to help protect information about you
              from loss, theft, misuse and unauthorized access, disclosure,
              alteration and destruction.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
