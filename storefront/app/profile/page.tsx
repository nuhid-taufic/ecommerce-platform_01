"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Ticket,
  CreditCard,
  User as UserIcon,
  LogOut,
  Package,
  Check,
  Edit2,
  Trash2,
  Plus,
  X,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

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

    const fetchMyOrders = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/orders/my-orders/${user.email}`
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

  if (!isClient || !user) return null;

  const sidebarMenus = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "trace-order", label: "Trace Order", icon: <Package size={18} /> },
    { id: "promo-coupon", label: "Promo / Coupon", icon: <Ticket size={18} /> },
    { id: "address", label: "Address", icon: <MapPin size={18} /> },
    { id: "payment", label: "Payment", icon: <CreditCard size={18} /> },
    { id: "manage-profile", label: "Manage Profile", icon: <UserIcon size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] flex flex-col">
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 lg:px-8 pt-16 pb-24">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-2">Account.</h1>
          <p className="text-gray-500 font-light">Welcome back, {user.name || "Valued Client"}.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Sidebar */}
          <div className="w-full lg:w-72 lg:sticky lg:top-24 shrink-0">
            <div className="flex flex-col gap-1.5 p-4 bg-white border border-gray-100 rounded-3xl shadow-sm">
              {/* User Card */}
              <div className="flex items-center gap-4 p-5 mb-4 bg-gray-50 rounded-2xl">
                <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white text-xl font-medium ring-4 ring-white shadow-sm shrink-0">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-base font-bold truncate tracking-tight">{user.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Verified Member</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="space-y-1.5">
                {sidebarMenus.map((menu) => (
                  <button
                    key={menu.id}
                    onClick={() => setActiveTab(menu.id)}
                    className={`w-full flex items-center justify-between group px-5 py-4 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === menu.id
                        ? "bg-black text-white shadow-xl shadow-black/10"
                        : "text-gray-500 hover:bg-gray-50 hover:text-black"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={activeTab === menu.id ? "text-white" : "text-gray-400 group-hover:text-black transition-colors"}>
                        {React.cloneElement(menu.icon as React.ReactElement, { size: 20, strokeWidth: 2 })}
                      </span>
                      {menu.label}
                    </div>
                    {activeTab === menu.id && (
                      <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                    )}
                  </button>
                ))}
              </div>

              <div className="h-px bg-gray-100 my-5 mx-2" />
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3.5 px-5 py-4 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut size={20} strokeWidth={2} /> Logout
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            {activeTab === "dashboard" && <Dashboard orders={orders} loading={loading} />}
            {activeTab === "trace-order" && <TraceOrder orders={orders} loading={loading} />}
            {activeTab === "promo-coupon" && <PromoCoupon />}
            {activeTab === "address" && <AddressManage user={user} updateUser={updateUser} />}
            {activeTab === "payment" && <Payment />}
            {activeTab === "manage-profile" && (
              <ManageProfile user={user} updateUser={updateUser} logout={logout} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// 1. Dashboard
const Dashboard = ({ orders, loading }: { orders: any[]; loading: boolean }) => {
  const { user } = useAuthStore();
  
  if (loading) return <div className="text-gray-400 font-bold uppercase text-sm">Loading...</div>;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => ["Pending", "Processing", "Shipped"].includes(o.orderStatus)).length;
  const completedOrders = orders.filter((o) => o.orderStatus === "Delivered").length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Account Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Your latest activity and statistics</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-2xl text-sm font-bold">
          <Check size={18} /> Verified Account
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-gray-50 rounded-xl"><Package size={24} className="text-gray-600" /></div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
          </div>
          <p className="text-4xl font-bold">{totalOrders}</p>
          <p className="text-sm text-gray-500 mt-2">Orders placed</p>
        </div>
        
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-blue-50 rounded-xl"><MapPin size={24} className="text-blue-600" /></div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Active</span>
          </div>
          <p className="text-4xl font-bold text-blue-600">{pendingOrders}</p>
          <p className="text-sm text-gray-500 mt-2">In fulfillment</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-emerald-50 rounded-xl"><Check size={24} className="text-emerald-600" /></div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Done</span>
          </div>
          <p className="text-4xl font-bold text-emerald-600">{completedOrders}</p>
          <p className="text-sm text-gray-500 mt-2">Delivered</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-purple-50 rounded-xl"><CreditCard size={24} className="text-purple-600" /></div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Spent</span>
          </div>
          <p className="text-4xl font-bold text-purple-600">৳{totalSpent.toFixed(0)}</p>
          <p className="text-sm text-gray-500 mt-2">Lifetime value</p>
        </div>
      </div>

      <div className="w-full bg-gray-50/50 p-8 rounded-3xl border border-gray-100">
        <h3 className="text-base font-bold uppercase tracking-widest mb-8">Recent Activity</h3>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.slice(0, 5).map((order, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-black transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-sm font-bold">
                    #{order.orderNumber || order.tran_id || order._id}
                  </div>
                  <div>
                    <p className="text-base font-bold">{order.orderStatus}</p>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold">৳{order.totalAmount?.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Amount Paid</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base text-gray-500 italic">No recent activity found.</p>
        )}
      </div>
    </div>
  );
};

