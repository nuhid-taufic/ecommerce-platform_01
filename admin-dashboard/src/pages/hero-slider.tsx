"use client";

import React, { useEffect, useState } from "react";
import { Star, Loader2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminHeroControl() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products.reverse());
      }
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Toggle Featured Status
  // Toggle Featured Status
  const toggleFeature = async (id: string, currentStatus: boolean) => {
    try {
      // LocalStorage theke token nawa hocche (apnar system onujayi token er nam vul hole ektu thik kore niben)
      const token =
        localStorage.getItem("token") ||
        JSON.parse(localStorage.getItem("user") || "{}")?.token;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/products/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Token pathano hocche
          },
          body: JSON.stringify({ isFeaturedHero: !currentStatus }),
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success(
          currentStatus ? "Removed from Hero Slider" : "Added to Hero Slider!",
        );
        fetchProducts(); // Refresh data
      } else {
        toast.error(data.message || "Failed to update product");
        console.error("Update Error:", data);
      }
    } catch (error) {
      toast.error("Something went wrong!");
      console.error("Network Error:", error);
    }
  };

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  const featuredCount = products.filter((p) => p.isFeaturedHero).length;

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hero Slider Control</h1>
        <p className="text-gray-500">
          Select up to 3 products to display on the homepage animated slider.
          (Currently selected: {featuredCount})
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm w-full">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-widest text-[10px] font-bold">
            <tr>
              <th className="p-4">Product Image</th>
              <th className="p-4">Name & Category</th>
              <th className="p-4">Price</th>
              <th className="p-4 text-center">Hero Slider Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr
                key={product._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="p-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <ImageIcon className="text-gray-300" />
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-medium text-black">{product.name}</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {product.category}
                  </p>
                </td>
                <td className="p-4 font-medium">${product.price}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() =>
                      toggleFeature(product._id, product.isFeaturedHero)
                    }
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 mx-auto transition-all ${product.isFeaturedHero ? "bg-black text-white hover:bg-gray-800" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  >
                    <Star
                      className={`h-4 w-4 ${product.isFeaturedHero ? "fill-white" : ""}`}
                    />
                    {product.isFeaturedHero ? "Featured" : "Make Featured"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
