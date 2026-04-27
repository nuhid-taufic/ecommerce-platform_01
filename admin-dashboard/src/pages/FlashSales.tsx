import React, { useState, useEffect } from "react";
import { Zap, Plus, Trash2, X, Calendar, Clock, Tag } from "lucide-react";
import toast from "react-hot-toast";

export default function FlashSales() {
  const [sales, setSales] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [currentProductSelection, setCurrentProductSelection] = useState("");
  const [currentSalePrice, setCurrentSalePrice] = useState("");

  // Fetch Flash Sales & Products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, productsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/flash-sales`),
          fetch(`${import.meta.env.VITE_API_URL}/products`),
        ]);

        const salesData = await salesRes.json();
        const productsData = await productsRes.json();

        if (salesData.success) setSales(salesData.sales);
        if (productsData.success) setProducts(productsData.products || []);
      } catch (error) {
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add Product to Sale List
  const handleAddProduct = () => {
    if (!currentProductSelection || !currentSalePrice) {
      toast.error("Please select a product and enter a sale price!");
      return;
    }

    const productDetails = products.find(
      (p) => p._id === currentProductSelection,
    );
    if (!productDetails) return;

    // Check if already added
    if (selectedProducts.some((p) => p.productId === currentProductSelection)) {
      toast.error("Product already added to this flash sale!");
      return;
    }

    setSelectedProducts([
      ...selectedProducts,
      {
        productId: currentProductSelection,
        name: productDetails.name,
        originalPrice: productDetails.price,
        salePrice: Number(currentSalePrice),
      },
    ]);

    // Reset inputs
    setCurrentProductSelection("");
    setCurrentSalePrice("");
  };

  const handleRemoveProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.productId !== id));
  };

  // Create New Flash Sale
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      toast.error("You must add at least one product to the flash sale!");
      return;
    }

    const toastId = toast.loading("Publishing Flash Sale...");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/flash-sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          startTime,
          endTime,
          products: selectedProducts.map((p) => ({
            productId: p.productId,
            salePrice: p.salePrice,
          })),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Flash Sale Published!", { id: toastId });
        setIsModalOpen(false);

        // Reset Form
        setTitle("");
        setStartTime("");
        setEndTime("");
        setSelectedProducts([]);

        // Refresh List
        const newSalesRes = await fetch(
          `${import.meta.env.VITE_API_URL}/flash-sales`,
        );
        const newSalesData = await newSalesRes.json();
        if (newSalesData.success) setSales(newSalesData.sales);
      } else {
        toast.error(data.message || "Failed to publish", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error", { id: toastId });
    }
  };

  // Delete Flash Sale
  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to end and delete this flash sale?",
      )
    )
      return;

    const toastId = toast.loading("Deleting...");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/flash-sales/${id}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        toast.success("Flash Sale Deleted", { id: toastId });
        setSales(sales.filter((s) => s._id !== id));
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
            <Zap className="h-8 w-8 text-amber-500 fill-amber-500" /> Flash
            Sales
          </h1>
          <p className="text-slate-500 mt-1">
            Manage time-limited campaigns and special discounts.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-amber-500 text-white px-5 py-3 rounded-xl font-bold transition-colors shadow-md"
        >
          <Plus className="h-5 w-5" /> Create Campaign
        </button>
      </div>

      {/* Flash Sales List */}
      {loading ? (
        <div className="text-center py-10 font-bold text-slate-500">
          Loading campaigns...
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
          <Zap className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">
            No Active Campaigns
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Create a new flash sale to boost your revenue.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sales.map((sale) => (
            <div
              key={sale._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded-full uppercase tracking-wider mb-2">
                    Campaign
                  </span>
                  <h3 className="text-xl font-black text-slate-800">
                    {sale.title}
                  </h3>
                </div>
                <button
                  onClick={() => handleDelete(sale._id)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-2 bg-slate-50 rounded-lg"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                    <Calendar className="h-3 w-3" /> Start Time
                  </p>
                  <p className="font-bold text-slate-700">
                    {new Date(sale.startTime).toLocaleString()}
                  </p>
                </div>
                <div className="hidden sm:block w-px bg-slate-200"></div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3" /> End Time
                  </p>
                  <p className="font-bold text-slate-700">
                    {new Date(sale.endTime).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> {sale.products?.length || 0}{" "}
                  Products on Sale
                </p>
                <div className="flex flex-wrap gap-2">
                  {sale.products?.slice(0, 3).map((p: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2 border border-slate-200"
                    >
                      <span className="truncate max-w-[100px]">
                        {p.productId?.name || "Product"}
                      </span>
                      <span className="font-bold text-emerald-600">
                        ৳{p.salePrice}
                      </span>
                    </div>
                  ))}
                  {sale.products?.length > 3 && (
                    <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-bold text-slate-500 border border-slate-200">
                      +{sale.products.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl my-8 relative">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-5 border-b border-slate-100 rounded-t-2xl">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" /> New Flash Sale
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition-colors bg-slate-50 p-2 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Campaign Title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Eid Mega Sale"
                      className="w-full px-4 py-2 mt-1 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Start Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-4 py-2 mt-1 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        End Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-4 py-2 mt-1 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Selection */}
                <div className="bg-white border border-slate-200 p-5 rounded-xl">
                  <h3 className="text-sm font-bold text-slate-800 uppercase mb-4">
                    Select Products for Sale
                  </h3>

                  <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <div className="flex-1">
                      <select
                        value={currentProductSelection}
                        onChange={(e) =>
                          setCurrentProductSelection(e.target.value)
                        }
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                      >
                        <option value="">-- Choose a Product --</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} (Original: ৳{p.price})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full md:w-1/3">
                      <input
                        type="number"
                        min="0"
                        placeholder="Sale Price (৳)"
                        value={currentSalePrice}
                        onChange={(e) => setCurrentSalePrice(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm font-bold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                    >
                      Add
                    </button>
                  </div>

                  {/* Selected Products List */}
                  {selectedProducts.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                        Added Products ({selectedProducts.length})
                      </p>
                      {selectedProducts.map((p, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100"
                        >
                          <div>
                            <p className="font-bold text-slate-800 text-sm">
                              {p.name}
                            </p>
                            <p className="text-xs text-slate-500 line-through">
                              Original: ৳{p.originalPrice}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-black text-emerald-600">
                              ৳{p.salePrice}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(p.productId)}
                              className="text-red-400 hover:text-red-600 bg-white p-1.5 rounded-md shadow-sm border border-slate-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-amber-500 transition-colors shadow-md text-lg"
                >
                  Publish Flash Sale Now
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
