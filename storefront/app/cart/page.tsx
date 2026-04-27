"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

const bdDistricts: { [key: string]: string[] } = {
  Dhaka: ["Dhaka", "Gazipur", "Narayanganj", "Tangail", "Faridpur", "Manikganj", "Munshiganj", "Rajbari", "Madaripur", "Gopalganj", "Narsingdi", "Shariatpur", "Kishoreganj"],
  Chattogram: ["Chattogram", "Cox's Bazar", "Cumilla", "Feni", "Brahmanbaria", "Noakhali", "Lakshmipur", "Chandpur", "Rangamati", "Khagrachari", "Bandarban"],
  Rajshahi: ["Rajshahi", "Pabna", "Bogra", "Naogaon", "Natore", "Chapai Nawabganj", "Sirajganj", "Joypurhat"],
  Khulna: ["Khulna", "Jashore", "Satkhira", "Meherpur", "Narail", "Chuadanga", "Kushtia", "Magura", "Bagerhat", "Jhenaidah"],
  Barishal: ["Barishal", "Bhola", "Patuakhali", "Pirojpur", "Jhalokati", "Barguna"],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  Rangpur: ["Rangpur", "Dinajpur", "Kurigram", "Gaibandha", "Nilphamari", "Panchagarh", "Thakurgaon", "Lalmonirhat"],
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
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "SSL" | "BKASH">("COD");
  const [orderNote, setOrderNote] = useState("");

  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    division: "",
    district: "",
    street: "",
  });

  const [billingAddress, setBillingAddress] = useState({
    name: "",
    phone: "",
    division: "",
    district: "",
    street: "",
  });

  const [useShippingForBilling, setUseShippingForBilling] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [isCouponOpen, setIsCouponOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses[0];
      setShippingAddress({
        name: defaultAddr.name || "",
        phone: defaultAddr.phone || "",
        division: defaultAddr.division || "",
        district: defaultAddr.district || "",
        street: defaultAddr.street || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (isClient && !user) {
      toast.error("Please log in or create an account to proceed.");
      router.push("/login?redirect=/cart");
    }
  }, [isClient, user, router]);

  const totalPrice = cartItems.reduce(
    (acc: number, item: any) => acc + item.price * item.quantity,
    0,
  );
  const shippingCost = totalPrice > 200 ? 0 : 15; // You can adjust this based on your logic
  const finalTotal = totalPrice + shippingCost;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    if (!user) {
      toast.error("Please login first to place an order");
      router.push("/login?redirect=/cart");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please agree to the Terms and Conditions, Privacy Policy & Refund Policy.");
      return;
    }

    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.division || !shippingAddress.district || !shippingAddress.street) {
      toast.error("Please fill all required shipping address fields.");
      return;
    }

    if (!useShippingForBilling && (!billingAddress.name || !billingAddress.phone || !billingAddress.division || !billingAddress.district || !billingAddress.street)) {
      toast.error("Please fill all required billing address fields.");
      return;
    }

    setIsCheckoutLoading(true);
    const loadingToast = toast.loading("Processing Order...");
    
    const finalShippingInfo = {
      ...shippingAddress,
      label: "Shipping",
    };

    const isAlreadySaved = user?.addresses?.some((a: any) => a.street === finalShippingInfo.street && a.district === finalShippingInfo.district);

    if (user && saveAddress && !isAlreadySaved) {
      try {
        const addrRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/address`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, address: finalShippingInfo }),
        });
        const addrData = await addrRes.json();
        if (addrData.success && addrData.addresses) {
          updateUser({ ...user, addresses: addrData.addresses });
        }
      } catch (error) {
        console.error("Failed to save address", error);
      }
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItems,
            customerEmail: user.email,
            shippingInfo: finalShippingInfo,
            allAddresses: [], // No longer sending all saved addresses to keep it clean
            paymentMethod: paymentMethod === "BKASH" ? "SSL" : paymentMethod, // Assuming Bkash goes through SSL
            totalAmount: finalTotal,
            orderNote,
          }),
        },
      );

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        if ((paymentMethod === "SSL" || paymentMethod === "BKASH") && data.gatewayUrl) {
          window.location.href = data.gatewayUrl;
        } else {
          clearCart();
          router.push(`/success?orderId=${data.orderId}`);
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
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#333] font-sans pb-20 pt-6">
      <main className="max-w-6xl mx-auto px-4 lg:px-0">
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT COLUMN */}
          <div className="flex-1 space-y-6">
            
            {/* Order Review */}
            <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-black rounded-full"></div>
                <h2 className="text-base font-bold">Order review</h2>
              </div>
              
              <div className="space-y-4">
                {cartItems.map((item: any) => (
                  <div key={item._id} className="flex gap-4 items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-md border p-1 shrink-0">
                        <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">{item.name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-500">Qty:</span>
                          <div className="flex items-center bg-gray-100 rounded-md px-2 py-1">
                            <button onClick={() => decreaseQuantity(item._id)} className="text-black font-bold px-1"><Minus size={14} /></button>
                            <span className="w-6 text-center font-medium">{item.quantity}</span>
                            <button onClick={() => increaseQuantity(item._id)} className="text-black font-bold px-1" disabled={item.quantity >= (item.stock || 999)}><Plus size={14} /></button>
                          </div>
                          <span className="font-bold ml-2">৳{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item._id)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {cartItems.length === 0 && (
                  <p className="text-sm text-gray-500">Your cart is empty.</p>
                )}
              </div>
            </section>

            {/* Shipping Address */}
            <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-black rounded-full"></div>
                <h2 className="text-base font-bold">Shipping Address</h2>
              </div>

              {user && user.addresses && user.addresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold mb-3 text-gray-800">Saved Addresses</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {user.addresses.map((addr: any, idx: number) => {
                      const isSelected = shippingAddress.street === addr.street && shippingAddress.district === addr.district;
                      return (
                        <div 
                          key={idx}
                          onClick={() => setShippingAddress({
                            name: addr.name || "",
                            phone: addr.phone || "",
                            division: addr.division || "",
                            district: addr.district || "",
                            street: addr.street || "",
                          })}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin size={14} className={isSelected ? 'text-black' : 'text-gray-500'} />
                            <span className="text-xs font-bold uppercase tracking-widest">{addr.label || 'Address'}</span>
                            {isSelected && <CheckCircle2 size={14} className="ml-auto text-black" />}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mt-2">{addr.street}, {addr.district}</p>
                        </div>
                      );
                    })}
                    <div 
                      onClick={() => setShippingAddress({ name: "", phone: "", division: "", district: "", street: "" })}
                      className={`p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center min-h-[80px] ${!shippingAddress.street ? 'border-black bg-gray-50 text-black' : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-black'}`}
                    >
                      <Plus size={20} className="mb-1" />
                      <span className="text-xs font-bold uppercase tracking-widest">New Address</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Your Full Name *" 
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                  />
                  <div className="flex w-full">
                    <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-md px-4 py-2.5 text-sm text-gray-600 flex items-center justify-center">88</span>
                    <input 
                      type="text" 
                      placeholder="017********" 
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-r-md px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select 
                    value={shippingAddress.division}
                    onChange={(e) => setShippingAddress({...shippingAddress, division: e.target.value, district: ""})}
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-black bg-white"
                  >
                    <option value="">Select Division *</option>
                    {Object.keys(bdDistricts).map(div => <option key={div} value={div}>{div}</option>)}
                  </select>
                  <select 
                    value={shippingAddress.district}
                    onChange={(e) => setShippingAddress({...shippingAddress, district: e.target.value})}
                    disabled={!shippingAddress.division}
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-black bg-white disabled:opacity-50"
                  >
                    <option value="">Select District *</option>
                    {shippingAddress.division && bdDistricts[shippingAddress.division].map(dist => <option key={dist} value={dist}>{dist}</option>)}
                  </select>
                </div>

                <textarea 
                  placeholder="ex: House no. / building / street / area *"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-black resize-none min-h-[80px]"
                ></textarea>

                {user && (
                  <label className="flex items-center gap-2 cursor-pointer text-sm mt-2">
                    <input 
                      type="checkbox" 
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="w-4 h-4 accent-black rounded cursor-pointer" 
                    />
                    <span className="text-gray-600">Save this address to my account for future use</span>
                  </label>
                )}
              </div>
            </section>

            {/* Billing Address */}
            <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-black rounded-full"></div>
                  <h2 className="text-base font-bold">Billing Address</h2>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input 
                    type="checkbox" 
                    checked={useShippingForBilling}
                    onChange={(e) => setUseShippingForBilling(e.target.checked)}
                    className="w-4 h-4 accent-black rounded cursor-pointer" 
                  />
                  <span className="text-gray-600 hidden sm:inline">Same as shipping</span>
                </label>
              </div>

              {!useShippingForBilling && (
                <div className="space-y-4 mt-4">
                  {user && user.addresses && user.addresses.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-bold mb-3 text-gray-800">Saved Addresses</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {user.addresses.map((addr: any, idx: number) => {
                          const isSelected = billingAddress.street === addr.street && billingAddress.district === addr.district;
                          return (
                            <div 
                              key={idx}
                              onClick={() => setBillingAddress({
                                name: addr.name || "",
                                phone: addr.phone || "",
                                division: addr.division || "",
                                district: addr.district || "",
                                street: addr.street || "",
                              })}
                              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin size={14} className={isSelected ? 'text-black' : 'text-gray-500'} />
                                <span className="text-xs font-bold uppercase tracking-widest">{addr.label || 'Address'}</span>
                                {isSelected && <CheckCircle2 size={14} className="ml-auto text-black" />}
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2 mt-2">{addr.street}, {addr.district}</p>
                            </div>
                          );
                        })}
                        <div 
                          onClick={() => setBillingAddress({ name: "", phone: "", division: "", district: "", street: "" })}
                          className={`p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center min-h-[80px] ${!billingAddress.street ? 'border-black bg-gray-50 text-black' : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-black'}`}
                        >
                          <Plus size={20} className="mb-1" />
                          <span className="text-xs font-bold uppercase tracking-widest">New Address</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Your Full Name *" 
                      value={billingAddress.name}
                      onChange={(e) => setBillingAddress({...billingAddress, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                    />
                    <div className="flex w-full">
                      <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-md px-4 py-2.5 text-sm text-gray-600 flex items-center justify-center">88</span>
                      <input 
                        type="text" 
                        placeholder="017********" 
                        value={billingAddress.phone}
                        onChange={(e) => setBillingAddress({...billingAddress, phone: e.target.value})}
                        className="w-full border border-gray-300 rounded-r-md px-4 py-2.5 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select 
                      value={billingAddress.division}
                      onChange={(e) => setBillingAddress({...billingAddress, division: e.target.value, district: ""})}
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-black bg-white"
                    >
                      <option value="">Select Division *</option>
                      {Object.keys(bdDistricts).map(div => <option key={div} value={div}>{div}</option>)}
                    </select>
                    <select 
                      value={billingAddress.district}
                      onChange={(e) => setBillingAddress({...billingAddress, district: e.target.value})}
                      disabled={!billingAddress.division}
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-black bg-white disabled:opacity-50"
                    >
                      <option value="">Select District *</option>
                      {billingAddress.division && bdDistricts[billingAddress.division].map(dist => <option key={dist} value={dist}>{dist}</option>)}
                    </select>
                  </div>

                  <textarea 
                    placeholder="ex: House no. / building / street / area *"
                    value={billingAddress.street}
                    onChange={(e) => setBillingAddress({...billingAddress, street: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-black resize-none min-h-[80px]"
                  ></textarea>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full lg:w-[400px] space-y-6">
            
            {/* Payment Method */}
            <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-black rounded-full"></div>
                <h2 className="text-base font-bold">Payment method</h2>
              </div>

              <div className="space-y-3">
                <label className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-50 rounded text-xl">
                      💵
                    </div>
                    <span className="text-sm font-medium">Cash On Delivery</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'COD' ? 'border-black bg-black text-white' : 'border-gray-300'}`}>
                    {paymentMethod === 'COD' && <CheckCircle2 size={14} />}
                  </div>
                </label>



                <label className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${paymentMethod === 'BKASH' ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-pink-50 rounded text-pink-600 font-bold overflow-hidden">
                      {/* Placeholder for Bkash logo */}
                      <span className="text-[10px] leading-tight">bKash</span>
                    </div>
                    <span className="text-sm font-medium">Bkash</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'BKASH' ? 'border-black bg-black text-white' : 'border-gray-300'}`}>
                    {paymentMethod === 'BKASH' && <CheckCircle2 size={14} />}
                  </div>
                </label>
              </div>
            </section>

            {/* Coupon & Summary Wrapper */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              
              {/* Coupon Accordion */}
              <div className="border-b border-gray-100 pb-4 mb-4">
                <button 
                  onClick={() => setIsCouponOpen(!isCouponOpen)}
                  className="w-full flex items-center justify-between text-sm font-bold text-gray-800"
                >
                  Have any coupon or gift voucher?
                  {isCouponOpen ? <ChevronUp size={16} className="text-black" /> : <ChevronDown size={16} className="text-black" />}
                </button>
                {isCouponOpen && (
                  <div className="mt-3 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
                    />
                    <button className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-black transition">Apply</button>
                  </div>
                )}
              </div>

              {/* Summary Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Sub total</span>
                  <span className="font-medium text-gray-800">৳{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Delivery cost</span>
                  <span className="font-medium text-gray-800">{shippingCost === 0 ? "৳0.00" : `৳${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-gray-900">৳{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Special Notes */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-3 bg-black rounded-full"></div>
                  <label className="text-sm font-bold text-gray-800">Special notes <span className="text-xs font-normal text-gray-500">(Optional)</span></label>
                </div>
                <textarea 
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black min-h-[80px] resize-none"
                ></textarea>
              </div>

              {/* T&C */}
              <div className="mb-6">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-black rounded cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    I have read and agree to the <a href="#" className="text-black hover:underline">Terms and Conditions</a>, <a href="#" className="text-black hover:underline">Privacy Policy</a> & <a href="#" className="text-black hover:underline">Refund and Return Policy</a>.
                  </span>
                </label>
              </div>

              {/* Place Order Button */}
              <button 
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
                className="w-full bg-black text-white font-bold py-3 rounded-md hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
              >
                {isCheckoutLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "PLACE ORDER"
                )}
              </button>
              
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
