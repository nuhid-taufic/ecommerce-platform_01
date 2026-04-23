import React, { useState, useEffect } from "react";
import {
  Truck,
  Package,
  MapPin,
  Search,
  Printer,
  CheckCircle2,
  Clock,
  Navigation,
  X,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Shipping() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Form States
  const [status, setStatus] = useState("");
  const [courier, setCourier] = useState("Pathao");
  const [trackingId, setTrackingId] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  const fetchShipments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/shipping`);
      const data = await res.json();
      if (res.ok && data.success) {
        setShipments(data.shipments);
      }
    } catch (error) {
      toast.error("Failed to fetch shipments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleManageClick = (order: any) => {
    setSelectedOrder(order);
    setStatus(order.orderStatus);
    setCourier("Pathao");
    setTrackingId("");
    setUpdateMessage("Package handed over to courier.");
    setIsModalOpen(true);
  };

  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Updating shipment...");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/shipping/${selectedOrder._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderStatus: status,
            courierName: courier,
            trackingId: trackingId,
            locationMessage: updateMessage,
          }),
        },
      );
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Tracking updated!", { id: toastId });
        setIsModalOpen(false);
        fetchShipments();
      } else {
        toast.error(data.message || "Update failed", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error", { id: toastId });
    }
  };

  const printLabel = () => {
    toast.success("Generating Shipping Label to print...");
    // In a real app, this opens a new window with a printable PDF format of the address
  };

  // Metrics calculation
  const pendingCount = shipments.filter(
    (s) => s.orderStatus === "Processing",
  ).length;
  const inTransitCount = shipments.filter(
    (s) => s.orderStatus === "Shipped" || s.orderStatus === "In Transit",
  ).length;
  const deliveredCount = shipments.filter(
    (s) => s.orderStatus === "Delivered",
  ).length;

  const filteredShipments = shipments.filter(
    (s) =>
      s._id.includes(searchQuery) ||
      (s.customerEmail &&
        s.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const getStatusStyle = (status: string) => {
    if (status === "Delivered") return "bg-emerald-100 text-emerald-700";
    if (status === "Shipped" || status === "In Transit")
      return "bg-blue-100 text-blue-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Truck className="h-8 w-8 text-blue-600" /> Logistics & Courier
        </h1>
        <p className="text-slate-500 mt-1">
          Manage dispatch, track courier statuses, and print shipping labels.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase">
              Pending Dispatch
            </p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">
              {pendingCount}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Navigation className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase">
              In Transit
            </p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">
              {inTransitCount}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase">
              Successfully Delivered
            </p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">
              {deliveredCount}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-bold">Order ID</th>
                <th className="p-4 font-bold">Customer Info</th>
                <th className="p-4 font-bold">Total</th>
                <th className="p-4 font-bold">Shipping Status</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-10 text-center text-slate-500 font-bold"
                  >
                    Loading shipments...
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                      <Package className="h-4 w-4 text-slate-400" />
                      ...{order._id.slice(-6)}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-700 text-sm">
                        {order.customerEmail || "N/A"}
                      </p>
                    </td>
                    <td className="p-4 font-black text-emerald-600">
                      ${order.totalAmount}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusStyle(order.orderStatus)}`}
                      >
                        {order.orderStatus || "Processing"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleManageClick(order)}
                        className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                      >
                        Manage Shipment
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Shipment Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" /> Update Tracking
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-white rounded-full border border-slate-200 shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              {/* Actions Header */}
              <div className="flex justify-between items-center mb-6 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Order Ref
                  </p>
                  <p className="font-bold text-blue-900">
                    #{selectedOrder._id}
                  </p>
                </div>
                <button
                  onClick={printLabel}
                  type="button"
                  className="flex items-center gap-2 bg-white border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
                >
                  <Printer className="h-4 w-4" /> Print Label
                </button>
              </div>

              <form onSubmit={handleUpdateShipment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Courier Service
                    </label>
                    <select
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      className="w-full px-4 py-2.5 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                    >
                      <option value="Pathao">Pathao</option>
                      <option value="RedX">RedX</option>
                      <option value="Steadfast">Steadfast</option>
                      <option value="eCourier">eCourier</option>
                      <option value="Own Delivery">Own Delivery</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Order Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-2.5 mt-1 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Tracking ID (Consignment)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PTH-12345678"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full px-4 py-2.5 mt-1 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Tracking Message / Note
                  </label>
                  <textarea
                    rows={2}
                    placeholder="E.g. Package arrived at Mirpur Hub."
                    value={updateMessage}
                    onChange={(e) => setUpdateMessage(e.target.value)}
                    className="w-full px-4 py-3 mt-1 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition-colors shadow-md mt-2 flex justify-center items-center gap-2"
                >
                  <ExternalLink className="h-5 w-5" /> Save & Update Tracking
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
