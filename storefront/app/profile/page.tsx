"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  LogOut,
  ChevronRight,
  ArrowRight,
  Check,
  Edit2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const router = useRouter();

  const { user, logout, updateUser } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", email: "", mobile: "" });

  const trackingSteps = ["Pending", "Processing", "Shipped", "Delivered"];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    if (!user) {
      toast.error("Please log in to view your profile.");
      router.push("/login");
      return;
    }

    setEditData({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
    });

    const fetchMyOrders = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/my-orders/${user.email}`,
        );
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [isClient, user, router]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleSaveProfile = async () => {
    if (!editData.name || !editData.email) {
      toast.error("Name and Email are required!");
      return;
    }

    try {
      const updatedUser = { ...user, ...editData };
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (!isClient || !user) return null;

  const activeOrders = orders.filter((o) =>
    ["Pending", "Processing", "Shipped"].includes(o.orderStatus),
  );
  const pastOrders = orders.filter((o) =>
    ["Delivered", "Cancelled"].includes(o.orderStatus),
  );

  const getTrackingStep = (status: string) => {
    return trackingSteps.indexOf(status) !== -1
      ? trackingSteps.indexOf(status)
      : 0;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] flex flex-col">
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 lg:px-8 pt-16 pb-24">
        <div className="mb-16">
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-2">
            Account.
          </h1>
          <p className="text-gray-500 font-light">
            Welcome back, {user.name || "Valued Client"}.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Left Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="space-y-1 mb-12">
              <button className="w-full flex items-center justify-between py-3 text-sm font-bold uppercase tracking-widest border-b border-black text-black">
                <span className="flex items-center gap-3">
                  <Package className="h-4 w-4" /> Orders
                </span>
              </button>
            </div>

            {/* Profile Details Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200/60 mb-8 relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Profile Details
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-[10px] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 hover:text-gray-500 transition-all flex items-center gap-1"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="relative">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="relative">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 block">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editData.email}
                      disabled
                      className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="relative">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1 block">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={editData.mobile}
                      onChange={(e) =>
                        setEditData({ ...editData, mobile: e.target.value })
                      }
                      className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditData({
                          name: user.name,
                          email: user.email,
                          mobile: user.mobile || "",
                        });
                      }}
                      className="flex-1 border border-gray-200 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 bg-black text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-800 shadow-lg"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 text-sm animate-in fade-in duration-300">
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Name</p>
                    <p className="font-medium text-black">
                      {user.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Email</p>
                    <p className="font-medium text-black">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Mobile</p>
                    {user.mobile ? (
                      <p className="font-medium text-black">{user.mobile}</p>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-gray-400 hover:text-black italic text-sm transition-colors border-b border-gray-300 border-dashed pb-0.5"
                      >
                        + Add mobile number
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>

          {/* Right Content: Orders & Tracking */}
          <div className="flex-1 w-full">
            {loading ? (
              <div className="py-20 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
                Loading your orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl border border-gray-200/60 p-12 text-center">
                <Package className="h-8 w-8 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium tracking-tight mb-2">
                  No orders yet
                </p>
                <p className="text-sm text-gray-500 font-light mb-6">
                  You haven't placed any orders with us yet.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b border-black pb-0.5 hover:text-gray-500 transition-all"
                >
                  Start Shopping <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-16">
                {/* Active Orders */}
                {activeOrders.length > 0 && (
                  <div>
                    <h2 className="text-xl font-medium tracking-tight mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>{" "}
                      Active Orders
                    </h2>
                    <div className="space-y-6">
                      {activeOrders.map((order) => {
                        const currentStepIndex = getTrackingStep(
                          order.orderStatus,
                        );
                        return (
                          <div
                            key={order._id}
                            className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                                  Order No.{" "}
                                  {order.tran_id?.slice(-8) ||
                                    order._id?.slice(-8)}
                                </p>
                                <h3 className="font-medium text-lg">
                                  {order.items?.[0]?.name || "Product Item"}{" "}
                                  {(order.items?.length || 0) > 1 && (
                                    <span className="text-gray-400 font-light">
                                      + {(order.items?.length || 0) - 1} other
                                      items
                                    </span>
                                  )}
                                </h3>
                              </div>
                              <div className="text-left sm:text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                                  Total Paid
                                </p>
                                <p className="font-medium text-black">
                                  ${order.totalAmount?.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="relative mb-8">
                              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-100 -translate-y-1/2 z-0"></div>
                              <div
                                className="absolute top-1/2 left-0 h-[2px] bg-black -translate-y-1/2 z-0 transition-all duration-1000 ease-out"
                                style={{
                                  width: `${(currentStepIndex / (trackingSteps.length - 1)) * 100}%`,
                                }}
                              ></div>
                              <div className="relative z-10 flex justify-between">
                                {trackingSteps.map((step, index) => {
                                  const isCompleted = index <= currentStepIndex;
                                  const isCurrent = index === currentStepIndex;
                                  return (
                                    <div
                                      key={step}
                                      className="flex flex-col items-center"
                                    >
                                      <div
                                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500 bg-white ${isCompleted ? "border-black" : "border-gray-200"} ${isCurrent ? "ring-4 ring-black/10" : ""}`}
                                      >
                                        {isCompleted ? (
                                          <Check className="h-3 w-3 sm:h-4 sm:w-4 text-black" />
                                        ) : (
                                          <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                                        )}
                                      </div>
                                      <p
                                        className={`mt-3 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-center max-w-[60px] sm:max-w-none ${isCompleted ? "text-black" : "text-gray-400"}`}
                                      >
                                        {step}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Past Orders */}
                {pastOrders.length > 0 && (
                  <div>
                    <h2 className="text-xl font-medium tracking-tight mb-6 mt-12">
                      Past Orders
                    </h2>
                    <div className="flex flex-col">
                      <div className="hidden sm:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <div className="col-span-3">Order</div>
                        <div className="col-span-3">Date</div>
                        <div className="col-span-3">Status</div>
                        <div className="col-span-3 text-right">Total</div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {pastOrders.map((order) => (
                          <div
                            key={order._id}
                            className="py-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-start sm:items-center group cursor-pointer hover:bg-gray-50/50 transition-colors -mx-4 px-4 rounded-xl"
                          >
                            <div className="col-span-3 w-full flex justify-between sm:block">
                              <span className="sm:hidden text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Order
                              </span>
                              <span className="font-medium text-sm">
                                #
                                {order.tran_id?.slice(-8) ||
                                  order._id?.slice(-8)}
                              </span>
                            </div>
                            <div className="col-span-3 w-full flex justify-between sm:block">
                              <span className="sm:hidden text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Date
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="col-span-3 w-full flex justify-between sm:block">
                              <span className="sm:hidden text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Status
                              </span>
                              <div
                                className={`flex items-center gap-2 text-sm font-medium ${order.orderStatus === "Cancelled" ? "text-red-500" : "text-emerald-600"}`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${order.orderStatus === "Cancelled" ? "bg-red-500" : "bg-emerald-500"}`}
                                ></span>{" "}
                                {order.orderStatus}
                              </div>
                            </div>
                            <div className="col-span-3 w-full flex justify-between sm:block sm:text-right">
                              <span className="sm:hidden text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                Total
                              </span>
                              <div className="flex items-center justify-end gap-4">
                                <span className="text-sm font-medium">
                                  ${order.totalAmount?.toFixed(2)}
                                </span>
                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-black transition-colors hidden sm:block" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
