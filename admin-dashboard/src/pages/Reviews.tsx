import React, { useState, useEffect } from "react";
import {
  Star,
  MessageCircle,
  Trash2,
  EyeOff,
  CheckCircle,
  X,
  CornerDownRight,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply Modal States
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews`);
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const toastId = toast.loading("Updating status...");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/reviews/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isApproved: !currentStatus }),
        },
      );
      if (res.ok) {
        toast.success(!currentStatus ? "Review Approved!" : "Review Hidden!", {
          id: toastId,
        });
        fetchReviews();
      }
    } catch (error) {
      toast.error("Failed to update status", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    const toastId = toast.loading("Deleting...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Review deleted", { id: toastId });
        fetchReviews();
      }
    } catch (error) {
      toast.error("Failed to delete", { id: toastId });
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Sending reply...");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/reviews/${selectedReview._id}/reply`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminReply: replyText }),
        },
      );
      if (res.ok) {
        toast.success("Reply posted!", { id: toastId });
        setIsReplyModalOpen(false);
        setReplyText("");
        fetchReviews();
      }
    } catch (error) {
      toast.error("Failed to post reply", { id: toastId });
    }
  };

  const openReplyModal = (review: any) => {
    setSelectedReview(review);
    setReplyText(review.adminReply || "");
    setIsReplyModalOpen(true);
  };

  // Helper to render stars
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
      />
    ));
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Star className="h-8 w-8 text-amber-500 fill-amber-500" /> Customer
          Reviews
        </h1>
        <p className="text-slate-500 mt-1">
          Manage ratings, hide inappropriate comments, and reply to your
          customers.
        </p>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-10 font-bold text-slate-500">
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 font-bold text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
          No reviews yet. As soon as customers review products, they will appear
          here.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className={`bg-white rounded-2xl border ${review.isApproved ? "border-slate-200" : "border-red-200 bg-red-50/30"} shadow-sm p-6 flex flex-col md:flex-row gap-6 transition-all`}
            >
              {/* Product Info (Left side) */}
              <div className="w-full md:w-48 shrink-0 flex items-center gap-3 md:border-r border-slate-100 pr-4">
                {review.product?.image ? (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center p-1 shrink-0">
                    <img
                      src={review.product.image}
                      alt="Product"
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="text-slate-400 text-xs font-bold">
                      No Img
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">
                    Product
                  </p>
                  <p className="text-sm font-bold text-slate-800 line-clamp-2">
                    {review.product?.name || "Deleted Product"}
                  </p>
                </div>
              </div>

              {/* Review Content (Middle) */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex">{renderStars(review.rating)}</div>
                  <span className="text-sm font-bold text-slate-700">
                    {review.user?.name || "Unknown User"}
                  </span>
                  <span className="text-xs text-slate-400">
                    • {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  {!review.isApproved && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase tracking-wider">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-slate-600 mb-4">{review.comment}</p>

                {/* Admin Reply Display */}
                {review.adminReply && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
                    <CornerDownRight className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-blue-800 mb-1">
                        Your Reply
                      </p>
                      <p className="text-sm text-blue-900">
                        {review.adminReply}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons (Right side) */}
              <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0 md:pl-4 md:border-l border-slate-100">
                <button
                  onClick={() => toggleStatus(review._id, review.isApproved)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${review.isApproved ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                >
                  {review.isApproved ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  {review.isApproved ? "Hide" : "Approve"}
                </button>

                <button
                  onClick={() => openReplyModal(review)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> Reply
                </button>

                <button
                  onClick={() => handleDelete(review._id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold transition-colors"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Reply Modal */}
      {isReplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" /> Reply to{" "}
                {selectedReview?.user?.name}
              </h2>
              <button
                onClick={() => setIsReplyModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleReplySubmit} className="p-6">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl mb-4">
                <div className="flex mb-2">
                  {renderStars(selectedReview?.rating || 0)}
                </div>
                <p className="text-sm text-slate-600 italic">
                  "{selectedReview?.comment}"
                </p>
              </div>

              <label className="text-xs font-bold text-slate-500 uppercase">
                Your Official Reply
              </label>
              <textarea
                required
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Thank you for your feedback..."
                className="w-full px-4 py-3 mt-1 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors mt-4"
              >
                Post Reply
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
