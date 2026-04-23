import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Search,
  Plus,
  Eye,
  UploadCloud,
  X,
  Filter,
  FileSpreadsheet,
  Box,
  Trash2,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modal States
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"single" | "bulk">("single");

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);

  // Single Upload Form State
  const [uploadForm, setUploadForm] = useState({
    name: "",
    price: "",
    currency: "USD",
    category: "",
    customCategory: "",
    description: "",
    stock: "",
    image: "",
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fuzzyMatch = (str: string, query: string) => {
    if (!str) return false;
    const s = str.toLowerCase().replace(/\s+/g, "");
    const q = query.toLowerCase().replace(/\s+/g, "");
    let qIdx = 0;
    for (let i = 0; i < s.length; i++) {
      if (s[i] === q[qIdx]) qIdx++;
      if (qIdx === q.length) return true;
    }
    return false;
  };

  const getCurrencySymbol = (currencyCode: string) => {
    if (currencyCode === "BDT") return "৳";
    if (currencyCode === "EUR") return "€";
    return "$";
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchQuery === "" ||
        fuzzyMatch(product.name, searchQuery) ||
        fuzzyMatch(product.category || "", searchQuery) ||
        (product._id &&
          product._id.slice(-6).includes(searchQuery.toLowerCase()));

      const matchesCategory =
        categoryFilter === "" || product.category === categoryFilter;

      let matchesPrice = true;
      if (priceFilter === "under50") matchesPrice = product.price < 50;
      if (priceFilter === "50to200")
        matchesPrice = product.price >= 50 && product.price <= 200;
      if (priceFilter === "over200") matchesPrice = product.price > 200;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchQuery, categoryFilter, priceFilter]);

  const uniqueCategories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean)),
  );

  const handleViewDetails = (product: any) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  // ================= DELETE PRODUCT =================
  const handleDeleteProduct = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    )
      return;

    const toastId = toast.loading("Deleting product...");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/products/${id}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Product deleted successfully!", { id: toastId });
        setIsDetailsModalOpen(false);
        fetchProducts();
      } else {
        toast.error(data.message || "Failed to delete!", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error!", { id: toastId });
    }
  };

  // ================= OPEN EDIT MODAL =================
  const handleOpenEdit = (product: any) => {
    setEditForm({ ...product });
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(true);
  };

  // ================= EDIT IMAGE UPLOAD =================
  const handleEditImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Missing Cloudinary config in .env file!");
      return;
    }

    setIsUploadingEditImage(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);
    data.append("cloud_name", cloudName);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: data,
        },
      );
      const uploadedImage = await res.json();

      if (uploadedImage.secure_url) {
        setEditForm((prev: any) => ({
          ...prev,
          image: uploadedImage.secure_url,
        }));
        toast.success("New image uploaded!");
      } else {
        toast.error("Image upload failed!");
      }
    } catch (error) {
      toast.error("Network error during image upload!");
    } finally {
      setIsUploadingEditImage(false);
    }
  };

  // ================= SUBMIT EDIT FORM =================
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Updating product...");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/products/${editForm._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editForm.name,
            price: Number(editForm.price),
            currency: editForm.currency,
            category: editForm.category,
            stock: Number(editForm.stock),
            description: editForm.description,
            image: editForm.image, // Updated image link
          }),
        },
      );
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Product updated successfully!", { id: toastId });
        setIsEditModalOpen(false);
        fetchProducts();
      } else {
        toast.error(data.message || "Failed to update!", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error!", { id: toastId });
    }
  };

  // ================= UPLOAD NEW IMAGE (SINGLE) =================
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Missing Cloudinary config in .env file!");
      return;
    }

    setIsUploadingImage(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);
    data.append("cloud_name", cloudName);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: data,
        },
      );
      const uploadedImage = await res.json();

      if (uploadedImage.secure_url) {
        setUploadForm((prev) => ({ ...prev, image: uploadedImage.secure_url }));
        toast.success("Image uploaded!");
      } else {
        toast.error("Image upload failed! Check preset settings.");
      }
    } catch (error) {
      toast.error("Network error during image upload!");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // ================= SUBMIT NEW PRODUCT (SINGLE) =================
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadForm.image) {
      toast.error("Please upload an image first!");
      return;
    }

    const toastId = toast.loading("Publishing product...");

    try {
      const productData = {
        ...uploadForm,
        price: Number(uploadForm.price),
        stock: Number(uploadForm.stock || 0),
        category:
          uploadForm.category === "Others"
            ? uploadForm.customCategory
            : uploadForm.category,
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Product published successfully!", { id: toastId });
        setIsUploadModalOpen(false);
        fetchProducts();

        setUploadForm({
          name: "",
          price: "",
          currency: "USD",
          category: "",
          customCategory: "",
          description: "",
          stock: "",
          image: "",
        });
      } else {
        toast.error(data.message || "Failed to publish!", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error!", { id: toastId });
    }
  };

  // ================= BULK UPLOAD =================
  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = event.target?.result;
      if (!data) return;

      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawProducts: any[] = XLSX.utils.sheet_to_json(worksheet);

      const productsToUpload = rawProducts.map((item) => ({
        ...item,
        price: Number(item.price || 0),
        stock: Number(item.stock || 0),
      }));

      if (productsToUpload.length === 0) {
        toast.error("File is empty or invalid format!");
        return;
      }

      const toastId = toast.loading(
        `Uploading ${productsToUpload.length} products...`,
      );
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/products/bulk`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ products: productsToUpload }),
          },
        );
        const responseData = await res.json();

        if (responseData.success) {
          toast.success(responseData.message, { id: toastId });
          setIsUploadModalOpen(false);
          fetchProducts();
        } else {
          toast.error("Upload failed!", { id: toastId });
        }
      } catch (error) {
        toast.error("Network error!", { id: toastId });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // ================= EXCEL TEMPLATE DOWNLOAD =================
  const downloadExcelTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    const templateData = [
      {
        name: "Example Smartwatch",
        category: "Electronics",
        price: 2500,
        currency: "BDT",
        stock: 50,
        description: "This is an example product description.",
        image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Product_Upload_Template.xlsx");
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen relative">
      {/* Header & New Product Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-600" />
            Product Management
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your inventory, pricing, and product details.
          </p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
        >
          <Plus className="h-5 w-5" /> Add New Product
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, Name or Category (Typo tolerant)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 appearance-none"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat as string} value={cat as string}>
                  {cat as string}
                </option>
              ))}
            </select>
          </div>
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
          >
            <option value="">Any Price</option>
            <option value="under50">Under $50</option>
            <option value="50to200">$50 - $200</option>
            <option value="over200">Over $200</option>
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-bold">Product ID</th>
                <th className="p-4 font-bold">Product Name</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Unit Price</th>
                <th className="p-4 font-bold">Stock</th>
                <th className="p-4 font-bold">Total Sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">
                    No products found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product._id}
                    onClick={() => handleViewDetails(product)}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 font-mono text-xs text-slate-500">
                      #{product._id.slice(-8)}
                    </td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center p-1">
                        <img
                          src={product.image}
                          alt=""
                          className="max-h-full max-w-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {product.name}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 font-black text-slate-900">
                      {getCurrencySymbol(product.currency || "USD")}
                      {product.price}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-bold ${product.stock > 10 ? "text-emerald-600" : product.stock > 0 ? "text-amber-500" : "text-red-500"}`}
                      >
                        {product.stock} left
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-500">
                      {product.totalSold || 0} times
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Product Details Pop-up (With Edit & Delete Buttons) */}
      {isDetailsModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header with Edit & Delete */}
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" /> Product Details
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenEdit(selectedProduct)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-bold transition-colors"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(selectedProduct._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-lg text-sm font-bold transition-colors"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 bg-slate-50 rounded-xl p-4 flex items-center justify-center">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="max-h-48 object-contain mix-blend-multiply"
                />
              </div>
              <div className="w-full md:w-2/3 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                    Product ID: #{selectedProduct._id}
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">
                    {selectedProduct.name}
                  </h3>
                  <span className="inline-block mt-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {selectedProduct.category}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {selectedProduct.description}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Unit Price
                    </p>
                    <p className="text-2xl font-black text-emerald-600">
                      {getCurrencySymbol(selectedProduct.currency || "USD")}
                      {selectedProduct.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Available Stock
                    </p>
                    <p className="text-xl font-bold text-slate-800">
                      {selectedProduct.stock} Units
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Product */}
      {isEditModalOpen && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Pencil className="h-5 w-5 text-blue-600" /> Edit Product
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Category
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({ ...editForm, category: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editForm.stock}
                      onChange={(e) =>
                        setEditForm({ ...editForm, stock: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1 flex gap-2">
                    <div className="w-1/3">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Currency
                      </label>
                      <select
                        value={editForm.currency || "USD"}
                        onChange={(e) =>
                          setEditForm({ ...editForm, currency: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="BDT">BDT (৳)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                    <div className="w-2/3">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Unit Price
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm({ ...editForm, price: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Update Product Image
                    </label>
                    <label
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors overflow-hidden relative ${editForm.image ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"}`}
                    >
                      {isUploadingEditImage ? (
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                          <span className="text-xs font-bold text-slate-500">
                            Uploading new image...
                          </span>
                        </div>
                      ) : editForm.image ? (
                        <>
                          <img
                            src={editForm.image}
                            alt="Preview"
                            className="h-full object-contain p-2 mix-blend-multiply"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold bg-slate-900/80 px-3 py-1 rounded">
                              Upload Different Image
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-8 w-8 text-slate-400 mb-1" />
                          <span className="text-xs font-bold text-slate-500">
                            Click to replace image
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleEditImageUpload}
                        disabled={isUploadingEditImage}
                      />
                    </label>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <div className="flex justify-between">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Description
                      </label>
                    </div>
                    <textarea
                      maxLength={300}
                      required
                      rows={3}
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors mt-4"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Upload Product (Single & Bulk) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-blue-600" /> Upload
                Products
              </h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-4 gap-6">
              <button
                onClick={() => setUploadMode("single")}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${uploadMode === "single" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              >
                <span className="flex items-center gap-2">
                  <Box className="h-4 w-4" /> Single Upload
                </span>
              </button>
              <button
                onClick={() => setUploadMode("bulk")}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${uploadMode === "bulk" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" /> Bulk Upload
                  (CSV/Excel)
                </span>
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {uploadMode === "single" ? (
                <form onSubmit={handleUploadSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Product Name
                      </label>
                      <input
                        type="text"
                        required
                        value={uploadForm.name}
                        onChange={(e) =>
                          setUploadForm({ ...uploadForm, name: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Category
                      </label>
                      <select
                        value={uploadForm.category}
                        onChange={(e) =>
                          setUploadForm({
                            ...uploadForm,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Category</option>
                        {uniqueCategories.map((cat) => (
                          <option key={cat as string} value={cat as string}>
                            {cat as string}
                          </option>
                        ))}
                        <option value="Others">Others (Type custom)</option>
                      </select>
                      {uploadForm.category === "Others" && (
                        <input
                          type="text"
                          placeholder="Type new category..."
                          required
                          value={uploadForm.customCategory}
                          onChange={(e) =>
                            setUploadForm({
                              ...uploadForm,
                              customCategory: e.target.value,
                            })
                          }
                          className="w-full mt-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={uploadForm.stock}
                        onChange={(e) =>
                          setUploadForm({
                            ...uploadForm,
                            stock: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-1 flex gap-2">
                      <div className="w-1/3">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                          Currency
                        </label>
                        <select
                          value={uploadForm.currency}
                          onChange={(e) =>
                            setUploadForm({
                              ...uploadForm,
                              currency: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="BDT">BDT (৳)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>
                      <div className="w-2/3">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                          Unit Price
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={uploadForm.price}
                          onChange={(e) =>
                            setUploadForm({
                              ...uploadForm,
                              price: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Product Image
                      </label>
                      <label
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors overflow-hidden relative ${uploadForm.image ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100"}`}
                      >
                        {isUploadingImage ? (
                          <div className="flex flex-col items-center">
                            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <span className="text-xs font-bold text-slate-500">
                              Uploading to Cloudinary...
                            </span>
                          </div>
                        ) : uploadForm.image ? (
                          <>
                            <img
                              src={uploadForm.image}
                              alt="Preview"
                              className="h-full object-contain p-2 mix-blend-multiply"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <span className="text-white text-xs font-bold bg-slate-900/80 px-3 py-1 rounded">
                                Change Image
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="h-8 w-8 text-slate-400 mb-1" />
                            <span className="text-xs font-bold text-slate-500">
                              Click to upload image
                            </span>
                          </>
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={isUploadingImage}
                        />
                      </label>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <div className="flex justify-between">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                          Description
                        </label>
                        <span className="text-xs font-bold text-slate-400">
                          {uploadForm.description.length}/300 characters
                        </span>
                      </div>
                      <textarea
                        maxLength={300}
                        required
                        rows={3}
                        value={uploadForm.description}
                        onChange={(e) =>
                          setUploadForm({
                            ...uploadForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-colors mt-4"
                  >
                    Publish Product
                  </button>
                </form>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
                  <FileSpreadsheet className="h-16 w-16 text-slate-400 mb-4" />
                  <h3 className="text-lg font-bold text-slate-800">
                    Upload CSV / Excel File
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 text-center max-w-xs">
                    Upload a file containing multiple products to add them to
                    your inventory instantly.
                  </p>

                  <label className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md cursor-pointer inline-flex items-center gap-2">
                    <UploadCloud className="h-5 w-5" />
                    Select CSV or Excel File
                    <input
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      className="hidden"
                      onChange={handleBulkUpload}
                    />
                  </label>

                  <a
                    href="#"
                    onClick={downloadExcelTemplate}
                    className="text-blue-600 text-sm font-bold mt-4 hover:underline"
                  >
                    Download Excel Template
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
