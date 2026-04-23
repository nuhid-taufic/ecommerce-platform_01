import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Power,
  Settings2,
  Pin,
  Search,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Recommendations() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // AI Recommendation Engines (Simulated States)
  const [engines, setEngines] = useState({
    trending: true,
    frequentlyBought: true,
    newArrivals: false,
    viewingHistory: true,
  });

  // Manually Pinned Products
  const [pinnedProducts, setPinnedProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/products`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProducts(data.products || []);
        }
      } catch (error) {
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleEngine = (engineKey: keyof typeof engines) => {
    setEngines((prev) => ({ ...prev, [engineKey]: !prev[engineKey] }));
    toast.success(`Engine updated successfully!`);
  };

  const handlePinProduct = (product: any) => {
    if (pinnedProducts.find((p) => p._id === product._id)) {
      toast.error("Product is already pinned!");
      return;
    }
    if (pinnedProducts.length >= 4) {
      toast.error("You can only pin up to 4 featured products.");
      return;
    }
    setPinnedProducts([...pinnedProducts, product]);
    toast.success("Product pinned to featured list!");
    setIsModalOpen(false);
  };

  const handleUnpinProduct = (id: string) => {
    setPinnedProducts(pinnedProducts.filter((p) => p._id !== id));
    toast.success("Product removed from featured list.");
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-600" /> Smart Recommendations
        </h1>
        <p className="text-slate-500 mt-1">
          Configure AI-driven product suggestions and curate featured items.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Col: Recommendation Engines */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-blue-600" /> Active
                Suggestion Engines
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EngineCard
                title="Trending Now"
                desc="Suggests products with the highest sales in the last 7 days."
                isActive={engines.trending}
                onToggle={() => toggleEngine("trending")}
              />
              <EngineCard
                title="Frequently Bought Together"
                desc="Analyzes past orders to suggest complementary items."
                isActive={engines.frequentlyBought}
                onToggle={() => toggleEngine("frequentlyBought")}
              />
              <EngineCard
                title="Personalized History"
                desc="Shows items based on the user's browsing history."
                isActive={engines.viewingHistory}
                onToggle={() => toggleEngine("viewingHistory")}
              />
              <EngineCard
                title="New Arrivals"
                desc="Automatically highlights the latest added inventory."
                isActive={engines.newArrivals}
                onToggle={() => toggleEngine("newArrivals")}
              />
            </div>
          </div>

          {/* Pro Tip Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-2xl shadow-md text-white flex items-start gap-4">
            <Sparkles className="h-8 w-8 shrink-0 text-purple-200" />
            <div>
              <h3 className="font-bold text-lg mb-1">
                Boost Your Sales by 20%
              </h3>
              <p className="text-sm text-purple-100 opacity-90 leading-relaxed">
                Studies show that keeping "Frequently Bought Together" enabled
                on the checkout page can significantly increase the Average
                Order Value (AOV). Let the algorithm do the heavy lifting!
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Curated / Pinned Products */}
        <div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Pin className="h-5 w-5 text-red-500" /> Featured Picks
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg transition-colors"
                title="Pin new product"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              These products will be forcefully shown on the homepage header
              regardless of the algorithm.
            </p>

            <div className="space-y-3">
              {pinnedProducts.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                  <p className="text-slate-400 font-bold text-sm">
                    No products pinned yet.
                  </p>
                </div>
              ) : (
                pinnedProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-sm"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                          No Img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="text-sm font-bold text-slate-800 truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs font-bold text-emerald-600">
                        ${product.price}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnpinProduct(product._id)}
                      className="text-slate-400 hover:text-red-500 p-2 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Select Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg h-full max-h-[80vh] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50 shrink-0">
              <h2 className="text-lg font-bold text-slate-800">
                Select Product to Pin
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-red-500 bg-white p-2 rounded-full border border-slate-200 shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 shrink-0 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search your inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <p className="text-center text-slate-500 font-bold mt-10">
                  Loading inventory...
                </p>
              ) : filteredProducts.length === 0 ? (
                <p className="text-center text-slate-500 mt-10">
                  No products found.
                </p>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:border-blue-300 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0 overflow-hidden">
                        {product.image && (
                          <img
                            src={product.image}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-700 truncate">
                        {product.name}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePinProduct(product)}
                      className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      Pin This
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Engine Card Component
function EngineCard({
  title,
  desc,
  isActive,
  onToggle,
}: {
  title: string;
  desc: string;
  isActive: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`p-5 rounded-xl border-2 transition-all ${isActive ? "border-blue-500 bg-blue-50/30" : "border-slate-200 bg-slate-50"}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3
          className={`font-bold ${isActive ? "text-blue-700" : "text-slate-700"}`}
        >
          {title}
        </h3>
        <button
          onClick={onToggle}
          className={`w-12 h-6 rounded-full relative transition-colors ${isActive ? "bg-blue-500" : "bg-slate-300"}`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isActive ? "left-7" : "left-1"}`}
          ></div>
        </button>
      </div>
      <p className="text-xs font-medium text-slate-500 leading-relaxed">
        {desc}
      </p>
      <div className="mt-4 flex items-center gap-1.5">
        <Power
          className={`h-3 w-3 ${isActive ? "text-blue-500" : "text-slate-400"}`}
        />
        <span
          className={`text-xs font-bold uppercase ${isActive ? "text-blue-600" : "text-slate-400"}`}
        >
          {isActive ? "Engine Active" : "Disabled"}
        </span>
      </div>
    </div>
  );
}
