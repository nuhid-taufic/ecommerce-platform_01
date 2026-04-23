"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
  Loader2,
  Truck,
  PlusCircle,
  CheckCircle2,
  MapPin,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

const bdDistricts: { [key: string]: string[] } = {
  Dhaka: [
    "Dhaka",
    "Gazipur",
    "Narayanganj",
    "Tangail",
    "Faridpur",
    "Manikganj",
    "Munshiganj",
    "Rajbari",
    "Madaripur",
    "Gopalganj",
    "Narsingdi",
    "Shariatpur",
    "Kishoreganj",
  ],
  Chattogram: [
    "Chattogram",
    "Cox's Bazar",
    "Cumilla",
    "Feni",
    "Brahmanbaria",
    "Noakhali",
    "Lakshmipur",
    "Chandpur",
    "Rangamati",
    "Khagrachari",
    "Bandarban",
  ],
  Rajshahi: [
    "Rajshahi",
    "Pabna",
    "Bogra",
    "Naogaon",
    "Natore",
    "Chapai Nawabganj",
    "Sirajganj",
    "Joypurhat",
  ],
  Khulna: [
    "Khulna",
    "Jashore",
    "Satkhira",
    "Meherpur",
    "Narail",
    "Chuadanga",
    "Kushtia",
    "Magura",
    "Bagerhat",
    "Jhenaidah",
  ],
  Barishal: [
    "Barishal",
    "Bhola",
    "Patuakhali",
    "Pirojpur",
    "Jhalokati",
    "Barguna",
  ],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  Rangpur: [
    "Rangpur",
    "Dinajpur",
    "Kurigram",
    "Gaibandha",
    "Nilphamari",
    "Panchagarh",
    "Thakurgaon",
    "Lalmonirhat",
  ],
  Mymensingh: ["Mymensingh", "Netrokona", "Jamalpur", "Sherpur"],
};

