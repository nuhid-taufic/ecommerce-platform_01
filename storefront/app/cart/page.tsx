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
import { useSettingsStore } from "@/store/settingsStore";

import { bdDistricts, bdUpazilas } from "@/utils/bd-data";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCartStore();
  const { settings } = useSettingsStore();

  const cartItems = items || [];
  const [isClient, setIsClient] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const { user, updateUser } = useAuthStore();
  const [paymentMethod, setPaymentMethod] = useState<"Cash on Delivery" | "Bkash" | "Nagad" | "Rocket">("Cash on Delivery");
  const [transactionId, setTransactionId] = useState("");
  const [orderNote, setOrderNote] = useState("");

  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    district: "Dhaka",
    thana: "",
    addressLine: "",
  });

  const [billingAddress, setBillingAddress] = useState({
    name: "",
    phone: "",
    district: "Dhaka",
    thana: "",
    addressLine: "",
  });

  const [useShippingForBilling, setUseShippingForBilling] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [deliveryZone, setDeliveryZone] = useState("Inside Dhaka");

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses[0];
      setShippingAddress({
        name: defaultAddr.name || user.name || "",
        phone: "", // Do not autofill phone number
        district: defaultAddr.district || "Dhaka",
        thana: defaultAddr.thana || "",
        addressLine: defaultAddr.addressLine || defaultAddr.street || "",
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
  
  const insideCityRate = settings?.shippingInsideCity ?? 60;
  const outsideCityRate = settings?.shippingOutsideCity ?? 120;
  const currency = settings?.currencySymbol || "BDT";
  
  const shippingCost = deliveryZone === "Inside Dhaka" ? insideCityRate : outsideCityRate;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (totalPrice >= (appliedCoupon.minOrderAmount || 0)) {
      if (appliedCoupon.discountType === "percentage") {
        discountAmount = totalPrice * (appliedCoupon.discountValue / 100);
      } else {
        discountAmount = appliedCoupon.discountValue;
      }
    }
  }

  const finalTotal = Math.max(0, totalPrice - discountAmount + shippingCost);

  const handleApplyCoupon = async () => {
    if (!couponCode) return toast.error("Please enter a coupon code");
    setIsApplyingCoupon(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/verify/${couponCode}`);
      const data = await res.json();
      if (data.success) {
        if (totalPrice < (data.coupon.minOrderAmount || 0)) {
          toast.error(`Minimum order amount for this coupon is ${currency}${data.coupon.minOrderAmount}`);
        } else {
          toast.success("Coupon applied successfully!");
          setAppliedCoupon(data.coupon);
          setIsCouponOpen(false);
        }
      } else {
        toast.error(data.message || "Invalid coupon");
        setAppliedCoupon(null);
      }
    } catch (error) {
      toast.error("Error verifying coupon");
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed");
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Please add items to checkout.");
      return;
    }
    
    if (!user) {
      toast.error("Please login first to place an order");
      router.push("/login?redirect=/cart");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please agree to the Terms and Conditions, Privacy Policy & Refund Policy.");
      return;
    }

    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.district || !shippingAddress.thana || !shippingAddress.addressLine) {
      toast.error("Please fill all required shipping address fields.");
      return;
    }

    if (!useShippingForBilling && (!billingAddress.name || !billingAddress.phone || !billingAddress.district || !billingAddress.thana || !billingAddress.addressLine)) {
      toast.error("Please fill all required billing address fields.");
      return;
    }

    if (["Bkash", "Nagad", "Rocket"].includes(paymentMethod) && !transactionId.trim()) {
      toast.error(`Please provide the transaction ID for ${paymentMethod} payment.`);
      return;
    }

    setIsCheckoutLoading(true);
    const loadingToast = toast.loading("Processing Order...");
    
    const finalShippingInfo = {
      ...shippingAddress,
      type: "Shipping",
    };

    const isAlreadySaved = user?.addresses?.some((a: any) => a.addressLine === finalShippingInfo.addressLine && a.thana === finalShippingInfo.thana && a.district === finalShippingInfo.district);

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
            paymentMethod: paymentMethod, 
            totalAmount: finalTotal,
            orderNote,
            couponCode: appliedCoupon?.code,
            transactionId: ["Bkash", "Nagad", "Rocket"].includes(paymentMethod) ? transactionId : undefined,
          }),
        },
      );

      const data = await res.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        if (data.gatewayUrl) {
          window.location.href = data.gatewayUrl;
        } else {
          clearCart();
          router.push(`/success?orderId=${data.orderId}`);
          // Reset loading state in case Next.js takes a while to navigate
          setTimeout(() => setIsCheckoutLoading(false), 500);
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
                <div className="w-1 h-4 bg-primary rounded-full"></div>
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
                            <button onClick={() => decreaseQuantity(item._id)} className="text-secondary font-bold px-1"><Minus size={14} /></button>
                            <span className="w-6 text-center font-medium">{item.quantity}</span>
                            <button onClick={() => increaseQuantity(item._id)} className="text-secondary font-bold px-1" disabled={item.quantity >= (item.stock || 999)}><Plus size={14} /></button>
                          </div>
                          <span className="font-bold ml-2">{currency}{(item.price * item.quantity).toFixed(2)}</span>
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
                <div className="w-1 h-4 bg-primary rounded-full"></div>
                <h2 className="text-base font-bold">Shipping Address</h2>
              </div>

              {user && user.addresses && user.addresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold mb-3 text-gray-800">Saved Addresses</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {user.addresses.map((addr: any, idx: number) => {
                      const addrLine = addr.addressLine || addr.street || "";
                      const isSelected = shippingAddress.addressLine === addrLine && shippingAddress.district === addr.district && shippingAddress.thana === addr.thana;
                      return (
                        <div 
                          key={idx}
                          onClick={() => {
                            if (isSelected) {
                              setShippingAddress({ name: "", phone: "", district: "Dhaka", thana: "", addressLine: "" });
                            } else {
                              setShippingAddress({
                                name: addr.name || user.name || "",
                                phone: "", // Do not autofill phone number
                                district: addr.district || "Dhaka",
                                thana: addr.thana || "",
                                addressLine: addrLine,
                              });
                            }
                          }}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin size={14} className={isSelected ? 'text-secondary' : 'text-gray-500'} />
                            <span className="text-xs font-bold uppercase tracking-widest">{addr.label || addr.type || 'Address'}</span>
                            {isSelected && <CheckCircle2 size={14} className="ml-auto text-secondary" />}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mt-2">{addrLine}, {addr.thana}, {addr.district}</p>
                        </div>
                      );
                    })}
                    <div 
                      onClick={() => setShippingAddress({ name: "", phone: "", district: "Dhaka", thana: "", addressLine: "" })}
                      className={`p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center min-h-[80px] ${!shippingAddress.addressLine ? 'border-primary bg-gray-50 text-secondary' : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-secondary'}`}
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
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                  <div className="flex w-full">
                    <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-md px-4 py-2.5 text-sm text-gray-600 flex items-center justify-center">88</span>
                    <input 
                      type="text" 
                      placeholder="017********" 
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-r-md px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select 
                    value={shippingAddress.district}
                    onChange={(e) => {
                      const newDistrict = e.target.value;
                      const defaultThana = bdUpazilas[newDistrict]?.[0] || "";
                      setShippingAddress({...shippingAddress, district: newDistrict, thana: defaultThana});
                    }}
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="">Select District *</option>
                    {bdDistricts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                  </select>
                  <select 
                    value={shippingAddress.thana}
                    onChange={(e) => setShippingAddress({...shippingAddress, thana: e.target.value})}
                    disabled={!shippingAddress.district}
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-white disabled:opacity-50"
                  >
                    <option value="">Select Upazilla / Thana *</option>
                    {shippingAddress.district && bdUpazilas[shippingAddress.district]?.map(thana => <option key={thana} value={thana}>{thana}</option>)}
                  </select>
                </div>

                <textarea 
                  placeholder="ex: House no. / building / street / area *"
                  value={shippingAddress.addressLine}
                  onChange={(e) => setShippingAddress({...shippingAddress, addressLine: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none min-h-[80px]"
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
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
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
                          const addrLine = addr.addressLine || addr.street || "";
                          const isSelected = billingAddress.addressLine === addrLine && billingAddress.district === addr.district && billingAddress.thana === addr.thana;
                          return (
                            <div 
                              key={idx}
                              onClick={() => {
                                if (isSelected) {
                                  setBillingAddress({ name: "", phone: "", district: "Dhaka", thana: "", addressLine: "" });
                                } else {
                                  setBillingAddress({
                                    name: addr.name || user.name || "",
                                    phone: "", // Do not autofill phone number
                                    district: addr.district || "Dhaka",
                                    thana: addr.thana || "",
                                    addressLine: addrLine,
                                  });
                                }
                              }}
                              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin size={14} className={isSelected ? 'text-secondary' : 'text-gray-500'} />
                                <span className="text-xs font-bold uppercase tracking-widest">{addr.label || addr.type || 'Address'}</span>
                                {isSelected && <CheckCircle2 size={14} className="ml-auto text-secondary" />}
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2 mt-2">{addrLine}, {addr.thana}, {addr.district}</p>
                            </div>
                          );
                        })}
                        <div 
                          onClick={() => setBillingAddress({ name: "", phone: "", district: "Dhaka", thana: "", addressLine: "" })}
                          className={`p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center min-h-[80px] ${!billingAddress.addressLine ? 'border-primary bg-gray-50 text-secondary' : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-secondary'}`}
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
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                    />
                    <div className="flex w-full">
                      <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-md px-4 py-2.5 text-sm text-gray-600 flex items-center justify-center">88</span>
                      <input 
                        type="text" 
                        placeholder="017********" 
                        value={billingAddress.phone}
                        onChange={(e) => setBillingAddress({...billingAddress, phone: e.target.value})}
                        className="w-full border border-gray-300 rounded-r-md px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select 
                      value={billingAddress.district}
                      onChange={(e) => {
                        const newDistrict = e.target.value;
                        const defaultThana = bdUpazilas[newDistrict]?.[0] || "";
                        setBillingAddress({...billingAddress, district: newDistrict, thana: defaultThana});
                      }}
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-white"
                    >
                      <option value="">Select District *</option>
                      {bdDistricts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                    </select>
                    <select 
                      value={billingAddress.thana}
                      onChange={(e) => setBillingAddress({...billingAddress, thana: e.target.value})}
                      disabled={!billingAddress.district}
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-white disabled:opacity-50"
                    >
                      <option value="">Select Upazilla / Thana *</option>
                      {billingAddress.district && bdUpazilas[billingAddress.district]?.map(thana => <option key={thana} value={thana}>{thana}</option>)}
                    </select>
                  </div>

                  <textarea 
                    placeholder="ex: House no. / building / street / area *"
                    value={billingAddress.addressLine}
                    onChange={(e) => setBillingAddress({...billingAddress, addressLine: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none min-h-[80px]"
                  ></textarea>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-full lg:w-[400px] space-y-6">
            
            {/* Delivery Zone */}
            <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-primary rounded-full"></div>
                <h2 className="text-base font-bold">Delivery Zone</h2>
              </div>

              <div className="space-y-3">
                {(["Inside Dhaka", "Outside Dhaka"] as const).map((zone) => (
                  <label key={zone} onClick={() => setDeliveryZone(zone)} className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${deliveryZone === zone ? 'border-primary bg-gray-50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded font-bold text-xl bg-blue-50 text-blue-600`}>
                        📍
                      </div>
                      <span className="text-sm font-medium">{zone} {zone === "Inside Dhaka" ? `(${currency}${insideCityRate})` : `(${currency}${outsideCityRate})`}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${deliveryZone === zone ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                      {deliveryZone === zone && <CheckCircle2 size={14} />}
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 bg-primary rounded-full"></div>
                <h2 className="text-base font-bold">Payment method</h2>
              </div>

              <div className="space-y-3">
                {(["Cash on Delivery", "Bkash", "Nagad", "Rocket"] as const).map((method) => (
                  <label key={method} onClick={() => setPaymentMethod(method)} className={`flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors ${paymentMethod === method ? 'border-primary bg-gray-50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded font-bold overflow-hidden text-[10px] leading-tight ${method === 'Cash on Delivery' ? 'bg-blue-50 text-xl' : method === 'Bkash' ? 'bg-pink-50 text-pink-600' : method === 'Nagad' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'}`}>
                        {method === 'Cash on Delivery' ? '💵' : method}
                      </div>
                      <span className="text-sm font-medium">{method}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === method ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                      {paymentMethod === method && <CheckCircle2 size={14} />}
                    </div>
                  </label>
                ))}
              </div>

              {["Bkash", "Nagad", "Rocket"].includes(paymentMethod) && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    Please send the total amount to our <strong>{paymentMethod}</strong> number: <br/>
                    <span className="text-xl font-bold text-secondary block mt-1">01977622623</span>
                    <span className="text-xs text-gray-500 mt-1 block">Account Type: Personal</span>
                  </p>
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Transaction ID *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 8N7A6B5C"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                    />
                  </div>
                </div>
              )}
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
                  {isCouponOpen ? <ChevronUp size={16} className="text-secondary" /> : <ChevronDown size={16} className="text-secondary" />}
                </button>
                {isCouponOpen && !appliedCoupon && (
                  <div className="mt-3 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon}
                      className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-primary transition disabled:opacity-50"
                    >
                      {isApplyingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="mt-3 flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-md">
                    <div>
                      <p className="text-sm font-bold text-emerald-800 uppercase tracking-widest">{appliedCoupon.code}</p>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        {appliedCoupon.discountType === "percentage" ? `${appliedCoupon.discountValue}% OFF` : `${currency}${appliedCoupon.discountValue} OFF`}
                      </p>
                    </div>
                    <button 
                      onClick={handleRemoveCoupon}
                      className="text-red-500 text-xs font-bold uppercase hover:text-red-700 transition"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Summary Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Sub total</span>
                  <span className="font-medium text-gray-800">{currency}{totalPrice.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-sm text-emerald-600">
                    <span className="font-medium">Discount ({appliedCoupon.code})</span>
                    <span className="font-medium">-{currency}{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Delivery cost</span>
                  <span className="font-medium text-gray-800">{currency}{shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-gray-900">{currency}{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Special Notes */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-3 bg-primary rounded-full"></div>
                  <label className="text-sm font-bold text-gray-800">Special notes <span className="text-xs font-normal text-gray-500">(Optional)</span></label>
                </div>
                <textarea 
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary min-h-[80px] resize-none"
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
                  <span className="text-xs text-gray-600">
                    I have read and agree to the <Link href="/terms" target="_blank" className="font-bold underline hover:text-secondary">Terms and Conditions</Link>, <Link href="/privacy" target="_blank" className="font-bold underline hover:text-secondary">Privacy Policy</Link> & <Link href="/shipping-returns" target="_blank" className="font-bold underline hover:text-secondary">Refund and Return Policy</Link>.
                  </span>
                </label>
              </div>

              {/* Place Order Button */}
              <button 
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
                className="w-full bg-primary text-white font-bold py-3 rounded-md hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
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
