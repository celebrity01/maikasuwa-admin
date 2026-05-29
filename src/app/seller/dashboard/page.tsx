"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, Plus, LogOut, Search, Eye,
  Trash2, Pause, Play, Tag, MapPin, RefreshCw, Store, X,
  Package, ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS, CATEGORY_ICONS, formatPrice, formatDate, NIGERIAN_STATES, PRODUCT_CONDITIONS } from "@/lib/data";

// ── Sidebar ──
function SellerSidebar({ active, onNav, onLogout, shopName }: { active: string; onNav: (v: string) => void; onLogout: () => void; shopName: string }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "My Products", icon: ShoppingBag },
    { id: "new-product", label: "Add Product", icon: Plus },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-[rgba(45,143,78,0.1)] bg-[#0A0E14] flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[rgba(45,143,78,0.1)]">
        <div className="flex items-center gap-2.5">
          <div className="text-2xl">🏮</div>
          <div>
            <h1 className="text-sm font-black text-[#FFE4A0] tracking-tight">KASUWA</h1>
            <p className="text-[9px] text-[#3DAF62] uppercase tracking-widest">{shopName || "Seller Portal"}</p>
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
                ? "bg-[rgba(45,143,78,0.1)] text-[#3DAF62] border border-[rgba(45,143,78,0.15)]"
                : "text-[#7A6E62] hover:text-[#FFE4A0] hover:bg-[rgba(45,143,78,0.04)]"
            }`}
          >
            <item.icon className="size-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-[rgba(45,143,78,0.1)]">
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

// ── Seller Dashboard Stats ──
function SellerDashboardView({ products, shopName }: { products: Record<string, unknown>[]; shopName: string }) {
  const active = products.filter((p) => p.status === "active").length;
  const paused = products.filter((p) => p.status === "paused").length;
  const totalViews = products.reduce((sum: number, p) => sum + ((p.views as number) || 0), 0);

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, cls: "stat-card-ember" },
    { label: "Active", value: active, icon: Play, cls: "stat-card-green" },
    { label: "Paused", value: paused, icon: Pause, cls: "stat-card-gold" },
    { label: "Total Views", value: totalViews, icon: Eye, cls: "stat-card-ember" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-black text-[#FFE4A0]">Welcome back, {shopName}! 🏮</h2>
        <p className="text-xs text-[#7A6E62]">Here is an overview of your shop</p>
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

      {products.length === 0 && (
        <div className="admin-card p-8 text-center">
          <Package className="size-12 text-[#4A4238] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#FFE4A0] mb-1">No products yet</h3>
          <p className="text-xs text-[#7A6E62] mb-4">Start uploading products to your shop</p>
        </div>
      )}
    </div>
  );
}

// ── Products List ──
function ProductsView({ products, loading, onRefresh, onDelete }: { products: Record<string, unknown>[]; loading: boolean; onRefresh: () => void; onDelete: (id: string) => void }) {
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.name as string)?.toLowerCase().includes(q) || (p.category as string)?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-black text-[#FFE4A0]">My Products</h2>
          <p className="text-xs text-[#7A6E62]">Manage your product listings</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-9 h-9 rounded-xl bg-[#1A2030] border border-[rgba(255,154,60,0.15)] flex items-center justify-center text-[#7A6E62] hover:text-[#FF9A3C] transition-all"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#7A6E62]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-[#1A2030] border border-[rgba(255,154,60,0.15)] rounded-xl px-3 py-2.5 pl-10 text-sm text-[#FFE4A0] placeholder:text-[#4A4238] outline-none focus:border-[rgba(255,154,60,0.4)] transition-all"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#7A6E62] text-sm">Loading products...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[#7A6E62] text-sm">No products found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <div key={product.id as string} className="admin-card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1A2030] flex items-center justify-center text-2xl flex-shrink-0">
                {CATEGORY_ICONS[(product.category as string)] || "📦"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#FFE4A0] truncate">{product.name as string}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                    product.status === "active"
                      ? "bg-green-500/15 text-green-400 border-green-500/20"
                      : product.status === "paused"
                      ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                      : "bg-zinc-500/15 text-zinc-400 border-zinc-500/20"
                  }`}>
                    {(product.status as string)?.toUpperCase()}
                  </span>
                </div>
                <div className="text-[11px] text-[#7A6E62] mt-0.5">
                  {CATEGORY_LABELS[product.category as string] || (product.category as string)} · {formatPrice((product.price as number) || 0)} · {(product.state as string)}
                </div>
                <div className="text-[10px] text-[#4A4238] mt-0.5">
                  <Eye className="size-2.5 inline mr-1" />{((product.views as number) || 0)} views · Added {formatDate((product.created_at as string) || "")}
                </div>
              </div>
              <button
                onClick={() => onDelete(product.id as string)}
                className="w-8 h-8 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Add Product Form ──
