"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, Store, User, Phone,
  MapPin, Building, Home, ChevronRight, ChevronLeft, Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NIGERIAN_STATES } from "@/lib/data";

const SHOP_TYPES = [
  { value: "market_stall", label: "Market Stall", icon: "🏪" },
  { value: "shop", label: "Physical Shop", icon: "🏬" },
  { value: "warehouse", label: "Warehouse / Showroom", icon: "🏭" },
  { value: "home_business", label: "Home Business", icon: "🏠" },
  { value: "office", label: "Office", icon: "🏢" },
  { value: "online", label: "Online Only", icon: "💻" },
];

export default function SellerRegister() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", password: "", confirmPassword: "",
    shopName: "", shopAddress: "", homeAsBusiness: false,
    city: "", state: "", lga: "", landmark: "",
    shopType: "shop",
  });
  const [showPassword, setShowPassword] = useState(false);

  const updateForm = (updates: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...updates }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/seller-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-[#1A2030] border border-[rgba(255,154,60,0.15)] rounded-xl px-3 py-2.5 text-sm text-[#FFE4A0] placeholder:text-[#4A4238] outline-none focus:border-[rgba(255,154,60,0.4)] focus:ring-2 focus:ring-[rgba(255,154,60,0.08)] transition-all";
  const labelCls = "text-[10px] font-bold text-[#7A6E62] uppercase tracking-wider mb-1.5 block";

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(45,143,78,0.06) 0%, transparent 50%), #06080C" }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md text-center">
          <div className="admin-card p-8">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-black text-[#FFE4A0] mb-2">Registration Successful!</h2>
            <p className="text-sm text-[#7A6E62] mb-6">
              Your seller account is pending admin approval. You will receive an email once approved.
            </p>
            <button onClick={() => router.push("/seller/login")} className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-[#06080C] bg-gradient-to-r from-[#3DAF62] to-[#2D8F4E] active:scale-[0.98] transition-all">
              Go to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(45,143,78,0.06) 0%, transparent 50%), #06080C" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏮</div>
          <h1 className="text-2xl font-black text-[#FFE4A0] tracking-tight">Register Your Shop</h1>
          <p className="text-xs text-[#7A6E62] mt-1">KASUWA 2.0 Seller Registration</p>
          <div className="kente-stripe mt-4 mx-auto max-w-[120px]" />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                s < step ? "bg-[#3DAF62] text-[#06080C]" : s === step ? "bg-gradient-to-r from-[#FF9A3C] to-[#FFD166] text-[#06080C]" : "bg-[#1A2030] text-[#7A6E62] border border-[rgba(255,154,60,0.15)]"
              }`}>
                {s < step ? <Check className="size-4" /> : s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 ${s < step ? "bg-[#3DAF62]" : "bg-[#1A2030]"}`} />}
            </div>
          ))}
        </div>

        <div className="admin-card p-6">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 mb-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="size-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#FFE4A0]">Personal Information</h3>
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input type="text" value={form.fullName} onChange={(e) => updateForm({ fullName: e.target.value })} placeholder="Enter your full name" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  <input type="email" value={form.email} onChange={(e) => updateForm({ email: e.target.value })} placeholder="your@email.com" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone *</label>
                  <input type="tel" value={form.phone} onChange={(e) => updateForm({ phone: e.target.value })} placeholder="+234 800 000 0000" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Password *</label>
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => updateForm({ password: e.target.value })} placeholder="Min 8 characters" required minLength={8} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Confirm Password *</label>
                  <input type="password" value={form.confirmPassword} onChange={(e) => updateForm({ confirmPassword: e.target.value })} placeholder="Re-enter password" required className={inputCls} />
                </div>
              </div>
            )}

            {/* Step 2: Shop Details */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#FFE4A0]">Shop Details</h3>
                <div>
                  <label className={labelCls}>Shop Name *</label>
                  <input type="text" value={form.shopName} onChange={(e) => updateForm({ shopName: e.target.value })} placeholder="e.g. Alhaji Motors" required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Shop Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SHOP_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => updateForm({ shopType: t.value })}
                        className={`p-2.5 rounded-xl text-left text-xs transition-all ${
                          form.shopType === t.value
                            ? "bg-[rgba(45,143,78,0.1)] border border-[rgba(45,143,78,0.2)] text-[#3DAF62]"
                            : "bg-[#1A2030] border border-[rgba(255,154,60,0.1)] text-[#7A6E62]"
                        }`}
                      >
                        <span className="text-lg block mb-1">{t.icon}</span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Shop Address *</label>
                  <input type="text" value={form.shopAddress} onChange={(e) => updateForm({ shopAddress: e.target.value })} placeholder="Full shop address" required className={inputCls} />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="homeBusiness"
                    checked={form.homeAsBusiness}
                    onChange={(e) => updateForm({ homeAsBusiness: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#3DAF62]"
                  />
                  <label htmlFor="homeBusiness" className="text-xs text-[#7A6E62]">
                    I use my home as my business address
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#FFE4A0]">Location Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>City *</label>
                    <input type="text" value={form.city} onChange={(e) => updateForm({ city: e.target.value })} placeholder="e.g. Lagos" required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>State *</label>
                    <select value={form.state} onChange={(e) => updateForm({ state: e.target.value })} required className={inputCls}>
                      <option value="">Select</option>
                      {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>LGA</label>
                  <input type="text" value={form.lga} onChange={(e) => updateForm({ lga: e.target.value })} placeholder="Local Government Area" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Landmark</label>
                  <input type="text" value={form.landmark} onChange={(e) => updateForm({ landmark: e.target.value })} placeholder="Nearby landmark for easy navigation" className={inputCls} />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-3 rounded-xl text-sm font-bold text-[#7A6E62] bg-[#1A2030] border border-[rgba(255,154,60,0.1)] flex items-center justify-center gap-2">
                  <ChevronLeft className="size-4" /> Back
                </button>
              )}
              {step < 3 ? (
                <button type="button" onClick={() => setStep(step + 1)} className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-[#06080C] bg-gradient-to-r from-[#FF9A3C] to-[#FFD166] flex items-center justify-center gap-2">
                  Next <ChevronRight className="size-4" />
                </button>
              ) : (
                <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-[#06080C] bg-gradient-to-r from-[#3DAF62] to-[#2D8F4E] active:scale-[0.98] transition-all disabled:opacity-50">
                  {loading ? "Registering..." : "Register"}
                </button>
              )}
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-[10px] text-[#7A6E62]">
              Already registered?{" "}
              <Link href="/seller/login" className="text-[#3DAF62] font-bold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
