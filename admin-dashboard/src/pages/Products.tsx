import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Search,
  Plus,
  Eye,
  Trash2,
  Pencil,
  TrendingUp,
  Box,
  Image as ImageIcon,
  Check,
  ChevronRight,
  LayoutGrid,
  List,
  Upload,
  X,
  Star,
  Settings2,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form states for Product
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "", // Featured image
    images: [] as string[], // Gallery (up to 2 more)
    productId: "", // Short ID
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/categories`),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();

      if (prodData.success) setProducts(prodData.products);
      if (catData.success) setCategories(catData.categories);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, type: "featured" | "gallery" | "category") => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        if (type === "featured") {
          setProductForm((prev) => ({ ...prev, image: data.secure_url }));
        } else if (type === "gallery") {
          setProductForm((prev) => ({
            ...prev,
            images: [...prev.images, data.secure_url].slice(0, 2),
          }));
        } else if (type === "category") {
          setEditingCategory((prev: any) => ({ ...prev, image: data.secure_url }));
        }
        toast.success("Image uploaded!");
      }
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const generateShortId = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `PRD-${num}`;
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.image) return toast.error("Featured image is required");
    
    const method = editingProduct ? "PUT" : "POST";
    const url = editingProduct ? `${API_URL}/products/${editingProduct._id}` : `${API_URL}/products`;
    
    const payload = {
      ...productForm,
      productId: productForm.productId || generateShortId(),
      price: Number(productForm.price),
      stock: Number(productForm.stock),
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingProduct ? "Product updated" : "Product created");
        setIsProductModalOpen(false);
        fetchData();
        resetProductForm();
      }
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image: "",
      images: [],
      productId: "",
    });
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Product deleted");
        fetchData();
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleSaveCategory = async () => {
    if (!editingCategory.name) return toast.error("Name is required");
    const method = editingCategory._id ? "PUT" : "POST";
    const url = editingCategory._id ? `${API_URL}/categories/${editingCategory._id}` : `${API_URL}/categories`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Category saved");
        setIsCategoryModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to save category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure? All products in this category will be moved to 'Uncategorized'.")) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Category deleted");
        fetchData();
        if (editingCategory?._id === id) {
          setEditingCategory({ name: "", image: "", isFeaturedOnHome: false });
        }
      }
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.productId?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "All" || p.category === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [products, searchQuery, activeTab]);

  const mostSelling = useMemo(() => {
    return [...products].sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0)).slice(0, 5);
  }, [products]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            Inventory Manager
          </h1>
          <p className="text-slate-500 mt-1">Refined product and category controls</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingCategory({ name: "", image: "", isFeaturedOnHome: false });
              setIsCategoryModalOpen(true);
            }}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Settings2 className="h-5 w-5" /> Categories
          </button>
          <button
            onClick={() => {
              resetProductForm();
              setIsProductModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            <Plus className="h-5 w-5" /> Add Product
          </button>
        </div>
      </div>

      {/* Most Selling Section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-800">Most Selling Products</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {mostSelling.map((p) => (
            <div key={p._id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="aspect-square rounded-xl bg-slate-50 mb-3 overflow-hidden relative">
                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  {p.totalSold || 0} SOLD
                </div>
              </div>
              <h3 className="font-bold text-slate-800 text-sm truncate">{p.name}</h3>
              <p className="text-blue-600 font-bold text-sm mt-1">৳{p.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {["All", ...categories.map(c => c.name)].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? "bg-slate-900 text-white shadow-lg" 
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            />
          </div>
        </div>

        {/* Product List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-[0.1em] font-black border-b border-slate-100">
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-100 flex-shrink-0">
                        <img src={p.image} className="h-full w-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{p.totalSold || 0} units sold</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">{p.productId || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-900 text-sm">৳{p.price}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${p.stock > 10 ? 'bg-emerald-500' : p.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                      <span className={`text-xs font-bold ${p.stock > 10 ? 'text-emerald-600' : p.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                        {p.stock} in stock
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setProductForm({
                            name: p.name,
                            description: p.description,
                            price: p.price,
                            category: p.category,
                            stock: p.stock,
                            image: p.image,
                            images: p.images || [],
                            productId: p.productId || "",
                          });
                          setIsProductModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="p-20 text-center text-slate-400">
              <Box className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold">No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsProductModalOpen(false)} />
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
            <div className="flex h-[80vh]">
              {/* Left Side: Images */}
              <div className="w-1/3 bg-slate-50 p-8 border-r border-slate-100 flex flex-col">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Visuals</h3>
                
                {/* Featured Image */}
                <div className="mb-6">
                  <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Featured Image</p>
                  <label className="block aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-white relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors">
                    {productForm.image ? (
                      <img src={productForm.image} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="text-[10px] font-bold uppercase">Upload</span>
                      </div>
                    )}
                    <input type="file" className="hidden" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], "featured")} />
                  </label>
                </div>

                {/* Gallery */}
                <div>
                  <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Gallery (Max 2 more)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {productForm.images.map((img, i) => (
                      <div key={i} className="aspect-square rounded-xl relative overflow-hidden border border-slate-200 group/item">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button 
                            type="button"
                            onClick={() => {
                              const oldFeatured = productForm.image;
                              setProductForm(p => ({
                                ...p,
                                image: img,
                                images: p.images.map((url, idx) => idx === i ? oldFeatured : url)
                              }));
                            }}
                            className="bg-white/20 backdrop-blur-md text-white p-1.5 rounded-lg hover:bg-white/40 transition-colors"
                            title="Make Featured"
                          >
                            <Star className="h-3 w-3 fill-white" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setProductForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                            className="bg-red-500/80 text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {productForm.images.length < 2 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-center cursor-pointer hover:border-blue-400">
                        <Plus className="h-4 w-4 text-slate-400" />
                        <input type="file" className="hidden" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], "gallery")} />
                      </label>
                    )}
                  </div>
                </div>
                
                {isUploading && (
                  <div className="mt-auto flex items-center gap-2 text-blue-600 font-bold text-xs">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>

              {/* Right Side: Form */}
              <div className="flex-1 p-10 overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900">{editingProduct ? 'Edit' : 'Create'} Product</h2>
                  <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Name</label>
                      <input
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-slate-800"
                        placeholder="e.g. Premium Leather Bag"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Price (৳)</label>
                      <input
                        required
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Stock</label>
                      <input
                        required
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div className="col-span-2 relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Category (Select or Type New)</label>
                      <div className="relative">
                        <input
                          required
                          list="cat-list"
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-slate-800"
                          placeholder="Search or Create Category..."
                        />
                        <datalist id="cat-list">
                          {categories.map(c => <option key={c._id} value={c.name} />)}
                        </datalist>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
                      <textarea
                        rows={4}
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-slate-800 resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsProductModalOpen(false)}
                      className="flex-1 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-widest text-xs"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                      {editingProduct ? 'Update Product' : 'Publish Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsCategoryModalOpen(false)} />
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900">Manage Categories</h2>
                <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>

              <div className="space-y-6">
                {/* List Categories */}
                <div className="max-h-60 overflow-y-auto no-scrollbar space-y-3">
                  {categories.map((c) => (
                    <div key={c._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-white overflow-hidden border border-slate-100">
                          {c.image && <img src={c.image} className="h-full w-full object-cover" alt="" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{c.name}</p>
                          <div className="flex gap-2">
                             {c.isFeaturedOnHome && <span className="text-[8px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase">Home Featured</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditingCategory(c)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(c._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-slate-100" />

                {/* Edit Form */}
                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                   <div className="flex justify-between items-center mb-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {editingCategory?._id ? 'Edit Category' : 'New Category'}
                     </p>
                     {editingCategory?._id && (
                       <button 
                        onClick={() => setEditingCategory({ name: "", image: "", isFeaturedOnHome: false })}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                       >
                         Reset to New
                       </button>
                     )}
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="col-span-2">
                       <input
                        value={editingCategory?.name || ""}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        placeholder="Category Name"
                        className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-slate-800"
                       />
                     </div>
                     <div className="flex items-center gap-4">
                        <label className="h-14 w-14 rounded-xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-center cursor-pointer hover:border-blue-400 relative overflow-hidden">
                          {editingCategory?.image ? <img src={editingCategory.image} className="w-full h-full object-cover" /> : <Upload className="h-4 w-4 text-slate-400" />}
                          <input type="file" className="hidden" onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], "category")} />
                        </label>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Category Image</span>
                     </div>
                     <div className="flex items-center justify-end gap-2">
                        <input 
                          type="checkbox" 
                          id="feat" 
                          checked={editingCategory?.isFeaturedOnHome || false}
                          onChange={(e) => setEditingCategory({ ...editingCategory, isFeaturedOnHome: e.target.checked })}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="feat" className="text-xs font-bold text-slate-600 cursor-pointer">Featured on Home</label>
                     </div>
                   </div>
                   <button 
                    onClick={handleSaveCategory}
                    className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all uppercase tracking-widest text-[10px]"
                   >
                     {editingCategory?._id ? 'Update Category' : 'Create Category'}
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
