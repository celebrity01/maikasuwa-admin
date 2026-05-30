"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, LogOut, Search, Filter, CheckCircle2,
  XCircle, Eye, ChevronRight, ShieldCheck, Clock, Store,
  ShoppingBag, AlertTriangle, RefreshCw, Mail, Phone, MapPin,
  ArrowLeft, Home, Building, UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDate, statusColor } from "@/lib/data";
import type { SellerProfile } from "@/lib/supabase";

// ── Sidebar Nav ──
function Sidebar({ active, onNav, onLogout }: { active: string; onNav: (v: string) => void; onLogout: () => void }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "sellers", label: "Sellers", icon: Users },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-[rgba(255,154,60,0.1)] bg-[#0A0E14] flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[rgba(255,154,60,0.1)]">
        <div className="flex items-center gap-2.5">
          <div className="text-2xl">🏮</div>
          <div>
            <h1 className="text-sm font-black text-[#FFE4A0] tracking-tight">KASUWA</h1>
            <p className="text-[9px] text-[#7A6E62] uppercase tracking-widest">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active === item.id
                ? "bg-[rgba(255,154,60,0.1)] text-[#FF9A3C] border border-[rgba(255,154,60,0.15)]"
                : "text-[#7A6E62] hover:text-[#FFE4A0] hover:bg-[rgba(255,154,60,0.04)]"
            }`}
          >
            <item.icon className="size-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-[rgba(255,154,60,0.1)]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#7A6E62] hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut className="size-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ── Dashboard Stats ──
function DashboardView({ sellers }: { sellers: SellerProfile[] }) {
  const pending = sellers.filter((s) => s.status === "pending").length;
  const approved = sellers.filter((s) => s.status === "approved").length;
  const rejected = sellers.filter((s) => s.status === "rejected").length;
  const total = sellers.length;

  const stats = [
    { label: "Total Sellers", value: total, icon: Users, cls: "stat-card-ember" },
    { label: "Pending Review", value: pending, icon: Clock, cls: "stat-card-gold" },
    { label: "Approved", value: approved, icon: CheckCircle2, cls: "stat-card-green" },
    { label: "Rejected", value: rejected, icon: XCircle, cls: "stat-card-red" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-black text-[#FFE4A0]">Dashboard</h2>
        <p className="text-xs text-[#7A6E62]">Overview of seller registrations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`${s.cls} rounded-2xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6E62]">{s.label}</span>
              <s.icon className="size-4 text-[#7A6E62]" />
            </div>
            <div className="text-3xl font-black text-[#FFE4A0]">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Recent pending sellers */}
      <div className="admin-card p-5">
        <h3 className="text-sm font-bold text-[#FFE4A0] mb-4">Pending Approvals</h3>
        {sellers.filter((s) => s.status === "pending").length === 0 ? (
          <p className="text-xs text-[#7A6E62] text-center py-8">No pending sellers. All caught up! 🎉</p>
        ) : (
          <div className="space-y-3">
            {sellers.filter((s) => s.status === "pending").slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,154,60,0.04)] border border-[rgba(255,154,60,0.08)]">
                <div className="w-10 h-10 rounded-full bg-[#1A2030] flex items-center justify-center text-lg">{s.shop_type === "home_business" ? "🏠" : "🏪"}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#FFE4A0] truncate">{s.shop_name}</div>
                  <div className="text-[10px] text-[#7A6E62]">{s.full_name} · {s.city}, {s.state}</div>
                </div>
                <div className="text-[10px] text-[#7A6E62]">{formatDate(s.created_at)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Seller Detail Modal ──
function SellerDetailModal({ seller, onClose, onApprove, onReject }: {
  seller: SellerProfile;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async (action: "approve" | "reject") => {
    setActionLoading(true);
    if (action === "approve") {
      await onApprove(seller.id);
    } else {
      await onReject(seller.id);
    }
    setActionLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="admin-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1A2030] flex items-center justify-center text-2xl">
              {seller.shop_type === "home_business" ? "🏠" : "🏪"}
            </div>
            <div>
              <h3 className="text-base font-black text-[#FFE4A0]">{seller.shop_name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusColor(seller.status)}`}>
                  {seller.status.toUpperCase()}
                </span>
                {seller.status === "approved" && <ShieldCheck className="size-3 text-green-400" />}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#1A2030] flex items-center justify-center text-[#7A6E62] hover:text-[#FFE4A0]">
            ✕
          </button>
        </div>

        <div className="kente-stripe mb-4" />

        {/* Seller Details */}
        <div className="space-y-3 mb-5">
          <div className="grid grid-cols-2 gap-3">
            <DetailRow icon={UserCheck} label="Full Name" value={seller.full_name} />
            <DetailRow icon={Mail} label="Email" value={seller.email} />
            <DetailRow icon={Phone} label="Phone" value={seller.phone} />
            <DetailRow icon={Store} label="Shop Type" value={seller.shop_type?.replace(/_/g, " ") || "Shop"} />
          </div>

          <DetailRow icon={MapPin} label="Address" value={seller.shop_address} />
          {seller.home_as_business && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(255,154,60,0.06)] border border-[rgba(255,154,60,0.1)]">
              <Home className="size-3.5 text-[#FF9A3C]" />
              <span className="text-[10px] text-[#FFB84D]">Seller uses home as business address</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <DetailRow icon={Building} label="City" value={seller.city} />
            <DetailRow icon={MapPin} label="State" value={seller.state} />
          </div>
          {seller.landmark && <DetailRow icon={MapPin} label="Landmark" value={seller.landmark} />}
          <DetailRow icon={Clock} label="Registered" value={formatDate(seller.created_at)} />
        </div>

        {/* Actions */}
        {seller.status === "pending" && (
          <div className="space-y-3">
            {!showReject ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction("approve")}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider bg-green-500/15 border border-green-500/25 text-green-400 hover:bg-green-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="size-4" /> Approve
                </button>
                <button
                  onClick={() => setShowReject(true)}
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="size-4" /> Reject
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (optional)"
                  className="w-full bg-[#1A2030] border border-[rgba(255,154,60,0.15)] rounded-xl px-3 py-2.5 text-sm text-[#FFE4A0] placeholder:text-[#4A4238] outline-none focus:border-[rgba(255,154,60,0.4)] resize-none h-20"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReject(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#7A6E62] bg-[#1A2030] border border-[rgba(255,154,60,0.1)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAction("reject")}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-all disabled:opacity-50"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {seller.status === "approved" && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-500/8 border border-green-500/15">
            <CheckCircle2 className="size-4 text-green-400" />
            <span className="text-xs text-green-400">This seller has been approved and notified via email.</span>
          </div>
        )}

        {seller.status === "rejected" && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/8 border border-red-500/15">
            <XCircle className="size-4 text-red-400" />
            <span className="text-xs text-red-400">This seller application was rejected.</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="size-3.5 text-[#7A6E62] mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-[9px] text-[#4A4238] uppercase tracking-wider">{label}</div>
        <div className="text-xs text-[#B8A898]">{value || "—"}</div>
      </div>
    </div>
  );
}

// ── Sellers List View ──
function SellersView({ sellers, loading, onRefresh }: { sellers: SellerProfile[]; loading: boolean; onRefresh: () => void }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);

  const filtered = sellers.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.full_name.toLowerCase().includes(q) || s.shop_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q);
    }
    return true;
  });

  const handleApprove = async (id: string) => {
    const admin = JSON.parse(localStorage.getItem("kasuwa_admin") || "{}");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (admin.accessToken) {
      headers["Authorization"] = `Bearer ${admin.accessToken}`;
    }
    const res = await fetch("/api/admin/approve-seller", {
      method: "POST",
      headers,
      body: JSON.stringify({ sellerId: id }),
    });
    if (res.ok) {
      setSelectedSeller(null);
      onRefresh();
    }
  };

  const handleReject = async (id: string) => {
    const admin = JSON.parse(localStorage.getItem("kasuwa_admin") || "{}");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (admin.accessToken) {
      headers["Authorization"] = `Bearer ${admin.accessToken}`;
    }
    const res = await fetch("/api/admin/reject-seller", {
      method: "POST",
      headers,
      body: JSON.stringify({ sellerId: id }),
    });
    if (res.ok) {
      setSelectedSeller(null);
      onRefresh();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-black text-[#FFE4A0]">Seller Registrations</h2>
          <p className="text-xs text-[#7A6E62]">Review and manage seller applications</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-9 h-9 rounded-xl bg-[#1A2030] border border-[rgba(255,154,60,0.15)] flex items-center justify-center text-[#7A6E62] hover:text-[#FF9A3C] transition-all"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#7A6E62]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, shop, email, phone..."
            className="w-full bg-[#1A2030] border border-[rgba(255,154,60,0.15)] rounded-xl px-3 py-2.5 pl-10 text-sm text-[#FFE4A0] placeholder:text-[#4A4238] outline-none focus:border-[rgba(255,154,60,0.4)] transition-all"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                statusFilter === s
                  ? "bg-[rgba(255,154,60,0.1)] text-[#FF9A3C] border border-[rgba(255,154,60,0.15)]"
                  : "text-[#7A6E62] hover:text-[#FFE4A0] bg-[#1A2030] border border-transparent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Seller List */}
      {loading ? (
        <div className="text-center py-12 text-[#7A6E62] text-sm">Loading sellers...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[#7A6E62] text-sm">No sellers found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((seller) => (
            <motion.button
              key={seller.id}
              onClick={() => setSelectedSeller(seller)}
              className="w-full admin-card p-4 flex items-center gap-4 text-left hover:border-[rgba(255,154,60,0.3)] transition-all"
              whileHover={{ x: 2 }}
            >
              <div className="w-11 h-11 rounded-full bg-[#1A2030] flex items-center justify-center text-xl flex-shrink-0">
                {seller.shop_type === "home_business" ? "🏠" : "🏪"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#FFE4A0] truncate">{seller.shop_name}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${statusColor(seller.status)}`}>
                    {seller.status}
                  </span>
                </div>
                <div className="text-[11px] text-[#7A6E62] mt-0.5">
                  {seller.full_name} · {seller.city}, {seller.state} · {seller.phone}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] text-[#4A4238]">{formatDate(seller.created_at)}</span>
                <ChevronRight className="size-4 text-[#4A4238]" />
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Seller Detail Modal */}
      <AnimatePresence>
        {selectedSeller && (
          <SellerDetailModal
            seller={selectedSeller}
            onClose={() => setSelectedSeller(null)}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Admin Dashboard ──
export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("dashboard");
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    try {
      const admin = JSON.parse(localStorage.getItem("kasuwa_admin") || "{}");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (admin.accessToken) {
        headers["Authorization"] = `Bearer ${admin.accessToken}`;
      }
      const res = await fetch("/api/admin/sellers?status=all", { headers });
      const data = await res.json();
      if (data.sellers) setSellers(data.sellers);
    } catch (err) {
      console.error("Failed to fetch sellers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check admin session
    const admin = localStorage.getItem("kasuwa_admin");
    if (!admin) {
      router.push("/admin/login");
      return;
    }
    fetchSellers();
  }, [fetchSellers, router]);

  const handleLogout = () => {
    localStorage.removeItem("kasuwa_admin");
    router.push("/admin/login");
  };

  return (
    <div className="h-screen flex bg-[#06080C] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar active={activeView} onNav={setActiveView} onLogout={handleLogout} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {["dashboard", "sellers"].map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeView === v
                  ? "bg-[rgba(255,154,60,0.1)] text-[#FF9A3C] border border-[rgba(255,154,60,0.15)]"
                  : "text-[#7A6E62] bg-[#1A2030]"
              }`}
            >
              {v}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={handleLogout} className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/5">
            <LogOut className="size-3.5" />
          </button>
        </div>

        {activeView === "dashboard" && <DashboardView sellers={sellers} />}
        {activeView === "sellers" && <SellersView sellers={sellers} loading={loading} onRefresh={fetchSellers} />}
      </main>
    </div>
  );
}
