"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, ArrowRight, MapPin, Mail, Phone } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tickets/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Message sent successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        toast.error("Failed to send message.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111]">
      <div className="pt-16 pb-10 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-black">Contact</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pb-32">
        {/* Header Section */}
        <div className="mb-16">
          <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tighter leading-[1.1]">
            Let's start a <br />
            <span className="italic font-serif text-gray-400 font-medium">
              conversation.
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
          {/* Left Info Column */}
          <div className="lg:col-span-4 space-y-12 pr-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-900 mb-4">
                <MapPin className="h-4 w-4" /> Studio Location
              </div>
              <p className="text-gray-500 font-light leading-relaxed">
                124 Editorial Avenue
                <br />
                Design District, NY 10012
                <br />
                United States
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-900 mb-4">
                <Mail className="h-4 w-4" /> General Inquiries
              </div>
              <a
                href="mailto:hello@studio.com"
                className="text-gray-500 font-light hover:text-black transition-colors"
              >
                hello@studio.com
              </a>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-900 mb-4">
                <Phone className="h-4 w-4" /> Phone Support
              </div>
              <p className="text-gray-500 font-light mb-2">+1 (555) 123-4567</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Mon-Fri, 9am - 6pm EST
              </p>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full bg-transparent border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-black transition-colors peer placeholder-transparent"
                      placeholder="First Name"
                    />
                    <label className="absolute left-0 -top-3.5 text-xs text-gray-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-black">
                      First Name
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full bg-transparent border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-black transition-colors peer placeholder-transparent"
                      placeholder="Last Name"
                    />
                    <label className="absolute left-0 -top-3.5 text-xs text-gray-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-black">
                      Last Name
                    </label>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-transparent border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-black transition-colors peer placeholder-transparent"
                    placeholder="Email Address"
                  />
                  <label className="absolute left-0 -top-3.5 text-xs text-gray-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-black">
                    Email Address
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full bg-transparent border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-black transition-colors peer placeholder-transparent"
                    placeholder="Subject"
                  />
                  <label className="absolute left-0 -top-3.5 text-xs text-gray-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-black">
                    Subject
                  </label>
                </div>

                <div className="relative pt-2">
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full bg-transparent border-b border-gray-200 py-3 text-sm focus:outline-none focus:border-black transition-colors resize-none peer placeholder-transparent"
                    placeholder="Your Message"
                  ></textarea>
                  <label className="absolute left-0 -top-3.5 text-xs text-gray-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-black">
                    Your Message
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-black text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-gray-800 transition-all disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Message"}
                    {!loading && <ArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
