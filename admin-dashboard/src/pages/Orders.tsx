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
} from "lucide-react";
import toast from "react-hot-toast";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Update States
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch orders");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setIsUpdating(true);
    const loadingToast = toast.loading("Updating status...");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/${selectedOrder._id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderStatus: newStatus }),
        },
      );

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success("Order status updated!");
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        fetchOrders();
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch (error) {
      toast.error("Network error!");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">Loading orders...</div>
    );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">
        Order Management
      </h1>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-sm w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                Order ID
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                Customer
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                Date
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                Total
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                Status
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order: any) => (
              <tr
                key={order._id}
                className="hover:bg-slate-50 transition-colors group"
              >
                <td className="p-4 font-mono text-sm text-slate-900 font-medium">
                  #
                  {order.tran_id?.slice(-8) ||
                    order.stripeSessionId?.slice(-8) ||
                    order._id?.slice(-8)}
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {order.customerEmail}
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 font-bold text-slate-900">
                  ${order.totalAmount?.toFixed(2)}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      order.orderStatus === "Delivered"
                        ? "bg-emerald-100 text-emerald-700"
                        : order.orderStatus === "Shipped"
                          ? "bg-blue-100 text-blue-700"
                          : order.orderStatus === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {order.orderStatus || order.paymentStatus || "Pending"}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setNewStatus(order.orderStatus || "Pending");
                    }}
                    className="text-slate-400 hover:text-black transition-colors p-2 rounded-lg hover:bg-slate-200"
                    title="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8 md:p-10">
              <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    #{selectedOrder.tran_id || selectedOrder._id}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Customer Info */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <User size={14} /> Customer
                  </h3>
                  <p className="font-medium text-sm">
                    {selectedOrder.shippingInfo?.name || "N/A"}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {selectedOrder.customerEmail}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {selectedOrder.shippingInfo?.phone}
                  </p>
                </div>

                {/* Shipping Address */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <MapPin size={14} /> Shipping Address
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedOrder.shippingInfo?.apartment
                      ? `${selectedOrder.shippingInfo.apartment}, `
                      : ""}
                    {selectedOrder.shippingInfo?.street}
                    <br />
                    {selectedOrder.shippingInfo?.district},{" "}
                    {selectedOrder.shippingInfo?.division} -{" "}
                    {selectedOrder.shippingInfo?.postcode}
                  </p>
                </div>
              </div>

              {/* Ordered Items */}
              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Ordered Items
                </h3>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 flex items-center gap-4 bg-white"
                    >
                      <img
                        src={item.image || "/placeholder.png"}
                        className="w-12 h-16 object-cover bg-slate-50 rounded-lg"
                        alt={item.name}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold">{item.name}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Qty: {item.quantity} × ${item.price}
                        </p>
                      </div>
                      <p className="font-bold text-sm">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update Action */}
              <div className="bg-slate-900 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Update Status
                  </h3>
                  <p className="text-sm text-slate-300">
                    Current:{" "}
                    <span className="font-bold text-white">
                      {selectedOrder.orderStatus || "Pending"}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none w-full sm:w-48"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={
                      isUpdating || newStatus === selectedOrder.orderStatus
                    }
                    className="bg-white text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    {isUpdating ? "Updating..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