// 2. Trace Order
const TraceOrder = ({ orders, loading }: { orders: any[]; loading: boolean }) => {
  const trackingSteps = ["Pending", "Processing", "Shipped", "Delivered"];

  if (loading) return <div className="text-gray-400 font-bold uppercase text-sm">Loading...</div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-32 animate-in fade-in duration-500">
        <Package className="h-14 w-14 text-gray-200 mx-auto mb-6" strokeWidth={1} />
        <p className="text-base font-bold text-gray-400 uppercase tracking-widest">No order history found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-bold tracking-tight">Orders History</h2>
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500 bg-gray-100 px-4 py-2 rounded-full">{orders.length} total</span>
      </div>
      
      {orders.map((order) => {
        const isCancelled = order.orderStatus === "Cancelled";
        const isDelivered = order.orderStatus === "Delivered";
        const currentStepIndex = trackingSteps.indexOf(order.orderStatus);
        const progressIndex = currentStepIndex !== -1 ? currentStepIndex : 0;

        return (
          <div key={order._id} className="border border-gray-100 rounded-3xl p-8 transition-all hover:border-black/10 hover:shadow-lg bg-white">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Reference ID</p>
                <p className="text-base font-bold">#{order.orderNumber || order.tran_id || order._id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Order Value</p>
                <p className="text-lg font-bold text-black">৳{order.totalAmount?.toFixed(2)}</p>
              </div>
            </div>
            
            {isCancelled ? (
              <div className="flex items-center gap-4 p-6 bg-red-50 rounded-2xl border border-red-100">
                <X className="h-5 w-5 text-red-500" />
                <p className="text-sm font-bold text-red-600 uppercase tracking-wider">Order Cancelled</p>
              </div>
            ) : isDelivered ? (
              <div className="flex items-center justify-between p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </div>
                  <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Order Successfully Delivered</p>
                </div>
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Completed</p>
              </div>
            ) : (
              <div className="pt-4">
                <div className="flex justify-between mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-black">Current Status: {order.orderStatus}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{Math.round((progressIndex / (trackingSteps.length - 1)) * 100)}% Completed</p>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-black transition-all duration-1000"
                    style={{ width: `${(progressIndex / (trackingSteps.length - 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-5">
                  {trackingSteps.map((step, index) => (
                    <span key={step} className={`text-[10px] font-bold uppercase tracking-tight ${index <= progressIndex ? "text-black" : "text-gray-300"}`}>
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// 3. Promo / Coupon
const PromoCoupon = () => {
  const { user } = useAuthStore();
  const [code, setCode] = useState("");
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons`);
      const data = await res.json();
      if (data.success) {
        const active = data.coupons.filter((c: any) => 
          c.isActive && 
          new Date(c.expiryDate) > new Date() &&
          c.usedCount < c.usageLimit
        );
        setCoupons(active);
      }
    } catch (error) {
      console.error("Failed to fetch coupons");
    }
  };

  const handleVerify = async () => {
    if (!code) return toast.error("Enter a coupon code");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/verify/${code}`);
      const data = await res.json();
      if (data.success) {
        toast.success("Coupon added to your list!");
        if (!coupons.find(c => c.code === data.coupon.code)) {
          setCoupons(prev => [data.coupon, ...prev]);
        }
        setCode("");
      } else {
        toast.error(data.message || "Invalid coupon");
      }
    } catch (error) {
      toast.error("Error verifying coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Active Promotions</h2>
          <p className="text-sm text-gray-500 mt-1">Redeem and manage your discount codes</p>
        </div>
        <div className="flex w-full lg:w-auto gap-3 bg-white border border-gray-100 p-2 rounded-2xl shadow-sm">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ENTER CODE"
            className="flex-1 lg:w-64 bg-transparent px-5 py-3 text-sm font-bold uppercase tracking-wider outline-none"
          />
          <button
            onClick={handleVerify}
            disabled={loading}
            className="bg-black text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50 shadow-lg shadow-black/5"
          >
            {loading ? "..." : "Verify Code"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {coupons.length > 0 ? coupons.map((c, idx) => (
          <div key={idx} className="group relative border border-gray-100 rounded-3xl p-10 bg-white hover:border-black transition-all overflow-hidden flex flex-col justify-between min-h-[220px] shadow-sm">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Ticket size={64} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Available Offer</span>
              </div>
              <h4 className="text-3xl font-bold tracking-tight mb-2">{c.code}</h4>
              <p className="text-base text-gray-500 font-light leading-relaxed">
                Save {c.discountValue}{c.discountType === "percentage" ? "%" : "$"} on your next purchase
              </p>
            </div>
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-50">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Expires {new Date(c.expiryDate).toLocaleDateString()}
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(c.code);
                  toast.success("Copied to clipboard");
                }}
                className="text-xs font-bold uppercase tracking-widest bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all shadow-md"
              >
                Copy
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-32 text-center border border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
            <Ticket className="h-12 w-12 text-gray-200 mx-auto mb-4" strokeWidth={1} />
            <p className="text-base font-bold text-gray-300 uppercase tracking-widest">No active promotions</p>
          </div>
        )}
      </div>
    </div>
  );
};

import { bdDistricts, bdUpazilas } from "@/utils/bd-data";

// 4. Address
const AddressManage = ({ user, updateUser }: { user: any; updateUser: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [formData, setFormData] = useState({
    type: "Home",
    addressLine: "",
    district: "Dhaka",
    thana: "",
    postalCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (user?.addresses) setAddresses(user.addresses);
  }, [user]);

  const districts = bdDistricts;
  const upazilas = bdUpazilas[formData.district] || [];

  useEffect(() => {
    if (upazilas.length > 0 && !upazilas.includes(formData.thana)) {
      setFormData(prev => ({ ...prev, thana: upazilas[0] }));
    }
  }, [formData.district]);

  const handleSave = async () => {
    if (!formData.addressLine || !formData.thana || !formData.postalCode) return toast.error("Please fill all fields");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, address: formData }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Address saved permanently!");
        setAddresses(data.addresses);
        updateUser({ ...user, addresses: data.addresses });
        setIsOpen(false);
      } else {
        toast.error("Failed to save address");
      }
    } catch (error) {
      toast.error("Error saving address");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Remove this address?")) return;
    setDeletingIndex(index);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/delete-address`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, index }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Address removed");
        setAddresses(data.addresses);
        updateUser({ ...user, addresses: data.addresses });
      } else {
        toast.error(data.message || "Failed to remove address");
      }
    } catch (error) {
      toast.error("Error deleting address");
    } finally {
      setDeletingIndex(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Delivery Addresses</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your saved shipping locations</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest bg-black text-white px-8 py-4 rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-black/5"
        >
          <Plus size={18} /> Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {addresses.length === 0 ? (
          <div className="col-span-full py-32 text-center border border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
            <MapPin className="h-12 w-12 text-gray-200 mx-auto mb-4" strokeWidth={1} />
            <p className="text-base font-bold text-gray-300 uppercase tracking-widest">No saved addresses</p>
          </div>
        ) : (
          addresses.map((addr: any, idx: number) => (
            <div key={idx} className="group border border-gray-100 rounded-3xl p-8 relative bg-white hover:border-black transition-all shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-black group-hover:text-white transition-colors">
                    <MapPin size={20} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {addr.type}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(idx)}
                  disabled={deletingIndex === idx}
                  className={`p-3 rounded-xl transition-all ${
                    deletingIndex === idx
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                  }`}
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <p className="text-base font-bold mb-2 line-clamp-2 leading-relaxed">{addr.addressLine}</p>
              <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">
                {addr.thana}, {addr.district} {addr.postalCode && `- ${addr.postalCode}`}
              </p>
            </div>
          ))
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-xl p-12 relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-black">
              <X size={24} />
            </button>
            <div className="mb-10 text-center">
              <h3 className="text-3xl font-bold tracking-tight">New Address</h3>
              <p className="text-sm text-gray-500 mt-2">Where should we deliver your orders?</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">Location Category</label>
                <div className="flex gap-3">
                  {["Home", "Office", "Other"].map(type => (
                    <button
                      key={type}
                      onClick={() => setFormData({...formData, type})}
                      className={`flex-1 py-4 rounded-2xl border text-xs font-bold uppercase tracking-widest transition-all ${formData.type === type ? "border-black bg-black text-white shadow-lg shadow-black/10" : "border-gray-100 text-gray-400 hover:border-gray-300"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">Address Detail</label>
                <input
                  type="text"
                  value={formData.addressLine}
                  onChange={e => setFormData({...formData, addressLine: e.target.value})}
                  className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl px-6 py-4 text-base focus:border-black outline-none transition-all"
                  placeholder="Street name, House, Flat..."
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={e => setFormData({...formData, postalCode: e.target.value})}
                  className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl px-6 py-4 text-base focus:border-black outline-none transition-all"
                  placeholder="1209"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">District</label>
                  <select
                    value={formData.district}
                    onChange={e => setFormData({...formData, district: e.target.value})}
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-wider focus:border-black outline-none bg-white appearance-none cursor-pointer"
                  >
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">Upazilla / Thana</label>
                  <select
                    value={formData.thana}
                    onChange={e => setFormData({...formData, thana: e.target.value})}
                    className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-wider focus:border-black outline-none bg-white appearance-none cursor-pointer"
                  >
                    {upazilas.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-black text-white py-5 rounded-[1.5rem] text-sm font-bold uppercase tracking-widest mt-6 hover:bg-gray-800 shadow-xl shadow-black/10 transition-all"
              >
                {loading ? "Registering..." : "Confirm & Save Address"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. Payment
const Payment = () => {
  return (
    <div className="animate-in fade-in duration-300 min-h-[300px] flex items-center justify-center bg-black rounded-2xl text-white">
      <div className="text-center">
        <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium tracking-widest uppercase text-gray-300">Payment methods</p>
        <p className="text-sm text-gray-500 mt-2">No payment methods saved yet.</p>
      </div>
    </div>
  );
};

// 6. Manage Profile
const ManageProfile = ({ user, updateUser, logout }: { user: any; updateUser: any; logout: any }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    mobile: user.mobile || "",
    currentPassword: "",
    newPassword: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"password" | "confirm">("password");
  const [delPassword, setDelPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: formData.name,
          mobile: formData.mobile,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated!");
        updateUser(data.user);
        setFormData({ ...formData, currentPassword: "", newPassword: "" });
        setIsEditing(false);
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBeforeDelete = async () => {
    if (!delPassword) return toast.error("Password required");
    setLoading(true);
    // We'll use a temporary check or just move to confirm step if it "looks" valid, 
    // but better to verify now. However, the backend deleteAccount does the verification.
    // So we can either have a dedicated verify endpoint or just move to confirm and let deleteAccount handle it.
    // Let's move to confirm step for UI flow, and the final delete will do the real verification.
    setDeleteStep("confirm");
    setLoading(false);
  };

  const finalDeleteAccount = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/delete-account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, password: delPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Account deleted permanently");
        logout();
        router.push("/");
      } else {
        toast.error(data.message || "Deletion failed");
        setDeleteStep("password"); // Reset on failure
      }
    } catch (error) {
      toast.error("Error deleting account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your account information and security</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-3 text-sm font-bold uppercase tracking-widest px-8 py-4 rounded-2xl transition-all shadow-lg ${isEditing ? "bg-gray-100 text-black shadow-none" : "bg-black text-white hover:bg-gray-800 shadow-black/5"}`}
        >
          {isEditing ? <X size={18} /> : <Edit2 size={18} />} {isEditing ? "Cancel Editing" : "Edit Profile"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-4">Personal Information</h3>
          
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl px-6 py-4 text-base focus:border-black outline-none transition-all"
                />
              ) : (
                <p className="text-lg font-bold py-2">{user.name}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">Email Address</label>
              <p className="text-lg font-bold py-2 text-gray-300 italic">{user.email}</p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">Mobile Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={e => setFormData({...formData, mobile: e.target.value})}
                  className="w-full border border-gray-100 bg-gray-50/50 rounded-2xl px-6 py-4 text-base focus:border-black outline-none transition-all"
                />
              ) : (
                <p className="text-lg font-bold py-2">{user.mobile || "Not provided"}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-50 pb-4">Security & Privacy</h3>
          
          <div className="space-y-6">
            {isEditing && (
              <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-6 shadow-inner">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">Current Password</label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                    placeholder="Verify current password"
                    className="w-full border border-gray-100 bg-white rounded-2xl px-6 py-4 text-base focus:border-black outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">New Password</label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={e => setFormData({...formData, newPassword: e.target.value})}
                    placeholder="Minimum 6 characters"
                    className="w-full border border-gray-100 bg-white rounded-2xl px-6 py-4 text-base focus:border-black outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="pt-6 space-y-6">
              {isEditing ? (
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="w-full bg-black text-white py-5 rounded-[1.5rem] text-sm font-bold uppercase tracking-widest hover:bg-gray-800 shadow-xl shadow-black/10 transition-all disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Save Profile Changes"}
                </button>
              ) : (
                <div className="pt-8">
                  <button
                    onClick={() => {
                      setDeleteStep("password");
                      setShowDeleteModal(true);
                    }}
                    className="text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Delete Account Permanently
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-12 relative animate-in zoom-in-95 duration-300 shadow-2xl">
            <button 
              onClick={() => {
                setShowDeleteModal(false);
                setDelPassword("");
              }} 
              className="absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"
            >
              <X size={24} />
            </button>

            {deleteStep === "password" ? (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert size={32} />
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight mb-2">Verify Identity</h3>
                  <p className="text-sm text-gray-500">Please enter your password to proceed with account deletion.</p>
                </div>

                <div className="space-y-4">
                  <input
                    type="password"
                    value={delPassword}
                    onChange={(e) => setDelPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full border border-gray-100 bg-gray-50 rounded-2xl px-6 py-5 text-base focus:border-black outline-none transition-all"
                  />
                  <button
                    onClick={handleVerifyBeforeDelete}
                    disabled={!delPassword || loading}
                    className="w-full bg-black text-white py-5 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/5 disabled:opacity-50"
                  >
                    Verify Password
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 text-center animate-in slide-in-from-right-4 duration-300">
                <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-200">
                  <Trash2 size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold tracking-tight mb-2">Final Confirmation</h3>
                  <p className="text-base text-gray-500 leading-relaxed">
                    This action is <span className="font-bold text-red-600">permanent</span>. You will lose access to all your orders, addresses, and saved data forever.
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={finalDeleteAccount}
                    disabled={loading}
                    className="w-full bg-red-600 text-white py-5 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-200 disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Yes, Delete Permanently"}
                  </button>
                  <button
                    onClick={() => setDeleteStep("password")}
                    className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black py-4 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
