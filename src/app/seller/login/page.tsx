"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Store, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SellerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/seller-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("kasuwa_seller", JSON.stringify({
        role: "seller",
        userId: data.user?.id,
        email: data.user?.email || email,
        shopName: data.shopName,
      }));

      router.push("/seller/dashboard");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(45,143,78,0.06) 0%, transparent 50%), #06080C" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏮</div>
          <h1 className="text-2xl font-black text-[#FFE4A0] tracking-tight">Seller Portal</h1>
          <p className="text-xs text-[#7A6E62] mt-1 uppercase tracking-widest">KASUWA 2.0 Marketplace</p>
          <div className="kente-stripe mt-4 mx-auto max-w-[120px]" />
        </div>

        {/* Login Card */}
        <div className="admin-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Store className="size-5 text-[#3DAF62]" />
            <h2 className="text-sm font-bold text-[#FFE4A0] uppercase tracking-wider">Seller Sign In</h2>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 mb-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="size-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-[#7A6E62] uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#7A6E62]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-[#1A2030] border border-[rgba(255,154,60,0.15)] rounded-xl px-3 py-2.5 pl-10 text-sm text-[#FFE4A0] placeholder:text-[#4A4238] outline-none focus:border-[rgba(255,154,60,0.4)] focus:ring-2 focus:ring-[rgba(255,154,60,0.08)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#7A6E62] uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#7A6E62]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full bg-[#1A2030] border border-[rgba(255,154,60,0.15)] rounded-xl px-3 py-2.5 pl-10 pr-10 text-sm text-[#FFE4A0] placeholder:text-[#4A4238] outline-none focus:border-[rgba(255,154,60,0.4)] focus:ring-2 focus:ring-[rgba(255,154,60,0.08)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A6E62] hover:text-[#FF9A3C] transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-[#06080C] bg-gradient-to-r from-[#3DAF62] to-[#2D8F4E] hover:shadow-lg hover:shadow-[rgba(45,143,78,0.2)] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-[10px] text-[#7A6E62]">
              Not registered yet?{" "}
              <Link href="/seller/register" className="text-[#FF9A3C] font-bold hover:underline">
                Register your shop <ArrowRight className="size-2.5 inline" />
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#4A4238] mt-6">
          KASUWA 2.0 Seller Portal — The Market That Listens
        </p>
      </motion.div>
    </div>
  );
}
