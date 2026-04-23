import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "./hooks/reduxHooks";
import { fetchUser, setUser } from "./features/auth/authSlice";
import { useState } from "react";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Toaster } from "react-hot-toast";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import Coupons from "./pages/Coupons";
import Reviews from "./pages/Reviews";
import Settings from "./pages/Settings";
import FlashSales from "./pages/FlashSales";
import Helpdesk from "./pages/Helpdesk";
import Staff from "./pages/Staff";
import Media from "./pages/Media";
import Recommendations from "./pages/Recommendations";
import Shipping from "./pages/Shipping";
import HeroSlider from "./pages/hero-slider";
import toast from "react-hot-toast";

import BentoBoxControl from "./pages/BentoBoxControl";
import Journal from "./pages/Journal";
import Newsletter from "./pages/Newsletter";

function LoginScreen() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.user.role === "admin") {
        dispatch(setUser(data));
      } else if (data.success) {
        toast.error("Access Denied: Not an admin account");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Enterprise Login
        </h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
          <div>
            <label className="text-sm font-semibold text-slate-600">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              placeholder="admin@studio.com"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-600">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-3 border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full mt-4 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Secure Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#334155", color: "#fff", borderRadius: "8px" },
        }}
      />
      <Routes>
        <Route path="/" element={<LoginScreen />} />

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/flash-sales" element={<FlashSales />} />
          <Route path="/helpdesk" element={<Helpdesk />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/media" element={<Media />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/hero-slider" element={<HeroSlider />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/newsletter" element={<Newsletter />} />
          {}
          <Route path="/categories-control" element={<BentoBoxControl />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
