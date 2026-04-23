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

  // Search Logic (Name, Email or Mobile)
  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.mobile && c.mobile.includes(searchQuery)),
    );
  }, [customers, searchQuery]);

  // Leaderboard Logic (Top 3 spenders)
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          Customer Management
        </h1>
        <p className="text-slate-500 mt-1">
          Track customer profiles, view order history, and manage refunds.
        </p>
      </div>

      {/* 🏆 LEADERBOARD SECTION 🏆 */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" /> Top Customers
          (Leaderboard)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topCustomers.map((customer, index) => (
            <div
              key={customer._id}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700 shadow-lg relative overflow-hidden"
            >
              {/* Ranking Badge */}
              <div
                className={`absolute -right-6 -top-6 w-20 h-20 rotate-45 flex items-end justify-center pb-2 font-black text-xl shadow-md
                                ${index === 0 ? "bg-amber-400 text-amber-900" : index === 1 ? "bg-slate-300 text-slate-700" : "bg-amber-700 text-amber-100"}
                            `}
              >
                #{index + 1}
              </div>

              <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 pr-8">
                {customer.name}
              </h3>
              <p className="text-slate-400 text-sm mb-4">{customer.email}</p>

              <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold">
                    Total Spent
                  </p>
                  <p className="text-xl font-black text-emerald-400">
                    ${customer.totalSpent}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase font-bold">
                    Orders
                  </p>
                  <p className="text-xl font-bold text-white">
                    {customer.totalOrders}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name, Email or Mobile Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-bold">Customer Name</th>
                <th className="p-4 font-bold">Email</th>
                <th className="p-4 font-bold">Mobile</th>
                <th className="p-4 font-bold text-center">Total Orders</th>
                <th className="p-4 font-bold text-right">Total Spent</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-slate-500 font-bold"
                  >
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-800">
                      {customer.name}
                    </td>
                    <td className="p-4 text-slate-600">{customer.email}</td>
                    <td className="p-4 font-mono text-sm text-slate-500">
                      {customer.mobile || "N/A"}
                    </td>
                    <td className="p-4 text-center font-bold text-blue-600 bg-blue-50/50">
                      {customer.totalOrders}
                    </td>
                    <td className="p-4 text-right font-black text-emerald-600">
                      ${customer.totalSpent}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleViewDetails(customer)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 rounded-lg text-sm font-bold transition-colors"
                      >
                        <Eye className="h-4 w-4" /> Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Customer Profile Details */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" /> Customer Profile
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  ID: #{selectedCustomer._id}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto bg-slate-50/50">
              {detailsLoading ? (
                <div className="py-20 text-center text-slate-500 font-bold flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  Fetching customer history...
                </div>
              ) : customerDetails ? (
                <div className="space-y-6">
                  {/* Top Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Registered On
                        </p>
                        <p className="font-bold text-slate-800">
                          {customerDetails.registrationDate}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Lifetime Spent
                        </p>
                        <p className="text-xl font-black text-emerald-600">
                          ${selectedCustomer.totalSpent}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Top Product
                        </p>
                        <p className="font-bold text-slate-800 line-clamp-1">
                          {customerDetails.topProducts[0]?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Col: Contact & Top Products */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                          Contact Info
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-slate-400">Name</p>
                            <p className="font-bold text-slate-700">
                              {selectedCustomer.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Email</p>
                            <p className="font-bold text-slate-700">
                              {selectedCustomer.email}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Mobile</p>
                            <p className="font-bold text-slate-700">
                              {selectedCustomer.mobile || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                          <ShoppingBag className="h-4 w-4 text-purple-500" />{" "}
                          Most Ordered Items
                        </h3>
                        <ul className="space-y-2">
                          {customerDetails.topProducts.map(
                            (p: any, i: number) => (
                              <li
                                key={i}
                                className="flex justify-between items-center text-sm"
                              >
                                <span className="font-medium text-slate-700">
                                  {p.name}
                                </span>
                                <span className="bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full text-xs">
                                  {p.count}x
                                </span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* Right Col: Order History & Actions */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                          Order History & Actions
                        </h3>

                        {/* Current Orders */}
                        <div className="mb-6">
                          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">
                            Active/Current Orders
                          </h4>
                          <div className="space-y-3">
                            {customerDetails.currentOrders.length === 0 ? (
                              <p className="text-sm text-slate-500">
                                No active orders.
                              </p>
                            ) : (
                              customerDetails.currentOrders.map(
                                (order: any) => (
                                  <div
                                    key={order._id}
                                    className="border border-blue-100 bg-blue-50/30 rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                                  >
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-slate-800">
                                          #{order._id}
                                        </span>
                                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                          {order.status}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-500">
                                        {order.date} •{" "}
                                        {order.products.join(", ")}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="font-black text-slate-800">
                                        ${order.total}
                                      </span>

                                      {/* CANCEL ORDER BUTTON */}
                                      <button
                                        onClick={() =>
                                          handleCancelOrder(order._id)
                                        }
                                        className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-md transition-colors"
                                      >
                                        <Ban className="h-3 w-3" /> Cancel &
                                        Refund
                                      </button>
                                    </div>
                                  </div>
                                ),
                              )
                            )}
                          </div>
                        </div>

                        {/* Previous Orders */}
                        <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">
                            Previous Orders
                          </h4>
                          <div className="space-y-3">
                            {customerDetails.previousOrders.length === 0 ? (
                              <p className="text-sm text-slate-500">
                                No previous orders.
                              </p>
                            ) : (
                              customerDetails.previousOrders.map(
                                (order: any) => (
                                  <div
                                    key={order._id}
                                    className="border border-slate-100 bg-slate-50 rounded-lg p-4"
                                  >
                                    <div className="flex justify-between items-center mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-700">
                                          #{order._id}
                                        </span>
                                        <span
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${order.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
                                        >
                                          {order.status}
                                        </span>
                                      </div>
                                      <span className="font-bold text-slate-600">
                                        ${order.total}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-2">
                                      {order.date} • {order.products.join(", ")}
                                    </p>

                                    {/* Refund Message Display */}
                                    {order.status === "Cancelled" &&
                                      order.refundMsg && (
                                        <div className="mt-2 bg-red-50 border border-red-100 rounded p-2 flex items-start gap-2">
                                          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                          <div className="text-xs text-red-800">
                                            <span className="font-bold block">
                                              Manual Refund Message sent to
                                              customer:
                                            </span>
                                            {order.refundMsg}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                ),
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
