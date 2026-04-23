"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, useParams } from "next/navigation";

export default function JournalArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/journal/${slug}`,
        );
        const data = await res.json();
        if (res.ok && data.success) {
          setArticle(data.journal);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error("Failed to fetch article:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !article) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] selection:bg-black selection:text-white">
      <main className="max-w-4xl mx-auto px-6 lg:px-8 pt-12 pb-24">
        {/* Back Button */}
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-16"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Journal
        </Link>

        {/* Article Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">
            <span className="text-black">{article.category}</span>
            <span>•</span>
            <span>
              {new Date(article.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-8 leading-tight">
            {article.title}
          </h1>
        </header>

        {/* Hero Image */}
        {article.image && (
          <div className="aspect-[16/9] w-full bg-gray-100 rounded-2xl overflow-hidden mb-16">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-lg prose-p:font-light prose-p:text-gray-600 prose-p:leading-relaxed prose-headings:font-medium prose-headings:tracking-tight prose-a:text-black max-w-none mx-auto">
          {/* Excerpt as introductory paragraph */}
          <p className="text-xl md:text-2xl font-light text-gray-500 leading-relaxed mb-12">
            {article.excerpt}
          </p>

          {/* Render raw HTML content */}
          <div
            dangerouslySetInnerHTML={{ __html: article.content }}
            className="space-y-6"
          />
        </article>

        {/* Article Footer */}
        <div className="mt-24 pt-12 border-t border-gray-200 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
            Share this article
          </p>
          <div className="flex justify-center gap-6">
            <button className="text-black hover:text-gray-500 transition-colors font-medium">
              Twitter
            </button>
            <button className="text-black hover:text-gray-500 transition-colors font-medium">
              LinkedIn
            </button>
            <button className="text-black hover:text-gray-500 transition-colors font-medium">
              Facebook
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6 lg:px-8 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
        <p>© 2026 Studio Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
