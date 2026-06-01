"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
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
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Store session info
      localStorage.setItem("kasuwa_admin", JSON.stringify({ role: "admin", email: data.user?.email || email, accessToken: data.session?.access_token }));
      router.push("/admin/dashboard");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(255,154,60,0.08) 0%, transparent 50%), #06080C" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏮</div>
          <h1 className="text-2xl font-black text-[#FFE4A0] tracking-tight">KASUWA Admin</h1>
          <p className="text-xs text-[#7A6E62] mt-1 uppercase tracking-widest">Marketplace Management</p>
          <div className="kente-stripe mt-4 mx-auto max-w-[120px]" />
        </div>

        {/* Login Card */}
        <div className="admin-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="size-5 text-[#FF9A3C]" />
            <h2 className="text-sm font-bold text-[#FFE4A0] uppercase tracking-wider">Admin Sign In</h2>
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
                  placeholder="admin@kasuwa.ng"
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
                  placeholder="Enter admin password"
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
              className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-[#06080C] bg-gradient-to-r from-[#FF9A3C] to-[#FFD166] hover:shadow-lg hover:shadow-[rgba(255,154,60,0.2)] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-[#4A4238] mt-6">
          KASUWA 2.0 Admin Portal — The Market That Listens
        </p>
      </motion.div>
    </div>
  );
}
