"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function JournalPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Newsletter State
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/journal?status=published`,
        );
        const data = await res.json();
        if (res.ok && data.success) {
          setArticles(data.journals);
        }
      } catch (error) {
        console.error("Failed to fetch journals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJournals();
  }, []);

  const featuredArticle = articles.find((a) => a.isFeatured) || articles[0];
  const gridArticles = articles.filter((a) => a._id !== featuredArticle?._id);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    const toastId = toast.loading("Subscribing...");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message, { id: toastId });
        setEmail("");
      } else {
        toast.error(data.message || "Failed to subscribe.", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] selection:bg-primary selection:text-white flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#334155", color: "#fff", borderRadius: "8px" },
        }}
      />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 lg:px-8 pt-16 pb-24">
        {/* Page Header */}
        <div className="mb-16">
          <h1 className="text-5xl sm:text-7xl font-medium tracking-tighter mb-4">
            The{" "}
            <span className="text-gray-400 italic font-serif">Journal.</span>
          </h1>
          <p className="text-gray-500 font-light max-w-md text-lg">
            Thoughts, stories, and ideas on design, minimalism, and intentional
            living.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-500 font-light text-lg">
              No journal articles have been published yet.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredArticle && (
              <Link
                href={`/journal/${featuredArticle.slug}`}
                className="group block mb-24 cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
                  <div className="w-full lg:w-2/3 aspect-[16/9] lg:aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative">
                    <img
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    {featuredArticle.isFeatured && (
                      <div className="absolute top-6 left-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-secondary">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="w-full lg:w-1/3">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                      <span className="text-secondary">
                        {featuredArticle.category}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(featuredArticle.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" },
                        )}
                      </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-medium tracking-tight mb-4 group-hover:text-gray-600 transition-colors leading-tight">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-gray-500 font-light leading-relaxed mb-8 text-sm sm:text-base">
                      {featuredArticle.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b border-primary pb-0.5 group-hover:text-gray-500 group-hover:border-gray-500 transition-all">
                      Read Article <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid Articles */}
            {gridArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {gridArticles.map((article) => (
                  <Link
                    href={`/journal/${article.slug}`}
                    key={article._id}
                    className="group cursor-pointer flex flex-col h-full"
                  >
                    <div className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden mb-6 relative">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div className="flex flex-col flex-grow">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                        <span className="text-secondary">{article.category}</span>
                        <span>{article.readTime}</span>
                      </div>
                      <h3 className="text-xl font-medium tracking-tight mb-3 group-hover:text-gray-600 transition-colors leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-gray-500 font-light text-sm line-clamp-2 mb-6">
                        {article.excerpt}
                      </p>
                      <div className="mt-auto">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-secondary transition-colors">
                          Read More —
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Newsletter Section */}
        <div className="mt-32 border-t border-gray-200 pt-20 pb-10 text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-medium tracking-tight mb-4">
            Stay Inspired.
          </h3>
          <p className="text-gray-500 font-light mb-8 text-sm">
            Subscribe to our newsletter to receive the latest stories, design
            inspiration, and exclusive offers directly in your inbox.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-4"
            onSubmit={handleSubscribe}
          >
            <input
              type="email"
              placeholder="Your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribing}
              className="flex-1 bg-transparent border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="bg-primary text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-colors disabled:opacity-70 flex items-center justify-center min-w-[140px]"
            >
              {subscribing ? "Wait..." : "Subscribe"}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6 lg:px-8 text-center text-xs font-bold uppercase tracking-widest text-gray-400 mt-auto">
        <p>© 2026 Studio Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
