/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk, SignIn } from "@clerk/nextjs";
import Link from "next/link";
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  AlertTriangle,
  Truck,
  DollarSign,
  PlusCircle,
  Search,
  RefreshCw,
  UserCheck,
  CheckCircle2,
  XCircle,
  CreditCard,
  Building2,
  Wallet,
  Zap,
  Tag,
  FileText,
  Shield,
  Globe,
  Sliders,
  Heart,
  Plus,
  Trash2,
  Layers,
  Activity,
  HardDrive,
  Users,
  Settings,
} from "lucide-react";

type Order = {
  id?: string | number;
  order_id?: string;
  orderId?: string;
  created_at?: string;
  date?: string;
  time?: string;
  name?: string;
  number?: string;
  phone?: string;
  product_name?: string;
  productName?: string;
  note?: string;
  address?: string;
  collection_amount?: number;
  totalPrice?: number;
  tracking_id?: string;
  trackingCode?: string;
  status?: string;
  courier_action?: string;
  courierAction?: string;
};

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "orders"
    | "inventory"
    | "upload"
    | "categories"
    | "customers"
    | "marketing"
    | "settlements"
    | "automation"
    | "reports"
    | "staff"
    | "cms"
    | "system"
    | "settings"
    | "impact"
  >("overview");

  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [autoFraudLoading, setAutoFraudLoading] = useState(false);
  const [fraudReportMap, setFraudReportMap] = useState<{
    [phone: string]: any;
  }>({});

  const [rules, setRules] = useState([
    {
      id: 1,
      name: "কুরিয়ার Delivered হলে অর্ডার ও COD পাওনা আপডেট",
      trigger: "Courier Delivered",
      status: true,
    },
    {
      id: 2,
      name: "কম স্টক হলে অ্যালার্ট পাঠানো (<5 Pcs)",
      trigger: "Low Stock (<5)",
      status: true,
    },
    {
      id: 3,
      name: "নতুন অর্ডারে স্টক রিজার্ভ করা",
      trigger: "New Order Created",
      status: true,
    },
  ]);

  const [categories, setCategories] = useState<string[]>([
    "ব্রেসলেট (Bracelet)",
    "নেকলেস (Necklace)",
    "স্মার্ট ওয়াচ (Smart Watch)",
    "গিফট বক্স (Gift Box)",
  ]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [productForm, setProductForm] = useState({
    productName: "",
    category: "ব্রেসলেট (Bracelet)",
    regularPrice: "",
    offerPrice: "",
    stock: "",
    description: "",
    imageUrl1: "parl.jpg",
    imageUrl2: "parl1.jpg",
    imageUrl3: "parl2.jpg",
    imageUrl4: "parl3.jpg",
    videoUrl: "/video.mp4",
    productType: "Smart Couple Jewelry",
    usableGender: "Unisex",
    material: "Titanium Steel & Milan Rope",
    color: "Black & Rose Gold",
    packageSize: "Adjustable Free Size",
    grossWeight: "50g",
  });

  const [pixelConfig, setPixelConfig] = useState({
    metaPixelId: "123456789012345",
    metaAccessToken: "EAAG...",
    ga4Id: "G-XXXXXXXXXX",
    gtmId: "GTM-XXXXXXX",
    tiktokPixelId: "CXXXXXXXXXXXXXXX",
    tiktokAccessToken: "",
    tiktokTestEventCode: "",
    capiEnabled: true,
  });
  const [pixelSaved, setPixelSaved] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/save-order");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
        if (data.length > 0 && !selectedCustomer) {
          setSelectedCustomer(data[0]);
          void fetchAutomatedFraudData(data[0].number || data[0].phone || "");
        }
      }
    } catch {
      console.error("Orders fetch error");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch {
      console.error("Products fetch error");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (
        data?.success &&
        Array.isArray(data.categories) &&
        data.categories.length > 0
      ) {
        setCategories(data.categories);
      }
    } catch {
      console.warn("Using default categories.");
    }
  };

  const fetchAutomatedFraudData = async (phone: string) => {
    if (!phone || fraudReportMap[phone]) return;
    setAutoFraudLoading(true);
    try {
      const res = await fetch("/api/fraud-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setFraudReportMap((prev) => ({ ...prev, [phone]: data }));
      }
    } catch (err) {
      console.error("Auto fraud check error:", err);
    } finally {
      setAutoFraudLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadDashboardData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch("/api/save-order"),
          fetch("/api/products"),
        ]);

        const orderData = await ordersRes.json();
        const productData = await productsRes.json();

        if (cancelled) return;

        if (Array.isArray(orderData)) {
          setOrders(orderData);
          if (orderData.length > 0) {
            setSelectedCustomer(orderData[0]);
            void fetchAutomatedFraudData(
              orderData[0].number || orderData[0].phone || "",
            );
          }
        }
        if (Array.isArray(productData)) {
          setProducts(productData);
        }
      } catch {
        console.error("Dashboard data load error");
      } finally {
        if (!cancelled) setLoading(false);
      }

      await fetchCategories();

      if (cancelled) return;

      const savedPixels = localStorage.getItem("duo_pixel_config");
      if (savedPixels) {
        try {
          setPixelConfig(JSON.parse(savedPixels));
        } catch {}
      }
    };

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCategoryLoading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName: newCategoryName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => [...prev, data.category]);
        setNewCategoryName("");
        alert("✅ " + data.message);
      } else {
        alert("⚠️ " + data.message);
      }
    } catch {
      alert("❌ ক্যাটাগরি সেভ করতে সমস্যা হয়েছে!");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (catName: string) => {
    if (!confirm(`আপনি কি "${catName}" ক্যাটাগরি মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryName: catName }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.filter((c) => c !== catName));
        alert("✅ " + data.message);
      }
    } catch {
      alert("❌ ডিলিট রিকোয়েস্ট ব্যর্থ হয়েছে!");
    }
  };

  // Steadfast কুরিয়ার বুকিং হ্যান্ডলার এবং ডেটা সিঙ্ক
  const handleCourierBooking = async (order: Order) => {
    const orderId = String(order.order_id || order.orderId || order.id || "");
    if (!orderId) {
      alert("অর্ডার আইডি পাওয়া যায়নি!");
      return;
    }

    setBookingLoading(orderId);

    const rawPhone = String(order.number || order.phone || "");
    let formattedPhone = rawPhone.replace(/\D/g, "");
    if (formattedPhone.length === 10 && !formattedPhone.startsWith("0")) {
      formattedPhone = "0" + formattedPhone;
    }

    const cleanAmount = Number(
      order.collection_amount || order.totalPrice || 0,
    );

    try {
      const res = await fetch("/api/save-order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          name: order.name || "Customer",
          phone: formattedPhone,
          address: order.address || "N/A",
          totalPrice: cleanAmount,
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`✅ সফল! কুরিয়ার ট্র্যাকিং আইডি: ${result.consignmentId}`);
        // ডেটাবেজ থেকে লেটেস্ট অর্ডার লিস্ট ফেচ করে UI সাথে সাথে আপডেট করা
        await fetchOrders();
      } else {
        alert(`❌ বুকিং ব্যর্থ: ${result.error || result.message}`);
      }
    } catch {
      alert("কুরিয়ার বুকিং করার সময় সার্ভার ত্রুটি হয়েছে!");
    } finally {
      setBookingLoading(null);
    }
  };

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
          product_name: productForm.productName,
          category: productForm.category,
          regular_price:
            Number(productForm.regularPrice) || Number(productForm.offerPrice),
          offer_price: Number(productForm.offerPrice),
          stock: Number(productForm.stock) || 100,
          description: productForm.description,
          image_url_1: productForm.imageUrl1 || "parl.jpg",
          image_url_2: productForm.imageUrl2 || "parl1.jpg",
          image_url_3: productForm.imageUrl3 || "parl2.jpg",
          image_url_4: productForm.imageUrl4 || "parl3.jpg",
          video_url: productForm.videoUrl || "/video.mp4",
          product_type: productForm.productType,
          usable_gender: productForm.usableGender,
          material: productForm.material,
          color: productForm.color,
          package_size: productForm.packageSize,
          gross_weight: productForm.grossWeight,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ প্রোডাক্টটি সফলভাবে Supabase ডেটাবেজে যুক্ত হয়েছে!");
        fetchProducts();
        setActiveTab("inventory");
      } else {
        alert(
          "❌ প্রোডাক্ট সেভ করতে ব্যর্থ হয়েছে: " +
            (data.message || "Unknown error"),
        );
      }
    } catch {
      alert("সার্ভার এরর!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePixels = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("duo_pixel_config", JSON.stringify(pixelConfig));
    setPixelSaved(true);
    setTimeout(() => setPixelSaved(false), 3000);
  };

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 font-sans">
        <div className="text-rose-500 font-bold text-lg animate-pulse">
          লোড হচ্ছে...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black text-white">
            Duo Corner Admin Panel
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করতে সাইন ইন করুন
          </p>
        </div>
        <div className="bg-slate-900 p-4 rounded-3xl shadow-xl border border-slate-800">
          <SignIn routing="hash" />
        </div>
      </div>
    );
  }

  const adminEmail = "mdimranatick@gmail.com";
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

  if (userEmail !== adminEmail) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-white font-sans">
        <h1 className="text-3xl font-bold text-rose-500 mb-2">দুঃখিত! 🚫</h1>
        <p className="text-slate-400 mb-4">
          এই পেজটি শুধুমাত্র Duo Corner-এর অ্যাডমিনের জন্য সংরক্ষিত।
        </p>
        <button
          onClick={() => signOut()}
          className="bg-rose-600 text-white font-bold px-6 py-2.5 rounded-xl shadow hover:bg-rose-700 transition cursor-pointer"
        >
          লগআউট করুন
        </button>
      </div>
    );
  }

  const totalOrders = orders.length;
  const totalSales = orders.reduce(
    (acc, o) =>
      acc + (Number(o.collection_amount) || Number(o.totalPrice) || 0),
    0,
  );
  const mealFundTotal = totalOrders * 10;
  const pendingCount = orders.filter(
    (o) => String(o.status || "").toLowerCase() === "pending",
  ).length;

  const deliveredOrdersList = orders.filter(
    (o) =>
      String(o.status || "").toLowerCase() === "delivered" ||
      String(o.courier_action || o.courierAction || "").toLowerCase() ===
        "completed",
  );
  const totalCodCollection = deliveredOrdersList.reduce(
    (acc, o) =>
      acc + (Number(o.collection_amount) || Number(o.totalPrice) || 0),
    0,
  );
  const courierDueAmount = orders
    .filter((o) => String(o.status || "").toLowerCase() === "booked")
    .reduce(
      (acc, o) =>
        acc + (Number(o.collection_amount) || Number(o.totalPrice) || 0),
      0,
    );
  const bankReceivedAmount = totalCodCollection * 0.85;

  const filteredOrders = orders.filter((order) => {
    const name = String(order.name || "").toLowerCase();
    const phone = String(order.number || order.phone || "");
    const address = String(order.address || "").toLowerCase();
    return (
      name.includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      address.includes(searchTerm.toLowerCase())
    );
  });

  const filteredProducts = products.filter(
    (p) =>
      String(p.product_name || p.productName || "")
        .toLowerCase()
        .includes(productSearch.toLowerCase()) ||
      String(p.category || "")
        .toLowerCase()
        .includes(productSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="mb-6 px-2">
            <h2 className="text-xl font-black text-white tracking-wider">
              DUO CORNER
            </h2>
            <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-widest mt-0.5">
              Supabase Connected
            </p>
          </div>

          <nav className="space-y-1 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-210px)] pr-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                activeTab === "overview"
                  ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              📊 Overview Dashboard
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                activeTab === "orders"
                  ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              📦 Orders & Processing ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                activeTab === "inventory"
                  ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              🏷️ Products & Inventory ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                activeTab === "upload"
                  ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              ➕ Upload New Product
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                activeTab === "categories"
                  ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              📑 Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                activeTab === "customers"
                  ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              👥 Customer & Risk
            </button>
            <button
              onClick={() => setActiveTab("marketing")}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                activeTab === "marketing"
                  ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              📈 Marketing & Pixels
            </button>
            <button
              onClick={() => setActiveTab("settlements")}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                activeTab === "settlements"
                  ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              💰 Payments & COD Ledger
            </button>
            <button
              onClick={() => setActiveTab("automation")}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                activeTab === "automation"
                  ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              ⚡ Automation Rules ({rules.length})
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                activeTab === "reports"
                  ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              📑 Reports & Analytics
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                activeTab === "staff"
                  ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              🔐 Staff & Permissions
            </button>
            <button
              onClick={() => setActiveTab("cms")}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                activeTab === "cms"
                  ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              🌐 Website & CMS
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                activeTab === "system"
                  ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              ⚙️ System Health
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                activeTab === "settings"
                  ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              🛠️ Business Settings
            </button>
            <button
              onClick={() => setActiveTab("impact")}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-3 ${
                activeTab === "impact"
                  ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              🥀 Meal Fund (৳{mealFundTotal})
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
          <p>
            Database:{" "}
            <span className="text-emerald-400 font-bold">● Supabase Live</span>
          </p>
          <button
            onClick={() => signOut()}
            className="mt-3 w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-2 rounded-xl transition cursor-pointer"
          >
            লগআউট করুন
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-8 gap-4 shadow-sm">
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="🔍 গ্রাহকের নাম, ফোন বা ঠিকানা দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchOrders();
                fetchProducts();
                fetchCategories();
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer border border-slate-700"
            >
              🔄 রিফ্রেশ
            </button>
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold px-3.5 py-2.5 rounded-xl">
              👑 Master Admin
            </div>
          </div>
        </header>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                <p className="text-xs text-slate-400 font-semibold mb-1">
                  মোট বিক্রয় (Total Sales)
                </p>
                <h3 className="text-2xl font-black text-white">
                  ৳{totalSales.toLocaleString()}
                </h3>
                <span className="text-[10px] text-emerald-400 mt-2 inline-block font-bold">
                  ↑ রিয়েল-টাইম হিসাব
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                <p className="text-xs text-slate-400 font-semibold mb-1">
                  মোট অর্ডার (Total Orders)
                </p>
                <h3 className="text-2xl font-black text-white">
                  {totalOrders} টি
                </h3>
                <span className="text-[10px] text-rose-400 mt-2 inline-block font-bold">
                  ক্যাশ অন ডেলিভারি
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                <p className="text-xs text-slate-400 font-semibold mb-1">
                  সামাজিক ফান্ড (Meal Fund)
                </p>
                <h3 className="text-2xl font-black text-amber-400">
                  ৳{mealFundTotal}
                </h3>
                <span className="text-[10px] text-amber-300 mt-2 inline-block font-bold">
                  দুস্থদের খাদ্য সহায়তা
                </span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
                <p className="text-xs text-slate-400 font-semibold mb-1">
                  সিস্টেম সিকিউরিটি
                </p>
                <h3 className="text-xl font-black text-emerald-400 mt-1">
                  Clerk 2FA
                </h3>
                <span className="text-[10px] text-slate-400 mt-2 inline-block font-bold">
                  সুরক্ষিত এনভায়রনমেন্ট
                </span>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-wrap gap-3 items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Quick Command Actions
                </h3>
                <p className="text-xs text-slate-400">
                  ব্যবসার জরুরি শর্টকাট একশনসমূহ
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab("orders")}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium text-xs transition cursor-pointer shadow-sm"
                >
                  <PlusCircle size={16} /> নতুন অর্ডার চেক
                </button>
                <button
                  onClick={() => setActiveTab("upload")}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl font-medium text-xs transition cursor-pointer shadow-sm"
                >
                  <Plus size={16} /> নতুন প্রোডাক্ট আপলোড
                </button>
                <button
                  onClick={() => setActiveTab("inventory")}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl font-medium text-xs transition cursor-pointer border border-slate-700"
                >
                  <Search size={16} /> প্রোডাক্ট স্টক
                </button>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="text-amber-400" size={20} />
                <h4 className="text-sm font-bold text-amber-300">
                  Smart Alerts & Notifications
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-amber-200">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-amber-500/20 flex items-center justify-between">
                  <span>⚠️ {pendingCount} Pending Orders in Queue</span>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="font-bold underline cursor-pointer text-amber-400"
                  >
                    View
                  </button>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-amber-500/20 flex items-center justify-between">
                  <span>📦 Products in Supabase: {products.length} Pcs</span>
                  <button
                    onClick={() => setActiveTab("inventory")}
                    className="font-bold underline cursor-pointer text-amber-400"
                  >
                    Check
                  </button>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-amber-500/20 flex items-center justify-between">
                  <span>💳 Steadfast API Status</span>
                  <span className="font-bold text-emerald-400">Ready</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white mb-2 uppercase tracking-wider">
              সকল অর্ডার প্রসেসিং তালিকা ({filteredOrders.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Number</th>
                    <th className="p-3">Address</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Courier Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredOrders.map((order, idx) => {
                    const currentId =
                      order.order_id ||
                      order.orderId ||
                      order.id ||
                      `ORD-${idx + 1}`;
                    const cName = order.name || "Unknown Customer";
                    const cPhone = order.number || order.phone || "No Number";
                    const cAddress = order.address || "N/A";
                    const cAmount = Number(
                      order.collection_amount || order.totalPrice || 0,
                    );
                    const cStatus = order.status || "pending";

                    const isBooked = cStatus.toLowerCase() === "booked";

                    return (
                      <tr key={idx} className="hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-rose-400">
                          {currentId}
                        </td>
                        <td className="p-3 font-bold text-white">{cName}</td>
                        <td className="p-3 text-slate-300 font-mono">
                          {cPhone}
                        </td>
                        <td
                          className="p-3 text-slate-400 max-w-xs truncate"
                          title={cAddress}
                        >
                          {cAddress}
                        </td>
                        <td className="p-3 font-black text-white">
                          ৳{cAmount}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                              isBooked
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {cStatus}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleCourierBooking(order)}
                            disabled={
                              bookingLoading === String(currentId) || isBooked
                            }
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                              isBooked
                                ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed"
                                : "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                            }`}
                          >
                            {bookingLoading === String(currentId)
                              ? "Booking..."
                              : isBooked
                                ? `✅ ${order.tracking_id || "Booked"}`
                                : "🚚 Steadfast"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-800 pb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                🏷️ Products & Stock Management ({filteredProducts.length})
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="🔍 প্রোডাক্ট সার্চ..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                />
                <button
                  onClick={() => setActiveTab("upload")}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow cursor-pointer shrink-0"
                >
                  + নতুন প্রোডাক্ট
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Regular Price</th>
                    <th className="p-3">Offer Price</th>
                    <th className="p-3">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.map((p, idx) => {
                    const stockNum = Number(p.stock || 0);
                    const isLowStock = stockNum < 5;

                    return (
                      <tr key={idx} className="hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          {p.product_name || p.productName || "N/A"}
                          {isLowStock && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-bold">
                              Low Stock!
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-300">
                          {p.category || "General"}
                        </td>
                        <td className="p-3 text-slate-400 line-through">
                          ৳{p.regular_price || p.regularPrice || 0}
                        </td>
                        <td className="p-3 font-black text-emerald-400">
                          ৳{p.offer_price || p.offerPrice || 0}
                        </td>
                        <td className="p-3">
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <form
            onSubmit={handleSaveProduct}
            className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-xl"
          >
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-black text-white">
                নতুন প্রোডাক্ট আপলোড (Supabase Database)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                আলাদা ৪টি ছবির লিংক ও পণ্য স্পেসিফিকেশন এন্ট্রি করুন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  প্রোডাক্টের নাম *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.productName}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      productName: e.target.value,
                    })
                  }
                  placeholder="যেমন: Magnetic Sun Moon Couple Bracelet"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  ক্যাটাগরি
                </label>
                <select
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  {categories.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  রেগুলার প্রাইস (Regular Price - কাটা মূল্য)
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  অফার প্রাইস (Offer Price - বিক্রয় মূল্য) *
                </label>
                <input
                  type="number"
                  required
                  value={productForm.offerPrice}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      offerPrice: e.target.value,
                    })
                  }
                  placeholder="যেমন: 799"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  স্টক সংখ্যা (Inventory)
                </label>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) =>
                    setProductForm({ ...productForm, stock: e.target.value })
                  }
                  placeholder="যেমন: 100"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  ভিডিও ইউআরএল (Video URL)
                </label>
                <input
                  type="text"
                  value={productForm.videoUrl}
                  onChange={(e) =>
                    setProductForm({ ...productForm, videoUrl: e.target.value })
                  }
                  placeholder="/video.mp4"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  ডেসক্রিপশন বা বিবরণ
                </label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="প্রোডাক্টের সুন্দর বিবরণ..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-rose-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-black text-white sm:col-span-2 mb-1">
                  🖼️ আলাদা ছবির ফাইলের নাম বা ইউআরএল (image_url_1 to 4)
                </h3>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    Image URL 1 (Main)
                  </label>
                  <input
                    type="text"
                    value={productForm.imageUrl1}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        imageUrl1: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    Image URL 2
                  </label>
                  <input
                    type="text"
                    value={productForm.imageUrl2}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        imageUrl2: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    Image URL 3
                  </label>
                  <input
                    type="text"
                    value={productForm.imageUrl3}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        imageUrl3: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">
                    Image URL 4
                  </label>
                  <input
                    type="text"
                    value={productForm.imageUrl4}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        imageUrl4: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl text-xs transition cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isSubmitting
                ? "প্রসেসিং হচ্ছে..."
                : "💾 Supabase-এ প্রোডাক্ট সেভ করুন"}
            </button>
          </form>
        )}

        {activeTab === "categories" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Tag className="text-rose-500" size={18} /> ক্যাটাগরি
                  ম্যানেজমেন্ট
                </h3>
              </div>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="নতুন ক্যাটাগরির নাম লিখুন..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={handleAddCategory}
                disabled={categoryLoading}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md disabled:opacity-50"
              >
                {categoryLoading ? "যুক্ত হচ্ছে..." : "+ যুক্ত করুন"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between"
                >
                  <span className="text-xs font-bold text-slate-200">
                    {cat}
                  </span>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="text-slate-500 hover:text-rose-400 cursor-pointer p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "customers" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">
                  Customer Directory ({orders.length})
                </h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {orders.map((ord, i) => {
                    const custPhone = ord.number || ord.phone || "N/A";
                    const isSelected = selectedCustomer?.number === custPhone;

                    return (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedCustomer(ord);
                          void fetchAutomatedFraudData(custPhone);
                        }}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-rose-600/10 border-rose-500/50"
                            : "bg-slate-950 border-slate-800 hover:bg-slate-800/50"
                        }`}
                      >
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            {ord.name || "Customer"}
                          </h4>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {custPhone}
                          </p>
                        </div>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">
                          Verified
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                  <UserCheck className="text-rose-500" size={18} /> Customer
                  360° Profile & Risk Score
                </h3>

                {selectedCustomer ? (
                  <div className="space-y-6">
                    <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase">
                          Customer Name
                        </p>
                        <h4 className="text-sm font-bold text-white mt-1">
                          {selectedCustomer.name || "N/A"}
                        </h4>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase">
                          Phone Number
                        </p>
                        <h4 className="text-sm font-mono font-bold text-cyan-400 mt-1">
                          {selectedCustomer.number ||
                            selectedCustomer.phone ||
                            "N/A"}
                        </h4>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase">
                          Delivery Address
                        </p>
                        <p className="text-xs text-slate-300 mt-1">
                          {selectedCustomer.address || "N/A"}
                        </p>
                      </div>
                    </div>

                    {autoFraudLoading ? (
                      <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl text-center">
                        <div className="w-8 h-8 mx-auto mb-2 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
                        <p className="text-xs text-rose-400 font-bold">
                          Steadfast API থেকে ফ্রড হিস্ট্রি চেক করা হচ্ছে...
                        </p>
                      </div>
                    ) : fraudReportMap[
                        selectedCustomer.number || selectedCustomer.phone
                      ] ? (
                      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                            Steadfast Courier Report
                          </h4>
                          <p className="text-xs text-slate-300">
                            মোট অর্ডার:{" "}
                            <span className="font-bold text-white">
                              {
                                fraudReportMap[
                                  selectedCustomer.number ||
                                    selectedCustomer.phone
                                ].totalOrders
                              }{" "}
                              টি
                            </span>{" "}
                            | রিসিভ করেছে:{" "}
                            <span className="font-bold text-emerald-400">
                              {
                                fraudReportMap[
                                  selectedCustomer.number ||
                                    selectedCustomer.phone
                                ].deliveredOrders
                              }{" "}
                              টি
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl text-center">
                        <button
                          onClick={() =>
                            fetchAutomatedFraudData(
                              selectedCustomer.number || selectedCustomer.phone,
                            )
                          }
                          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-md"
                        >
                          🔄 অটোমেটিক কুরিয়ার হিস্ট্রি চেক করুন
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-10">
                    কাস্টমার সিলেক্ট করুন।
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "marketing" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <h3 className="text-lg font-black text-white">
              📈 Marketing, Pixels & Server-Side Tracking (CAPI)
            </h3>
            {pixelSaved && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-bold">
                ✅ কনফিগারেশন সেভ হয়েছে!
              </div>
            )}
            <form onSubmit={handleSavePixels} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                    Meta Pixel ID
                  </label>
                  <input
                    type="text"
                    value={pixelConfig.metaPixelId}
                    onChange={(e) =>
                      setPixelConfig({
                        ...pixelConfig,
                        metaPixelId: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                    Meta CAPI Token
                  </label>
                  <input
                    type="password"
                    value={pixelConfig.metaAccessToken}
                    onChange={(e) =>
                      setPixelConfig({
                        ...pixelConfig,
                        metaAccessToken: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-3 rounded-xl text-xs transition shadow-lg cursor-pointer"
              >
                💾 কনফিগারেশন সেভ করুন
              </button>
            </form>
          </div>
        )}

        {activeTab === "settlements" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-xl">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    COD Collection in Hand
                  </p>
                  <h3 className="text-2xl font-black text-emerald-400 mt-1">
                    ৳{totalCodCollection.toLocaleString()}
                  </h3>
                </div>
                <Wallet className="text-emerald-400" size={30} />
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-xl">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Courier Due (Steadfast)
                  </p>
                  <h3 className="text-2xl font-black text-amber-500 mt-1">
                    ৳{courierDueAmount.toLocaleString()}
                  </h3>
                </div>
                <Truck className="text-amber-500" size={30} />
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-xl">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Bank / MFS Received (85%)
                  </p>
                  <h3 className="text-2xl font-black text-cyan-400 mt-1">
                    ৳{bankReceivedAmount.toLocaleString()}
                  </h3>
                </div>
                <Building2 className="text-cyan-400" size={30} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "automation" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Zap className="text-amber-400" size={20} /> Business Automation &
              Rules Engine
            </h3>
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-sm font-bold text-white">
                      {rule.name}
                    </h5>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Trigger: {rule.trigger}
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="text-rose-500" size={18} /> 📑 Business &
              Financial Reports
            </h3>
            <p className="text-xs text-slate-400">
              সর্বমোট বিক্রয় এবং অর্ডারের ওপর ভিত্তি করে প্রস্তুতকৃত অটোমেটিক
              রিপোর্ট।
            </p>
          </div>
        )}

        {activeTab === "staff" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Shield className="text-emerald-400" size={18} /> 🔐 Staff &
              Access Control
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-white">
                  Master Admin ({adminEmail})
                </h4>
                <p className="text-[11px] text-slate-400">
                  Full system & financial control.
                </p>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
                Owner
              </span>
            </div>
          </div>
        )}

        {activeTab === "cms" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Globe className="text-cyan-400" size={18} /> 🌐 Website CMS
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Announcement Bar Text
              </label>
              <input
                type="text"
                defaultValue="🔥 সারা দেশে ক্যাশ অন হোম ডেলিভারি! আজই অর্ডার করুন।"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>
        )}

        {activeTab === "system" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity className="text-indigo-400" size={18} /> ⚙️ System
              Health & Performance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Supabase DB</span>
                <div className="text-sm font-bold text-emerald-400 mt-1">
                  Connected (Realtime)
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">
                  Steadfast Courier API
                </span>
                <div className="text-sm font-bold text-emerald-400 mt-1">
                  Operational
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">
                  Clerk Authentication
                </span>
                <div className="text-sm font-bold text-emerald-400 mt-1">
                  Active
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Settings className="text-amber-400" size={18} /> 🛠️ Store
              Settings
            </h3>
            <p className="text-xs text-slate-400">
              সিস্টেম কনফিগারেশন সক্রিয় রয়েছে।
            </p>
          </div>
        )}

        {activeTab === "impact" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-amber-400 flex items-center gap-2">
                <Heart className="text-rose-500" size={20} /> 🥀 Duo Corner
                Social Impact & Meal Fund
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                প্রতিটি সফল অর্ডার থেকে ১০ টাকা অসহায় মানুষের আহার তহবিলে জমা
                হয়।
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">
                  মোট অর্ডারের সংখ্যা
                </span>
                <h4 className="text-2xl font-black text-white mt-1">
                  {totalOrders} টি
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  জমা হওয়া ফান্ড
                </span>
                <h4 className="text-3xl font-black text-amber-400 mt-1">
                  ৳{mealFundTotal}
                </h4>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
