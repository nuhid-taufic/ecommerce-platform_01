import React, { useState, useEffect } from "react";
import { TicketPercent, Plus, Trash2, X, Calendar, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function Coupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "0",
    expiryDate: "",
    usageLimit: "100",
  });

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/coupons`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons(data.coupons);
      }
    } catch (error) {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Creating coupon...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          discountValue: Number(formData.discountValue),
          minOrderAmount: Number(formData.minOrderAmount),
          usageLimit: Number(formData.usageLimit),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Coupon created!", { id: toastId });
        setIsModalOpen(false);
        setFormData({
          code: "",
          discountType: "percentage",
          discountValue: "",
          minOrderAmount: "0",
          expiryDate: "",
          usageLimit: "100",
        });
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to create", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this coupon?")) return;
    const toastId = toast.loading("Deleting...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/coupons/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Deleted successfully", { id: toastId });
        fetchCoupons();
      }
    } catch (error) {
      toast.error("Failed to delete", { id: toastId });
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <TicketPercent className="h-8 w-8 text-blue-600" /> Coupons & Offers
          </h1>
          <p className="text-slate-500 mt-1">
            Create and manage discount codes for your customers.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
        >
          <Plus className="h-5 w-5" /> Create Coupon
        </button>
      </div>

      {/* Coupons Grid */}
      {loading ? (
        <div className="text-center py-10 font-bold text-slate-500">
          Loading coupons...
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-10 font-bold text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
          No active coupons found. Create one!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full -z-0 transition-transform group-hover:scale-110"></div>

              <div className="relative z-10 flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black tracking-widest rounded-lg text-lg">
                    {coupon.code}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(coupon._id)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="relative z-10 mb-4">
                <p className="text-3xl font-black text-emerald-600">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}%`
                    : `৳${coupon.discountValue}`}{" "}
                  <span className="text-sm font-bold text-slate-400">OFF</span>
                </p>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  Min. Order: ৳{coupon.minOrderAmount}
                </p>
              </div>

              <div className="relative z-10 flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Valid till {new Date(coupon.expiryDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {coupon.usedCount} / {coupon.usageLimit} Used
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" /> New Coupon
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g. SUMMER50"
                  className="w-full px-4 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold tracking-wider"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                    className="w-full px-4 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Value
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: e.target.value,
                      })
                    }
                    placeholder="50"
                    className="w-full px-4 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Min Order (৳)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minOrderAmount: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    className="w-full px-4 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Expiry Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  className="w-full px-4 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors mt-6"
              >
                Publish Coupon
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