function AddProductView({ sellerId, onCreated }: { sellerId: string; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: "", category: "", subcategory: "", price: "", condition: "Brand New",
    state: "", description: "", negotiable: true, haggleMin: "", haggleMax: "",
  });
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addSpec = () => {
    if (specKey.trim() && specValue.trim()) {
      setSpecs((prev) => ({ ...prev, [specKey.trim()]: specValue.trim() }));
      setSpecKey("");
      setSpecValue("");
    }
  };

  const removeSpec = (key: string) => {
    setSpecs((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/seller/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId,
          name: form.name,
          category: form.category,
          subcategory: form.subcategory,
          price: Number(form.price),
          condition: form.condition,
          state: form.state,
          description: form.description,
          specs,
          negotiable: form.negotiable,
          haggleMin: form.haggleMin ? Number(form.haggleMin) : Number(form.price) * 0.85,
          haggleMax: form.haggleMax ? Number(form.haggleMax) : Number(form.price),
          imageUrls: [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      // Reset form
      setForm({ name: "", category: "", subcategory: "", price: "", condition: "Brand New", state: "", description: "", negotiable: true, haggleMin: "", haggleMax: "" });
      setSpecs({});
      onCreated();
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-[#1A2030] border border-[rgba(255,154,60,0.15)] rounded-xl px-3 py-2.5 text-sm text-[#FFE4A0] placeholder:text-[#4A4238] outline-none focus:border-[rgba(255,154,60,0.4)] focus:ring-2 focus:ring-[rgba(255,154,60,0.08)] transition-all";
  const labelCls = "text-[10px] font-bold text-[#7A6E62] uppercase tracking-wider mb-1.5 block";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-black text-[#FFE4A0]">Add New Product</h2>
        <p className="text-xs text-[#7A6E62]">Upload a product to your shop</p>
      </div>

      <div className="admin-card p-6">
        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 mb-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <span className="text-xs text-red-400">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Product Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Toyota Camry 2019" required className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Category *</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required className={inputCls}>
                <option value="">Select category</option>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{CATEGORY_ICONS[k]} {v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Subcategory</label>
              <input type="text" value={form.subcategory} onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))} placeholder="e.g. cars, phones" className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Price (NGN) *</label>
              <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="e.g. 8500000" required className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Condition</label>
              <select value={form.condition} onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value }))} className={inputCls}>
                {PRODUCT_CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>State</label>
              <select value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className={inputCls}>
                <option value="">Select state</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Negotiable</label>
              <select value={form.negotiable ? "yes" : "no"} onChange={(e) => setForm((f) => ({ ...f, negotiable: e.target.value === "yes" }))} className={inputCls}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {form.negotiable && (
              <>
                <div>
                  <label className={labelCls}>Minimum Price</label>
                  <input type="number" value={form.haggleMin} onChange={(e) => setForm((f) => ({ ...f, haggleMin: e.target.value }))} placeholder="Lowest acceptable price" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Maximum Price</label>
                  <input type="number" value={form.haggleMax} onChange={(e) => setForm((f) => ({ ...f, haggleMax: e.target.value }))} placeholder="Highest price" className={inputCls} />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe your product..." rows={3} className={`${inputCls} resize-none`} />
            </div>
          </div>

          {/* Specs */}
          <div>
            <label className={labelCls}>Specifications</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={specKey} onChange={(e) => setSpecKey(e.target.value)} placeholder="Key (e.g. Make)" className={`${inputCls} flex-1`} />
              <input type="text" value={specValue} onChange={(e) => setSpecValue(e.target.value)} placeholder="Value (e.g. Toyota)" className={`${inputCls} flex-1`} />
              <button type="button" onClick={addSpec} className="px-3 rounded-xl bg-[rgba(255,154,60,0.08)] border border-[rgba(255,154,60,0.15)] text-[#FF9A3C] text-xs font-bold hover:bg-[rgba(255,154,60,0.12)] transition-all">
                Add
              </button>
            </div>
            {Object.keys(specs).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(specs).map(([k, v]) => (
                  <span key={k} className="text-[10px] px-2.5 py-1 rounded-lg bg-[rgba(255,154,60,0.06)] border border-[rgba(255,154,60,0.1)] text-[#B8A898] flex items-center gap-1.5">
                    {k}: {v}
                    <button type="button" onClick={() => removeSpec(k)} className="text-[#7A6E62] hover:text-red-400"><X className="size-2.5" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-[#06080C] bg-gradient-to-r from-[#3DAF62] to-[#2D8F4E] hover:shadow-lg hover:shadow-[rgba(45,143,78,0.2)] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Seller Dashboard ──
export default function SellerDashboard() {
  const [activeView, setActiveView] = useState("dashboard");
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellerInfo, setSellerInfo] = useState<{ userId: string; email: string; shopName: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("kasuwa_seller");
    if (!stored) {
      router.push("/seller/login");
      return;
    }
    const info = JSON.parse(stored);
    setSellerInfo(info);
  }, [router]);

  const fetchProducts = useCallback(async () => {
    if (!sellerInfo?.userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/seller/products?sellerId=${sellerInfo.userId}`);
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [sellerInfo?.userId]);

  useEffect(() => {
    if (sellerInfo) fetchProducts();
  }, [sellerInfo, fetchProducts]);

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch("/api/seller/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      fetchProducts();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("kasuwa_seller");
    router.push("/seller/login");
  };

  if (!sellerInfo) return null;

  return (
    <div className="h-screen flex bg-[#06080C] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <SellerSidebar active={activeView} onNav={setActiveView} onLogout={handleLogout} shopName={sellerInfo.shopName} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {["dashboard", "products", "new-product"].map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeView === v
                  ? "bg-[rgba(45,143,78,0.1)] text-[#3DAF62] border border-[rgba(45,143,78,0.15)]"
                  : "text-[#7A6E62] bg-[#1A2030]"
              }`}
            >
              {v === "new-product" ? "+ Add" : v}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={handleLogout} className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/5">
            <LogOut className="size-3.5" />
          </button>
        </div>

        {activeView === "dashboard" && <SellerDashboardView products={products} shopName={sellerInfo.shopName} />}
        {activeView === "products" && <ProductsView products={products} loading={loading} onRefresh={fetchProducts} onDelete={handleDeleteProduct} />}
        {activeView === "new-product" && <AddProductView sellerId={sellerInfo.userId} onCreated={fetchProducts} />}
      </main>
    </div>
  );
}
