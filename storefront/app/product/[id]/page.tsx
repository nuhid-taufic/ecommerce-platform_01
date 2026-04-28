"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  ChevronRight,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  ChevronDown,
  Sparkles,
  MessageCircle,
  Phone,
  Star,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "../../../store/cartStore.js";
import { useAuthStore } from "../../../store/authStore.js";

export default function ProductDetailsPage() {
  const params = useParams();
  const productId = params.id;

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [quantity, setQuantity] = useState(1);
  const { addToCart, items = [], getTotalPrice } = useCartStore();
  const { user, token } = useAuthStore();
  const totalPrice = typeof getTotalPrice === 'function' ? getTotalPrice() : 0;
  const [activeAccordion, setActiveAccordion] = useState<string | null>(
    "details",
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const DUMMY_PHONE = "+880 1711 000 000";

  // Calculate Rating Stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  
  const ratingCounts = [5,4,3,2,1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === stars).length / totalReviews * 100).toFixed(0) : 0
  }));

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
        const data = await res.json();

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

        if (res.ok && data.success) {
          let foundProduct = data.products.find(
            (p: any) => p._id === productId,
          );

          if (foundProduct && flashSaleMap.has(foundProduct._id)) {
            foundProduct = {
              ...foundProduct,
              originalPrice: foundProduct.price,
              price: flashSaleMap.get(foundProduct._id),
              isFlashSale: true,
            };
          }

          setProduct(foundProduct);

          let related = data.products
            .filter(
              (p: any) =>
                p.category === foundProduct?.category &&
                p._id !== productId &&
                p.stock > 0,
            )
            .slice(0, 4);

          if (related.length === 0) {
            related = data.products
              .filter((p: any) => p._id !== productId && p.stock > 0)
              .slice(0, 4);
          }

          related = related.map((p: any) => {
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

          setRelatedProducts(related);
        }
      } catch (error) {
        console.error("Failed to load product details", error);
        toast.error("Could not load product.");
      } finally {
        setLoading(false);
      }
    };
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/product/${productId}`);
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (data.success) setReviews(data.reviews);
        }
      } catch (err) { console.error("Failed to load reviews", err); }
    };

    if (productId) {
      fetchProductData();
      fetchReviews();
    }
  }, [productId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      toast.error("Please login to submit a review");
      return;
    }
    if (!reviewForm.comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Review submitted! It will appear once approved.");
        setReviewForm({ rating: 5, comment: "" });
        // Optionally add to list if auto-approved
        if (data.review.isApproved) setReviews([data.review, ...reviews]);
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ ...product, quantity: quantity });
    toast.success(`Added ${quantity} item(s) to your bag!`);
  };

  const toggleAccordion = (section: string) =>
    setActiveAccordion(activeAccordion === section ? null : section);

  if (loading)
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="animate-pulse text-xs font-bold uppercase tracking-widest text-gray-400">
          Loading details...
        </div>
      </div>
    );
  if (!product)
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-medium">Product Not Found</h1>
        <Link
          href="/shop"
          className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-500 transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] selection:bg-black selection:text-white pb-32">

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="hover:text-black transition-colors">
            Collection
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-black line-clamp-1 max-w-[200px]">
            {product.name}
          </span>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-24 lg:pt-8 flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Left: Image Gallery & Main Image */}
        <div className="w-full lg:w-3/5 flex flex-col sm:flex-row gap-4">
          {/* Thumbnails Sidebar */}
          <div className="flex sm:flex-col gap-3 order-2 sm:order-1 overflow-x-auto sm:overflow-y-auto sm:max-h-[600px] scrollbar-hide pb-2 sm:pb-0">
            {/* Primary Image Thumbnail */}
            <button
              onClick={() => setActiveImageIndex(0)}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeImageIndex === 0 ? "border-[#FF8A00]" : "border-gray-100 opacity-60 hover:opacity-100"}`}
            >
              <img src={product.image} className="w-full h-full object-cover" alt="thumbnail 0" />
            </button>
            {/* Additional Image Thumbnails */}
            {product.images?.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx + 1)}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeImageIndex === idx + 1 ? "border-[#FF8A00]" : "border-gray-100 opacity-60 hover:opacity-100"}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`thumbnail ${idx + 1}`} />
              </button>
            ))}
          </div>

          {/* Main Image Viewer */}
          <div className="flex-1 order-1 sm:order-2">
            <div className="aspect-square bg-white border border-gray-100 rounded-3xl overflow-hidden relative group shadow-sm">
              <img
                src={activeImageIndex === 0 ? product.image : product.images[activeImageIndex - 1]}
                alt={product.name}
                className="w-full h-full object-contain p-8"
              />
              
              {/* Navigation Arrows */}
              <button 
                onClick={() => setActiveImageIndex(prev => Math.max(0, prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-lg flex items-center justify-center text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setActiveImageIndex(prev => Math.min((product.images?.length || 0), prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-lg flex items-center justify-center text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Product Info & CTAs */}
        <div className="w-full lg:w-2/5">
          <div className="flex items-center gap-2 mb-4">
             <div className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-500">
               {product.category}
             </div>
             {product.isFlashSale && (
                <div className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-100 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Flash Sale
                </div>
             )}
          </div>

          <h1 className="text-4xl font-bold text-[#111111] mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center text-[#FF8A00]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(averageRating)) ? "fill-current" : "text-gray-200"}`} />
              ))}
              <span className="text-gray-400 text-xs ml-2 uppercase font-bold tracking-widest">({totalReviews} Reviews)</span>
              <span className="mx-3 text-gray-200">|</span>
              <span className="text-gray-400 text-[10px] uppercase font-black tracking-widest">{product.totalSold || 0} SOLD</span>
              <span className="mx-3 text-gray-200">|</span>
              <span className="text-gray-300 text-[10px] font-mono tracking-widest">#{product.productId || 'N/A'}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 mb-8">
            <span className={`text-4xl font-black ${product.isFlashSale ? "text-red-500" : "text-[#FF8A00]"}`}>
              ৳{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xl text-gray-300 line-through">৳{product.originalPrice}</span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-6 mb-10">
            <span className="text-sm font-bold uppercase tracking-widest text-gray-500">Quantity:</span>
            <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input 
                type="text" 
                value={quantity} 
                readOnly 
                className="w-12 text-center text-lg font-bold outline-none bg-transparent"
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleAddToCart}
              className="bg-[#FF8A00] text-white py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#e67c00] transition-all shadow-lg shadow-orange-500/20"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Cart
            </button>
            <Link
              href="/checkout"
              className="bg-[#0D1D1C] text-white py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/10"
            >
              Buy Now
            </Link>
            <a
              href={`https://wa.me/${DUMMY_PHONE.replace(/\s+/g, "")}`}
              target="_blank"
              className="bg-[#25D366] text-white py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#1ebe57] transition-all shadow-lg shadow-green-500/20"
            >
              <MessageCircle className="w-4 h-4" /> Order on WhatsApp
            </a>
            <a
              href={`tel:${DUMMY_PHONE.replace(/\s+/g, "")}`}
              className="bg-[#2B4593] text-white py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#233a7d] transition-all shadow-lg shadow-blue-500/20"
            >
              <Phone className="w-4 h-4" /> Call for Order
            </a>
          </div>

          {/* Trust Badges */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-6 mb-10">
             <div className="flex items-center gap-3">
                <Truck className="w-8 h-8 text-[#FF8A00] opacity-20" />
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Fast Delivery</p>
                   <p className="text-[9px] text-gray-400">Dhaka in 24h, Outside 72h</p>
                </div>
             </div>
             <div className="w-[1px] h-10 bg-gray-100"></div>
             <div className="flex items-center gap-3">
                <RotateCcw className="w-8 h-8 text-[#FF8A00] opacity-20" />
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Easy Returns</p>
                   <p className="text-[9px] text-gray-400">7 Days return policy</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Tabs / Details Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
        <div className="border-t border-gray-100 pt-16">
          <div className="flex gap-12 mb-12 border-b border-gray-100 pb-4">
             <button 
               onClick={() => setActiveAccordion("details")}
               className={`text-sm font-bold uppercase tracking-[0.2em] relative ${activeAccordion === "details" ? "text-black" : "text-gray-300"}`}
             >
               Product Details
               {activeAccordion === "details" && <div className="absolute -bottom-[17px] left-0 w-full h-[3px] bg-[#FF8A00]"></div>}
             </button>
             <button 
               onClick={() => setActiveAccordion("reviews")}
               className={`text-sm font-bold uppercase tracking-[0.2em] relative ${activeAccordion === "reviews" ? "text-black" : "text-gray-300"}`}
             >
               Reviews ({totalReviews})
               {activeAccordion === "reviews" && <div className="absolute -bottom-[17px] left-0 w-full h-[3px] bg-[#FF8A00]"></div>}
             </button>
          </div>

          {activeAccordion === "details" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="lg:col-span-2">
                  <h3 className="text-xl font-bold mb-6">Overview</h3>
                  <p className="text-gray-500 font-light leading-relaxed mb-8">
                    {product.description}
                  </p>
               </div>
               <div className="lg:col-span-1">
                  <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm shadow-black/[0.02]">
                     <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" /> Quality Guarantee
                     </h4>
                     <p className="text-sm text-gray-600 leading-relaxed font-light">
                        Every product is sourced from verified suppliers and undergoes strict quality checks before shipping. We ensure 100% authenticity and freshness for all our items.
                     </p>
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex flex-col gap-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
               {/* Rating Summary */}
               <div className="lg:col-span-1">
                  <div className="mb-10">
                    <h2 className="text-7xl font-black mb-2">{averageRating}</h2>
                    <div className="flex items-center text-[#FF8A00] mb-2">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-5 h-5 ${s <= Math.round(Number(averageRating)) ? "fill-current" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Average Rating ({totalReviews} Reviews)</p>
                  </div>
                  
                  <div className="space-y-3">
                    {ratingCounts.map(({ stars, count, percentage }) => (
                      <div key={stars} className="flex items-center gap-4 group">
                        <span className="text-xs font-bold w-4">{stars}</span>
                        <Star className="w-3 h-3 text-orange-400 fill-current" />
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                           <div 
                            className="h-full bg-orange-400 transition-all duration-1000" 
                            style={{ width: `${percentage}%` }}
                           ></div>
                        </div>
                        <span className="text-xs text-gray-400 font-bold w-10 text-right">{percentage}%</span>
                      </div>
                    ))}
                  </div>
               </div>

               {/* Review Form */}
               <div className="lg:col-span-2">
                  <div className="bg-white border border-gray-100 rounded-3xl p-8 lg:p-12 shadow-sm">
                    <h3 className="text-2xl font-bold mb-2">Submit Your Review</h3>
                    <p className="text-sm text-gray-400 mb-8">Your email address will not be published. Required fields are marked *</p>
                    
                    <form className="space-y-6" onSubmit={handleReviewSubmit}>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Write your opinion about the product *</label>
                        <textarea 
                          placeholder="Write Your Review Here..."
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          required
                          className="w-full h-32 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:bg-white focus:border-[#FF8A00] outline-none transition-all resize-none"
                        ></textarea>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-1">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Your Rating: *</label>
                           <div className="relative">
                              <select 
                                value={reviewForm.rating}
                                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:bg-white focus:border-[#FF8A00] outline-none appearance-none cursor-pointer"
                              >
                                <option value="5">5 Stars - Excellent</option>
                                <option value="4">4 Stars - Good</option>
                                <option value="3">3 Stars - Average</option>
                                <option value="2">2 Stars - Poor</option>
                                <option value="1">1 Star - Terrible</option>
                              </select>
                              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                           </div>
                        </div>
                        <div className="flex-1 flex items-end">
                           <button 
                            type="submit"
                            disabled={submittingReview}
                            className="w-full bg-[#333333] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all disabled:bg-gray-300"
                           >
                              {submittingReview ? "Submitting..." : "Submit Review"}
                           </button>
                        </div>
                      </div>
                    </form>
                  </div>
               </div>
              </div>

              {/* Review List */}
              {reviews.length > 0 && (
                <div className="mt-8 space-y-8">
                  <h3 className="text-xl font-bold uppercase tracking-widest">Customer Reviews</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {reviews.map((rev) => (
                      <div key={rev._id} className="bg-white border border-gray-50 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <p className="font-bold text-sm text-black mb-1">{rev.user?.name || "Verified Buyer"}</p>
                              <div className="flex items-center text-[#FF8A00]">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? "fill-current" : "text-gray-100"}`} />
                                ))}
                              </div>
                           </div>
                           <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                             {new Date(rev.createdAt).toLocaleDateString()}
                           </span>
                        </div>
                        <p className="text-gray-500 text-sm font-light leading-relaxed italic">
                          "{rev.comment}"
                        </p>
                        {rev.adminReply && (
                          <div className="mt-4 pt-4 border-t border-gray-50">
                             <p className="text-[10px] font-black uppercase tracking-widest text-[#FF8A00] mb-1">Studio Response:</p>
                             <p className="text-xs text-gray-600 leading-relaxed">{rev.adminReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 🚀 NEW Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-gray-200 py-24 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-2xl font-medium tracking-tight">
              You Might Also Like
            </h2>
            <Link
              href="/shop"
              className="text-xs font-bold uppercase tracking-widest hover:text-gray-500 transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {relatedProducts.map((item) => (
              <Link
                href={`/product/${item._id}`}
                key={item._id}
                className="group cursor-pointer flex flex-col h-full"
              >
                <div className="aspect-[3/4] bg-[#f8f8f8] rounded-2xl overflow-hidden mb-5 relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      <ShoppingBag className="h-8 w-8 mb-2 opacity-20" />
                    </div>
                  )}
                </div>

                {/* Details & Cart Area */}
                <div className="flex items-start justify-between gap-4 mt-auto">
                  <div>
                    <h3 className="font-medium text-[#111111] text-sm mb-1 line-clamp-1 group-hover:text-gray-500 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        {item.originalPrice && (
                          <span className="text-gray-400 text-xs line-through">
                            ৳{item.originalPrice}
                          </span>
                        )}
                        <p
                          className={`text-sm font-light ${item.isFlashSale ? "text-red-500 font-bold" : "text-gray-500"}`}
                        >
                          ৳{item.price}
                        </p>
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">
                        {item.stock} in stock
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart({ ...item, quantity: 1 });
                      toast.success("Added to bag!");
                    }}
                    className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-900 hover:bg-black hover:border-black hover:text-white transition-all shrink-0"
                    title="Add to Cart"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
