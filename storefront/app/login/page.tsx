"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuthStore();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Error message handling
  React.useEffect(() => {
    const error = searchParams.get("error");
    if (error === "auth_failed") {
      toast.error(
        "Authentication failed. If trying to login, you must register first.",
      );
    }
  }, [searchParams]);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace("/profile");
    }
  }, [isAuthenticated, router]);

  // Form states
  const [contact, setContact] = useState(""); // Email
  const [mobile, setMobile] = useState(""); // Only for Register
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Forgot Password states
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0); // 0: off, 1: email, 2: otp, 3: new password
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Email Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(contact)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    const url = isLogin
      ? `${process.env.NEXT_PUBLIC_API_URL}/auth/login`
      : `${process.env.NEXT_PUBLIC_API_URL}/auth/register`;

    const payload = isLogin
      ? { email: contact, password }
      : { name, email: contact, mobile, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        if (isLogin) {
          toast.success("Welcome back to STUDIO.");
          login(data.user || data.customer, data.token);

          let redirectUrl = sessionStorage.getItem("redirectUrl") || "/profile";
          if (redirectUrl === "/login" || redirectUrl === "/register") {
            redirectUrl = "/profile";
          }
          sessionStorage.removeItem("redirectUrl");
          router.replace(redirectUrl);
        } else {
          toast.success("Account created successfully! Please log in.");
          setIsLogin(true);
          setPassword("");
        }
      } else {
        toast.error(data.message || "Authentication failed");
      }
    } catch (error) {
      toast.error("Network error. Is the server running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail }),
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setForgotPasswordStep(2);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetOtp.length !== 6) return toast.error("OTP must be 6 digits.");
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-reset-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail, otp: resetOtp }),
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setForgotPasswordStep(3);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6)
      return toast.error("Password must be at least 6 characters.");
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: resetEmail,
            otp: resetOtp,
            newPassword,
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setForgotPasswordStep(0);
        setIsLogin(true);
        setContact(resetEmail);
        setPassword("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] selection:bg-black selection:text-white flex flex-col">
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-12">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <h1 className="text-3xl font-medium tracking-tight mb-2">
              {forgotPasswordStep > 0
                ? "Reset Password."
                : isLogin
                  ? "Welcome Back."
                  : "Join STUDIO."}
            </h1>
            <p className="text-sm text-gray-500 font-light">
              {forgotPasswordStep === 1
                ? "Enter your email to receive a reset code."
                : forgotPasswordStep === 2
                  ? `Enter the 6-digit code sent to ${resetEmail}`
                  : forgotPasswordStep === 3
                    ? "Create a secure new password."
                    : isLogin
                      ? "Sign in with your email address."
                      : "Create an account for a tailored experience."}
            </p>
          </div>

          {forgotPasswordStep === 1 ? (
            <form
              onSubmit={handleForgotPasswordRequest}
              className="flex flex-col gap-6"
            >
              <div className="relative">
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Registered Email"
                  required
                  className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black transition-colors peer placeholder-transparent"
                />
                <label
                  htmlFor="resetEmail"
                  className="absolute left-0 -top-3.5 text-xs text-gray-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-black"
                >
                  Registered Email
                </label>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 mt-2"
              >
                {isLoading ? "Sending..." : "Send Reset Code"}
              </button>
              <button
                type="button"
                onClick={() => setForgotPasswordStep(0)}
                className="text-xs text-gray-400 hover:text-black mt-2"
              >
                Back to Login
              </button>
            </form>
          ) : forgotPasswordStep === 2 ? (
            <form
              onSubmit={handleVerifyResetOtp}
              className="flex flex-col gap-6"
            >
              <div className="relative">
                <input
                  type="text"
                  id="resetOtp"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  placeholder="6-Digit Code"
                  required
                  maxLength={6}
                  className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black transition-colors peer placeholder-transparent text-center tracking-[1em] font-mono text-xl"
                />
                <label
                  htmlFor="resetOtp"
                  className="absolute left-0 -top-3.5 text-xs text-gray-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-black"
                >
                  Reset Code
                </label>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 mt-2"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
              <button
                type="button"
                onClick={() => setForgotPasswordStep(0)}
                className="text-xs text-gray-400 hover:text-black mt-2"
              >
                Cancel Reset
              </button>
            </form>
          ) : forgotPasswordStep === 3 ? (
            <form
              onSubmit={handleResetPassword}
              className="flex flex-col gap-6"
            >
              <div className="relative">
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  required
                  minLength={6}
                  className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black transition-colors peer placeholder-transparent"
                />
                <label
                  htmlFor="newPassword"
                  className="absolute left-0 -top-3.5 text-xs text-gray-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-black"
                >
                  New Password
                </label>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 mt-2"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isLogin ? "max-h-0 opacity-0" : "max-h-20 opacity-100"}`}
              >
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required={!isLogin}
                    className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black transition-colors peer placeholder-transparent"
                  />
                  <label
                    htmlFor="name"
                    className="absolute left-0 -top-3.5 text-xs text-gray-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-black"
                  >
                    Full Name
                  </label>
                </div>
              </div>

              <div className="relative">
                <input
                  type="email"
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black transition-colors peer placeholder-transparent"
                />
                <label
                  htmlFor="contact"
                  className="absolute left-0 -top-3.5 text-xs text-gray-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-black"
                >
                  Email Address
                </label>
              </div>

              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isLogin ? "max-h-0 opacity-0" : "max-h-20 opacity-100"}`}
              >
                <div className="relative">
                  <input
                    type="tel"
                    id="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Mobile Number"
                    required={!isLogin}
                    className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black transition-colors peer placeholder-transparent"
                  />
                  <label
                    htmlFor="mobile"
                    className="absolute left-0 -top-3.5 text-xs text-gray-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-black"
                  >
                    Mobile Number
                  </label>
                </div>
              </div>

              <div className="relative">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:outline-none focus:border-black transition-colors peer placeholder-transparent"
                />
                <label
                  htmlFor="password"
                  className="absolute left-0 -top-3.5 text-xs text-gray-400 font-medium transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-black"
                >
                  Password
                </label>
              </div>

              {isLogin && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setForgotPasswordStep(1)}
                    type="button"
                    className="text-xs text-gray-400 hover:text-black transition-colors font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 mt-2"
              >
                {isLoading
                  ? "Processing..."
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}

          {forgotPasswordStep === 0 && (
            <>
              <div className="relative mt-8 mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[#FAFAFA] px-2 text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                    Or continue with
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  const returnTo = searchParams.get("redirect") || "/";
                  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?action=${isLogin ? "login" : "register"}&returnTo=${encodeURIComponent(returnTo)}`;
                }}
                className="w-full bg-white border border-gray-300 text-black py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Google
              </button>

              <div className="mt-10 text-center">
                <p className="text-sm text-gray-500 font-light">
                  {isLogin
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setName("");
                      setMobile("");
                      setPassword("");
                    }}
                    className="text-black font-medium border-b border-black pb-0.5 ml-1 hover:text-gray-600 transition-colors"
                  >
                    {isLogin ? "Create one" : "Sign in"}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="text-center pb-6 text-[10px] uppercase tracking-widest text-gray-400 font-bold flex flex-col items-center gap-2">
        <span>Secure Authentication</span>
        <Link
          href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:5173"}
          className="hover:text-gray-600 transition-colors border-b border-transparent hover:border-gray-600 pb-0.5"
        >
          Admin Portal
        </Link>
      </div>
    </div>
  );
}
