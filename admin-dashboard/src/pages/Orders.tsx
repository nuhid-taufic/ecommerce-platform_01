"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  X,
  Package,
  MapPin,
  User,
  Truck,
  CheckCircle,
  Clock,
  ChevronRight,
  Ban,
  ArrowRight,
  Search,
  Plus,
  Trash2,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import { bdDistricts, bdUpazilas } from "../utils/bd-data";

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus>("Pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal & Update States
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [courierName, setCourierName] = useState("");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual Order Form State
  const [manualForm, setManualForm] = useState({
    customerEmail: "",
    name: "",
    phone: "",
    addressLine: "",
    district: "Dhaka",
    thana: "",
    paymentMethod: "Manual",
    orderNote: "",
  });
  const [manualItems, setManualItems] = useState<any[]>([]);

  // Computed thanas based on selected district
  const upazilas = bdUpazilas[manualForm.district] || [];

  useEffect(() => {
    if (upazilas.length > 0 && !upazilas.includes(manualForm.thana)) {
      setManualForm(prev => ({ ...prev, thana: upazilas[0] }));
    }
  }, [manualForm.district, upazilas]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || data.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch orders");
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const handleStatusUpdate = async (id: string, status: OrderStatus, cName?: string) => {
    setIsUpdating(true);
    const loadingToast = toast.loading(`Updating order to ${status}...`);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            orderStatus: status,
            courierName: cName 
          }),
        }
      );

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success(`Order ${status.toLowerCase()} successfully!`);
        if (selectedOrder && selectedOrder._id === id) {
          setSelectedOrder({ ...selectedOrder, orderStatus: status, courierName: cName });
        }
        fetchOrders();
        setCourierName("");
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch (error) {
      toast.error("Network error!");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualItems.length === 0) return toast.error("Please add at least one product");

    const payload = {
      customerEmail: manualForm.customerEmail || `offline-${Date.now()}@example.com`,
      shippingInfo: {
        name: manualForm.name,
        phone: manualForm.phone,
        addressLine: manualForm.addressLine,
        district: manualForm.district,
        thana: manualForm.thana,
      },
      items: manualItems.map(item => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      paymentMethod: manualForm.paymentMethod,
      orderNote: manualForm.orderNote,
    };

    const loadingToast = toast.loading("Creating manual order...");
    setIsUpdating(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/manual-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success("Manual order created successfully!");
        setIsManualModalOpen(false);
        setManualItems([]);
        setManualForm({
          customerEmail: "",
          name: "",
          phone: "",
          addressLine: "",
          district: "Dhaka",
          thana: "",
          paymentMethod: "Manual",
          orderNote: "",
        });
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Manual Order Request Failed:", error);
      toast.error("Network error! Please check if backend is running.");
    } finally {
      setIsUpdating(false);
    }
  };

  const addItemToManualOrder = (productId: string) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;

    const existing = manualItems.find(item => item._id === productId);
    if (existing) {
      setManualItems(manualItems.map(item => 
        item._id === productId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setManualItems([...manualItems, { ...product, quantity: 1 }]);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const statusMatch = order.orderStatus === activeTab;
    const searchMatch = 
      order.tran_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingInfo?.phone?.includes(searchQuery) ||
      order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "Pending": return <Clock className="h-5 w-5 text-orange-500" />;
      case "Processing": return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case "Shipped": return <Truck className="h-5 w-5 text-purple-500" />;
      case "Delivered": return <Package className="h-5 w-5 text-emerald-500" />;
      case "Cancelled": return <Ban className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-slate-500" />;
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500 font-bold flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        Loading Orders...
      </div>
    );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Fulfill your customer orders through a structured workflow.</p>
        </div>
        <button
          onClick={() => setIsManualModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          <Plus size={20} /> Create Manual Order
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        {(["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as OrderStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === status
                ? "bg-slate-900 text-white shadow-lg scale-105"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {status === "Pending" ? "New Orders" : status === "Processing" ? "Confirmed" : status === "Shipped" ? "Courier" : status}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === status ? "bg-white/20" : "bg-slate-100"}`}>
              {orders.filter(o => o.orderStatus === status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Search and List */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Search by Order ID, Phone or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all font-medium"
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 border-dashed">
              <Package className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">No orders found in {activeTab} section.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div 
                key={order._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    order.orderStatus === "Delivered" ? "bg-emerald-50" : order.orderStatus === "Pending" ? "bg-orange-50" : "bg-blue-50"
                  }`}>
                    {getStatusIcon(order.orderStatus)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">#{order.orderNumber || order.tran_id || order._id}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-slate-400 text-sm font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                      {order.transactionId && (
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black border border-blue-100">
                          TXN: {order.transactionId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 flex-1 w-full md:w-auto px-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                    <p className="font-bold text-slate-700">{order.shippingInfo?.name || "N/A"}</p>
                    <p className="text-xs text-slate-500">{order.shippingInfo?.phone || order.customerEmail}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Address</p>
                    <p className="text-sm text-slate-600 line-clamp-1">
                      {order.shippingInfo?.addressLine || order.shippingInfo?.street}, {order.shippingInfo?.thana && `${order.shippingInfo.thana}, `}{order.shippingInfo?.district}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="font-black text-slate-900 text-lg">৳{order.totalAmount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 transition-colors"
                  >
                    <Eye size={20} />
                  </button>
                  
                  {activeTab === "Pending" && (
                    <button 
                      onClick={() => handleStatusUpdate(order._id, "Processing")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
                    >
                      Confirm Order <ArrowRight size={14} />
                    </button>
                  )}

                  {activeTab === "Processing" && (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="Courier Name"
                        onChange={(e) => setCourierName(e.target.value)}
                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-purple-500 w-32"
                      />
                      <button 
                        onClick={() => {
                          if(!courierName) return toast.error("Please enter courier name");
                          handleStatusUpdate(order._id, "Shipped", courierName);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-200 transition-all active:scale-95"
                      >
                        Ship Order <Truck size={14} />
                      </button>
                    </div>
                  )}

                  {activeTab === "Shipped" && (
                    <button 
                      onClick={() => handleStatusUpdate(order._id, "Delivered")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                    >
                      Mark Delivered <CheckCircle size={14} />
                    </button>
                  )}

                  {(activeTab === "Pending" || activeTab === "Processing") && (
                    <button 
                      onClick={() => handleStatusUpdate(order._id, "Cancelled")}
                      className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl transition-colors"
                      title="Cancel Order"
                    >
                      <Ban size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manual Order Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[40px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-300 flex flex-col md:flex-row">
            {/* Left: Product Selector */}
            <div className="w-full md:w-2/5 bg-slate-50 border-r border-slate-100 p-8 overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Select Products</h2>
                <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-slate-400 border border-slate-100">
                  {products.length} Products
                </span>
              </div>
              
              <div className="space-y-3">
                {products.map(p => (
                  <button
                    key={p._id}
                    onClick={() => addItemToManualOrder(p._id)}
                    className="w-full p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all group text-left"
                  >
                    <div className="h-14 w-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                      <img src={p.image} className="h-full w-full object-cover" alt="" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-sm line-clamp-1">{p.name}</p>
                      <p className="text-blue-600 font-black text-xs mt-0.5">৳{p.price}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Plus size={16} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Order Form */}
            <div className="flex-1 p-10 overflow-y-auto no-scrollbar relative">
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="absolute top-8 right-8 p-3 bg-slate-100 rounded-full hover:bg-red-100 hover:text-red-600 transition-all"
              >
                <X size={24} />
              </button>

              <div className="mb-10">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manual Order Entry</h2>
                <p className="text-sm text-slate-400 font-medium mt-1">Manage orders from offline or other platforms.</p>
              </div>

              <form onSubmit={handleCreateManualOrder} className="space-y-8">
                {/* Items Section */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Order Items</h3>
                  {manualItems.length === 0 ? (
                    <div className="p-8 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 text-center">
                      <Package className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No items added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {manualItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl group shadow-sm">
                          <img src={item.image} className="w-12 h-14 object-cover bg-slate-50 rounded-xl" alt="" />
                          <div className="flex-1">
                            <p className="font-bold text-slate-800 text-sm">{item.name}</p>
                            <p className="text-xs text-slate-400 font-bold mt-0.5">৳{item.price} × {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                              <button 
                                type="button"
                                onClick={() => setManualItems(manualItems.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it))}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
                              >-</button>
                              <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                              <button 
                                type="button"
                                onClick={() => setManualItems(manualItems.map((it, i) => i === idx ? { ...it, quantity: it.quantity + 1 } : it))}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
                              >+</button>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setManualItems(manualItems.filter((_, i) => i !== idx))}
                              className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="p-4 bg-slate-900 rounded-2xl flex justify-between items-center text-white">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Estimated Total</span>
                        <span className="text-xl font-black tracking-tight">৳{manualItems.reduce((acc, it) => acc + (it.price * it.quantity), 0)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-100" />

                {/* Customer Details */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Customer Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Full Name</label>
                      <input 
                        required
                        value={manualForm.name}
                        onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-800 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Phone Number</label>
                      <input 
                        required
                        value={manualForm.phone}
                        onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-800 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Email (Optional)</label>
                      <input 
                        type="email"
                        value={manualForm.customerEmail}
                        onChange={(e) => setManualForm({ ...manualForm, customerEmail: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-800 transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Full Address</label>
                      <input 
                        required
                        value={manualForm.addressLine}
                        onChange={(e) => setManualForm({ ...manualForm, addressLine: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-800 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">District</label>
                      <select
                        required
                        value={manualForm.district}
                        onChange={(e) => setManualForm({ ...manualForm, district: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                      >
                        {bdDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Area/Thana</label>
                      <select
                        required
                        value={manualForm.thana}
                        onChange={(e) => setManualForm({ ...manualForm, thana: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                      >
                        {upazilas.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                      <CreditCard size={14} /> Payment Method
                    </h3>
                    <select
                      value={manualForm.paymentMethod}
                      onChange={(e) => setManualForm({ ...manualForm, paymentMethod: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Manual">Cash/Manual Payment</option>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Internal Note</h3>
                    <textarea 
                      rows={2}
                      value={manualForm.orderNote}
                      onChange={(e) => setManualForm({ ...manualForm, orderNote: e.target.value })}
                      placeholder="Special instructions for this order..."
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 font-bold text-slate-800 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? "Processing Order..." : "Confirm Manual Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-300">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-8 right-8 p-3 bg-slate-100 rounded-full hover:bg-red-100 hover:text-red-600 transition-all"
            >
              <X size={24} />
            </button>

            <div className="p-10">
              <div className="flex items-center gap-6 mb-10 border-b border-slate-100 pb-8">
                  <div className={`w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-slate-200`}>
                  <Package size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order Details</h2>
                  <p className="text-sm text-slate-400 font-mono mt-1">ID: #{selectedOrder.orderNumber || selectedOrder.tran_id || selectedOrder._id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                    <User size={14} /> Customer Info
                  </h3>
                  <div className="space-y-3">
                    <p className="font-black text-lg text-slate-800">{selectedOrder.shippingInfo?.name || "N/A"}</p>
                    <p className="text-slate-600 font-medium flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 w-max">
                      <span className="text-blue-500 font-black">@</span> {selectedOrder.customerEmail}
                    </p>
                    <p className="text-slate-600 font-medium flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 w-max">
                      <Truck size={14} className="text-purple-500" /> {selectedOrder.shippingInfo?.phone}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                    <MapPin size={14} /> Shipping Address
                  </h3>
                  <p className="text-slate-700 leading-relaxed font-bold">
                    {selectedOrder.shippingInfo?.addressLine || selectedOrder.shippingInfo?.street}
                    <br />
                    <span className="text-slate-500 font-medium">
                      {selectedOrder.shippingInfo?.thana && `${selectedOrder.shippingInfo.thana}, `}{selectedOrder.shippingInfo?.district} 
                      {selectedOrder.shippingInfo?.postalCode ? ` - ${selectedOrder.shippingInfo.postalCode}` : ""}
                    </span>
                  </p>
                  {selectedOrder.courierName && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-xs font-black uppercase text-purple-500">Courier Service</p>
                      <p className="font-black text-slate-800">{selectedOrder.courierName}</p>
                    </div>
                  )}
                </div>

                {/* New Section: Transaction & Notes */}
                <div className="bg-blue-50/50 p-8 rounded-[32px] border border-blue-100 md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-3 flex items-center gap-2">
                        <CreditCard size={14} /> Transaction Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Internal Reference</p>
                          <p className="font-mono text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-blue-100 w-max">
                            {selectedOrder.tran_id}
                          </p>
                        </div>
                        {selectedOrder.transactionId && (
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Customer TXN ID ({selectedOrder.paymentMethod})</p>
                            <p className="font-mono text-sm font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 w-max">
                              {selectedOrder.transactionId}
                            </p>
                          </div>
                        )}
                        {!selectedOrder.transactionId && (
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            Method: {selectedOrder.paymentMethod}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-3 flex items-center gap-2">
                        <Package size={14} /> Special Note
                      </h3>
                      <div className="bg-white p-4 rounded-2xl border border-blue-100 min-h-[80px]">
                        <p className="text-slate-600 font-medium italic text-sm leading-relaxed">
                          {selectedOrder.orderNote || "No special instructions provided by customer."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Ordered Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-white border border-slate-100 rounded-[24px] flex items-center gap-6 hover:border-blue-100 transition-colors">
                      <img src={item.image || "/placeholder.png"} className="w-16 h-20 object-cover bg-slate-50 rounded-2xl shadow-sm" alt={item.name} />
                      <div className="flex-1">
                        <p className="font-black text-slate-800">{item.name}</p>
                        <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-wider">
                          Quantity: {item.quantity} × ৳{item.price}
                        </p>
                      </div>
                      <p className="font-black text-xl text-slate-900">৳{item.quantity * item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-[32px] p-8 flex items-center justify-between shadow-2xl shadow-slate-300">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Total Amount Paid</p>
                  <p className="text-4xl font-black text-white tracking-tighter">৳{selectedOrder.totalAmount}</p>
                </div>
                <div className="bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                  <p className="text-[10px] font-black uppercase text-white/50 mb-1">Order Status</p>
                  <div className="flex items-center gap-2 text-white font-black">
                    {getStatusIcon(selectedOrder.orderStatus)}
                    {selectedOrder.orderStatus}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