export default function CartPage() {
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCartStore();
  const [isClient, setIsClient] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const { user, updateUser } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "SSL">("SSL");

  // Address Management States
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<
    number | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [newAddress, setNewAddress] = useState({
    label: "",
    name: "",
    phone: "",
    apartment: "",
    street: "",
    division: "",
    district: "",
    postcode: "",
  });

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (user) {
      const userAddresses = user.addresses || [];
      setSavedAddresses(userAddresses);
      if (userAddresses.length > 0) {
        setSelectedAddressIndex(0);
      }
    }
  }, [user]);

  const totalPrice = cartItems.reduce(
    (acc: number, item: any) => acc + item.price * item.quantity,
    0,
  );
  const shippingCost = totalPrice > 200 ? 0 : 15;
  const finalTotal = totalPrice + shippingCost;

  const handleSaveNewAddress = async () => {
    if (
      !newAddress.name ||
      !newAddress.phone ||
      !newAddress.street ||
      !newAddress.district ||
      !newAddress.division
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (!user) {
      toast.error("Please log in to save addresses.");
      return;
    }

    const addressToSave = { ...newAddress, label: newAddress.label || "Other" };
    const loadingToast = toast.loading("Saving address...");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/address`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, address: addressToSave }),
        },
      );

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message, { id: loadingToast });

        // Update local states
        const updatedAddresses = data.addresses;
        setSavedAddresses(updatedAddresses);
        setSelectedAddressIndex(updatedAddresses.length - 1);
        updateUser({ ...user, addresses: updatedAddresses });

        setIsModalOpen(false);
        setNewAddress({
          label: "",
          name: "",
          phone: "",
          apartment: "",
          street: "",
          division: "",
          district: "",
          postcode: "",
        });
      } else {
        toast.error(data.message || "Failed to save address", {
          id: loadingToast,
        });
      }
    } catch (error) {
      toast.error("Network error while saving address.", { id: loadingToast });
    }
  };

  const handleInitiateCheckout = () => {
    if (cartItems.length === 0) return;
    if (!user) {
      toast.error("Please login first");
      router.push("/login?redirect=/cart");
      return;
    }
    if (selectedAddressIndex === null || savedAddresses.length === 0) {
      toast.error("Please select a shipping address.");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);

    if (selectedAddressIndex === null) {
      toast.error("Please select a shipping address first.");
      return;
    }

    setIsCheckoutLoading(true);
    const loadingToast = toast.loading("Processing Order...");
    const selectedShippingInfo = savedAddresses[selectedAddressIndex];
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItems,
            customerEmail: user.email,
            shippingInfo: selectedShippingInfo,
            allAddresses: savedAddresses,
            paymentMethod,
            totalAmount: finalTotal,
          }),
        },
      );

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        if (paymentMethod === "SSL" && data.gatewayUrl) {
          window.location.href = data.gatewayUrl;
        } else {
          clearCart();
          router.push("/success");
        }
      } else {
        toast.error(data.message || "Failed to process order");
        setIsCheckoutLoading(false);
      }
    } catch (error) {
      toast.error("Checkout failed. Check server connection.");
      setIsCheckoutLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#111] flex flex-col font-sans relative">
      <main className="max-w-7xl mx-auto w-full px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-12">Checkout.</h1>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* LEFT: Shipping & Items */}
          <div className="flex-1 space-y-12">
            {/* 1. Address Selection */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <MapPin size={16} /> Shipping Information
              </h2>

              <div className="space-y-2">
                {savedAddresses.map((addr, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors border border-transparent ${selectedAddressIndex === idx ? "bg-gray-100 border-gray-200" : "hover:bg-gray-50"}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressIndex === idx}
                      onChange={() => setSelectedAddressIndex(idx)}
                      className="mt-1 accent-black w-4 h-4 cursor-pointer shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-sm text-black">
                          {addr.name}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 bg-gray-200 px-2 py-0.5 rounded-sm">
                          {addr.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {addr.apartment ? `${addr.apartment}, ` : ""}
                        {addr.street}
                        <br />
                        {addr.district}, {addr.division} {addr.postcode}
                        <br />
                        {addr.phone}
                      </p>
                    </div>
                  </label>
                ))}

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors py-4 px-4"
                >
                  <PlusCircle size={14} /> Add New Address
                </button>
              </div>
            </section>

            {/* 2. Review Items (Added quantity and delete buttons back) */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-6">
                Review Bag
              </h2>
              <div className="space-y-4">
                {cartItems.map((item: any) => (
                  <div
                    key={item._id}
                    className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
                  >
                    <div className="w-20 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={item.image}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-sm font-bold line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        ${item.price.toFixed(2)}
                      </p>

                      {/* Quantity Adjusters Restored */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center border border-gray-200 rounded-full px-2 py-0.5">
                          <button
                            onClick={() => decreaseQuantity(item._id)}
                            className="p-1 hover:bg-gray-50 rounded-full transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item._id)}
                            className="p-1 hover:bg-gray-50 rounded-full transition-colors disabled:opacity-50"
                            disabled={item.quantity >= (item.stock || 999)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: Summary & Payment */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm sticky top-28">
              <h2 className="text-xl font-bold mb-8">Summary</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-black text-right">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                  <span>Shipping</span>
                  <span className="text-black text-right">
                    {shippingCost === 0
                      ? "FREE"
                      : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-gray-50">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Grand Total
                  </span>
                  <span className="text-3xl font-black tracking-tight text-right">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Methods Restored to the liked Radio Button Design */}
              <div className="space-y-3 mb-8">
                <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-4">
                  Payment Method
                </h3>
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === "SSL" ? "border-black bg-white shadow-sm" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "SSL"}
                    onChange={() => setPaymentMethod("SSL")}
                    className="accent-black w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-medium">
                    Online Payment (SSL)
                  </span>
                </label>
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === "COD" ? "border-black bg-white shadow-sm" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="accent-black w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm font-medium">Cash on Delivery</span>
                </label>
              </div>

              <button
                onClick={handleInitiateCheckout}
                disabled={isCheckoutLoading}
                className="w-full bg-black text-white py-5 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                {isCheckoutLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  "Complete Purchase"
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                <ShieldCheck size={14} /> Secure & Encrypted
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Address Form Pop-up (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8 md:p-10">
              <h3 className="text-2xl font-bold mb-8">Add New Address</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Address Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Home, Office, Studio"
                    value={newAddress.label}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, label: e.target.value })
                    }
                    className="w-full border-b py-2 focus:border-black outline-none text-sm transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={newAddress.name}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, name: e.target.value })
                    }
                    className="w-full border-b py-2 focus:border-black outline-none text-sm transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, phone: e.target.value })
                    }
                    className="w-full border-b py-2 focus:border-black outline-none text-sm transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Apt / Floor / Suite
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={newAddress.apartment}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        apartment: e.target.value,
                      })
                    }
                    className="w-full border-b py-2 focus:border-black outline-none text-sm transition-colors"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Street Address
                  </label>
                  <input
                    type="text"
                    placeholder="House, Road, Area..."
                    value={newAddress.street}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, street: e.target.value })
                    }
                    className="w-full border-b py-2 focus:border-black outline-none text-sm transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Division
                  </label>
                  <select
                    value={newAddress.division}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        division: e.target.value,
                        district: "",
                      })
                    }
                    className="w-full border-b py-2 focus:border-black outline-none text-sm bg-transparent cursor-pointer"
                  >
                    <option value="">Select Division</option>
                    {Object.keys(bdDistricts).map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    District
                  </label>
                  <select
                    disabled={!newAddress.division}
                    value={newAddress.district}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, district: e.target.value })
                    }
                    className="w-full border-b py-2 focus:border-black outline-none text-sm bg-transparent cursor-pointer disabled:opacity-40"
                  >
                    <option value="">Select District</option>
                    {newAddress.division &&
                      bdDistricts[newAddress.division].map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={newAddress.postcode}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, postcode: e.target.value })
                    }
                    className="w-full border-b py-2 focus:border-black outline-none text-sm transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveNewAddress}
                className="w-full mt-10 bg-black text-white py-5 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-900 transition-all active:scale-[0.99]"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-black" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Confirm Order</h3>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              You are about to place an order for {cartItems.length}{" "}
              {cartItems.length === 1 ? "item" : "items"} totaling{" "}
              <strong className="text-black">${finalTotal.toFixed(2)}</strong>.
              Do you want to proceed?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 bg-gray-100 text-black py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  handleCheckout();
                }}
                className="flex-1 bg-black text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
