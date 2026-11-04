/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  PlusCircle,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
} from "lucide-react";

export default function InventoryManagementPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"list" | "add">("list");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [productForm, setProductForm] = useState({
    productName: "",
    category: "ব্রেসলেট (Bracelet)",
    regularPrice: "",
    offerPrice: "",
    stock: "",
    description: "",
    imageUrl1: "",
    videoUrl: "",
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.productName || !productForm.offerPrice) {
      alert("দয়া করে প্রোডাক্টের নাম এবং অফার প্রাইস লিখুন!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_product",
          "Product Name": productForm.productName,
          "Offer Price": Number(productForm.offerPrice),
          Category: productForm.category,
          Stock: Number(productForm.stock) || 100,
          Description: productForm.description,
          "Image URL1": productForm.imageUrl1,
          "Regular Price": Number(productForm.regularPrice) || 0,
          "Video URL": productForm.videoUrl,
        }),
      });
      const data = await res.json();
      if (data.success || data.status === "success") {
        alert("✅ প্রোডাক্ট সফলভাবে ইনভেন্টরিতে যুক্ত হয়েছে!");
        void fetchProducts();
        setActiveSubTab("list");
        setProductForm({
          productName: "",
          category: "ব্রেসলেট (Bracelet)",
          regularPrice: "",
          offerPrice: "",
          stock: "",
          description: "",
          imageUrl1: "",
          videoUrl: "",
        });
      } else {
        alert("❌ প্রোডাক্ট সেভ করতে ব্যর্থ হয়েছে!");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভার এরর!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      String(p["Product Name"] || "")
        .toLowerCase()
        .includes(productSearch.toLowerCase()) ||
      String(p["Category"] || "")
        .toLowerCase()
        .includes(productSearch.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Duo Corner Stock Control Center
          </span>
          <h2 className="text-xl font-black text-white mt-2 flex items-center gap-2">
            <Package className="text-amber-400" size={22} /> Products &
            Inventory Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            সক্রিয় প্রোডাক্ট ক্যাটালগ, স্টক লেভেল ট্র্যাকিং এবং নতুন প্রোডাক্ট
            এন্ট্রি হাব।
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("list")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === "list"
                ? "bg-rose-600 text-white shadow-lg"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            📦 সমস্ত প্রোডাক্ট ({products.length})
          </button>
          <button
            onClick={() => setActiveSubTab("add")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === "add"
                ? "bg-rose-600 text-white shadow-lg"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            ➕ নতুন প্রোডাক্ট যুক্ত করুন
          </button>
        </div>
      </div>

      {activeSubTab === "add" ? (
        <form
          onSubmit={handleSaveProduct}
          className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-xl"
        >
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h3 className="text-base font-black text-white">
              ✨ নতুন প্রোডাক্ট ও স্পেসিফিকেশন এন্ট্রি ফর্ম
            </h3>
            <button
              type="button"
              onClick={() => setActiveSubTab("list")}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕ বাতিল
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={productForm.productName}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    productName: e.target.value,
                  })
                }
                placeholder="যেমন: Magnetic Couple Bracelet"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Category
              </label>
              <select
                value={productForm.category}
                onChange={(e) =>
                  setProductForm({ ...productForm, category: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none"
              >
                <option>ব্রেসলেট (Bracelet)</option>
                <option>নেকলেস (Necklace)</option>
                <option>স্মার্ট ওয়াচ (Smart Watch)</option>
                <option>গিফট বক্স (Gift Box)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Stock (Inventory)
              </label>
              <input
                type="number"
                value={productForm.stock}
                onChange={(e) =>
                  setProductForm({ ...productForm, stock: e.target.value })
                }
                placeholder="যেমন: 100"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Regular Price
              </label>
              <input
                type="number"
                value={productForm.regularPrice}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    regularPrice: e.target.value,
                  })
                }
                placeholder="যেমন: 999"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Offer Price *
              </label>
              <input
                type="number"
                value={productForm.offerPrice}
                onChange={(e) =>
                  setProductForm({ ...productForm, offerPrice: e.target.value })
                }
                placeholder="যেমন: 799"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Image URL
              </label>
              <input
                type="text"
                value={productForm.imageUrl1}
                onChange={(e) =>
                  setProductForm({ ...productForm, imageUrl1: e.target.value })
                }
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={productForm.description}
              onChange={(e) =>
                setProductForm({ ...productForm, description: e.target.value })
              }
              placeholder="প্রোডাক্টের বিবরণ..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-rose-500 focus:outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl text-xs transition shadow-lg cursor-pointer"
          >
            {isSubmitting
              ? "প্রসেসিং হচ্ছে..."
              : "💾 সেভ প্রোডাক্ট অ্যান্ড ইনভেন্টরি"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search
                className="absolute left-3.5 top-3 text-slate-500"
                size={16}
              />
              <input
                type="text"
                placeholder="প্রোডাক্টের নাম বা ক্যাটাগরি দিয়ে খুঁজুন..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-rose-500 w-full"
              />
            </div>
            <button
              onClick={fetchProducts}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />{" "}
              Refresh
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Regular Price</th>
                    <th className="p-4">Offer Price</th>
                    <th className="p-4">Stock Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-12 text-slate-500"
                      >
                        ইনভেন্টরি ডাটা লোড হচ্ছে...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-12 text-slate-500"
                      >
                        কোনো প্রোডাক্ট পাওয়া যায়নি!
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p, idx) => {
                      const stockNum = Number(p.Stock || p.stock || 0);
                      const isLowStock = stockNum < 5;

                      return (
                        <tr
                          key={idx}
                          className="hover:bg-slate-800/50 transition"
                        >
                          <td className="p-4 font-bold text-white flex items-center gap-2">
                            {p["Product Name"] || p.productName || "N/A"}
                            {isLowStock && (
                              <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-md font-bold">
                                Low Stock!
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-slate-300">
                            {p.Category || p.category || "General"}
                          </td>
                          <td className="p-4 text-slate-400 line-through">
                            ৳{p["Regular Price"] || p.regularPrice || 0}
                          </td>
                          <td className="p-4 font-black text-emerald-400">
                            ৳{p["Offer Price"] || p.offerPrice || 0}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                                isLowStock
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}
                            >
                              {stockNum} Pcs
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() =>
                                alert("স্টক ম্যানেজমেন্ট আপডেট প্যানেল")
                              }
                              className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
                            >
                              ⚙️ Manage
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
