import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Eye,
  X,
  Trophy,
  ShoppingBag,
  CreditCard,
  Ban,
  AlertCircle,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Globe,
  ArrowRight,
  Hash,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/customers`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomers(data.customers);
      }
    } catch (error) {
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.mobile && c.mobile.includes(searchQuery)),
    );
  }, [customers, searchQuery]);

  const topCustomers = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 3);

  const handleViewDetails = async (customer: any) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
    setDetailsLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/customers/${customer._id}/details`,
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomerDetails(data.details);
      }
    } catch (error) {
      toast.error("Failed to fetch customer details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const refundMsg = window.prompt(
      "Enter manual refund message/instructions for the customer:",
    );
    if (refundMsg === null) return;
    if (refundMsg.trim() === "") {
      toast.error("Refund message is required to cancel an order!");
      return;
    }

    const toastId = toast.loading("Cancelling order...");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/customers/orders/${orderId}/cancel`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refundMsg }),
        },
      );
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Order cancelled and refunded!", { id: toastId });
        setIsModalOpen(false);
        fetchCustomers();
      } else {
        toast.error(data.message || "Failed to cancel", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error", { id: toastId });
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen relative">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
          <Users className="h-10 w-10 text-blue-600" />
          Customer CRM
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Manage your relationships and view detailed purchasing behavior.</p>
      </div>

      {/* Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {topCustomers.map((c, i) => (
          <div key={c._id} className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all">
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 group-hover:scale-150 transition-transform ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : 'bg-amber-700'}`} />
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-slate-200 text-slate-600' : 'bg-amber-700 text-white'}`}>
                {i + 1}
              </div>
              <div>
                <h3 className="font-black text-slate-900 line-clamp-1">{c.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Premium Member</p>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Contribution</p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">৳{c.totalSpent}</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Orders</p>
                 <p className="text-xl font-black text-blue-600">{c.totalOrders}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-2xl">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
        <input 
          type="text" 
          placeholder="Search by name, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-[24px] focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm font-bold text-slate-700 transition-all placeholder:text-slate-300"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Details</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Orders</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Lifetime Spent</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCustomers.map(c => (
              <tr key={c._id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400 font-bold">ID: {c._id.slice(-6)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Mail size={12} className="text-slate-300" /> {c.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Phone size={12} className="text-slate-300" /> {c.mobile}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-black">
                    {c.totalOrders}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <p className="font-black text-slate-900 text-lg">৳{c.totalSpent}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <button 
                    onClick={() => handleViewDetails(c)}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-100 hover:shadow-blue-200"
                  >
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: EVERY DETAIL */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-[48px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 flex flex-col">
            
            {/* Header */}
            <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-slate-900 text-white rounded-[28px] flex items-center justify-center shadow-xl shadow-slate-200">
                  <Users size={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedCustomer.name}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400">
                      <Calendar size={14} /> Member since {customerDetails?.registrationDate || "..."}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      <ShieldCheck size={14} /> Verified Customer
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-4 bg-slate-100 rounded-full hover:bg-red-100 hover:text-red-600 transition-all"
              >
                <X size={28} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-10 bg-slate-50/50">
              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Accessing profile data...</p>
                </div>
              ) : customerDetails ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  
                  {/* Left Column: Core Identity & Stats */}
                  <div className="space-y-8">
                    {/* Stats Card */}
                    <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-slate-300">
                        <div className="flex items-center gap-3 mb-8">
                            <Activity size={20} className="text-blue-400" />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Activity Stats</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Lifetime Spent</p>
                                    <p className="text-4xl font-black tracking-tighter">৳{customerDetails.stats.totalSpent}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Total Orders</p>
                                    <p className="text-xl font-black">{customerDetails.stats.totalOrders}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Avg Order</p>
                                    <p className="text-xl font-black">৳{customerDetails.stats.avgOrderValue}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Identity Card */}
                    <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
                            <Mail size={14} /> Communication
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Mail size={18} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                    <p className="font-bold text-slate-900">{customerDetails.customer.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Phone size={18} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</p>
                                    <p className="font-bold text-slate-900">{customerDetails.customer.mobile || "Not provided"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Globe size={18} /></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth Method</p>
                                    <p className="font-black text-blue-600 uppercase text-xs">{customerDetails.customer.isGoogle ? "Google Social" : "Email/Password"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Middle Column: Addresses & Top Products */}
                  <div className="space-y-8">
                    {/* Saved Addresses */}
                    <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
                            <MapPin size={14} /> Saved Addresses ({customerDetails.customer.addresses?.length || 0})
                        </h3>
                        <div className="space-y-4">
                            {customerDetails.customer.addresses?.length > 0 ? (
                                customerDetails.customer.addresses.map((addr: any, idx: number) => (
                                    <div key={idx} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{addr.type || 'Home'}</span>
                                        </div>
                                        <p className="font-bold text-slate-700 text-sm leading-relaxed">{addr.addressLine || addr.street}</p>
                                        <p className="text-xs text-slate-500 mt-1 font-medium">{addr.thana}, {addr.district}</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-2">{addr.name} • {addr.phone}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <MapPin className="mx-auto text-slate-200 mb-2" size={32} />
                                    <p className="text-xs font-bold text-slate-300 uppercase">No addresses saved</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
                            <ShoppingBag size={14} /> Frequently Purchased
                        </h3>
                        <div className="space-y-3">
                            {customerDetails.topProducts.map((p: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <p className="font-bold text-slate-700 text-sm">{p.name}</p>
                                    <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">{p.count} Orders</span>
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>

                  {/* Right Column: Complete Order History */}
                  <div className="space-y-8">
                    <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
                            <TrendingUp size={14} /> Full Transaction History
                        </h3>
                        
                        <div className="space-y-6">
                            {/* Current / Active */}
                            {customerDetails.currentOrders.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Active Shipments</p>
                                    {customerDetails.currentOrders.map((order: any) => (
                                        <div key={order._id} className="p-6 rounded-[32px] bg-blue-50/50 border border-blue-100 relative group overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3"><ArrowRight size={16} className="text-blue-300 group-hover:translate-x-1 transition-transform" /></div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-black text-slate-900">#{order.orderNumber || order._id.slice(-6)}</span>
                                                <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">{order.status}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-bold mb-3">{order.date}</p>
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-slate-600 font-medium truncate pr-4">{order.products.join(", ")}</p>
                                                <span className="font-black text-slate-900">৳{order.total}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleCancelOrder(order._id)}
                                                className="mt-4 w-full py-2 bg-red-100 hover:bg-red-600 hover:text-white text-red-600 rounded-xl text-[10px] font-black uppercase transition-all"
                                            >
                                                Manual Refund / Cancel
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Completed / History */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Past Transactions</p>
                                {customerDetails.previousOrders.map((order: any) => (
                                    <div key={order._id} className="p-5 rounded-3xl bg-white border border-slate-100 hover:shadow-md transition-all">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-slate-800 text-sm">#{order.orderNumber || order._id.slice(-6)}</span>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${order.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <span className="font-black text-slate-900">৳{order.total}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold mb-1">{order.date}</p>
                                        <p className="text-xs text-slate-500 truncate">{order.products.join(", ")}</p>
                                        {order.refundMsg && (
                                            <div className="mt-3 p-3 bg-red-50/50 rounded-xl border border-red-100/50">
                                                <p className="text-[8px] font-black text-red-400 uppercase mb-1">Refund Internal Note</p>
                                                <p className="text-[10px] text-red-700 italic">"{order.refundMsg}"</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  </div>

                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-100 bg-slate-50 text-center shrink-0">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">End of Comprehensive Profile • Data Secured</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
