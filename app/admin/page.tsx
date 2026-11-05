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
  orderId?: string;
  Timestamp?: string;
  Date?: string;
  Time?: string;
  name?: string;
  Name?: string;
  phone?: string;
  Phone?: string;
  productName?: string;
  note?: string;
  "Product/Note"?: string;
  quantity?: number;
  address?: string;
  Address?: string;
  thana?: string;
  district?: string;
  division?: string;
  totalPrice?: number;
  amount?: number;
  Amount?: number;
  collectionAmount?: number;
  trackingCode?: string;
  status?: string;
  Status?: string;
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

  const [customerSubTab, setCustomerSubTab] = useState<
    "profiles" | "fraud" | "verification" | "queue" | "watchlist"
  >("profiles");

  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"list" | "add">("list");

  // Automated Fraud Checker & Customer 360 States
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [autoFraudLoading, setAutoFraudLoading] = useState(false);
  const [fraudReportMap, setFraudReportMap] = useState<{
    [phone: string]: any;
  }>({});

  // Payment & COD Settlement States
  const [settlementFilter, setSettlementFilter] = useState("all");

  // Automation Rules States
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
  const [newRuleName, setNewRuleName] = useState("");

  // ক্যাটাগরি স্টেট (গুগল শিটের সাথে সিঙ্কড)
  const [categories, setCategories] = useState<string[]>([
    "ব্রেসলেট (Bracelet)",
    "নেকলেস (Necklace)",
    "স্মার্ট ওয়াচ (Smart Watch)",
    "গিফট বক্স (Gift Box)",
  ]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  // নতুন প্রোডাক্ট ও ডায়নামিক স্পেসিফিকেশন স্টেট
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
    specs: [
      { label: "Product Type", value: "Smart Couple Jewelry" },
      { label: "Design", value: "Magnetic Sun & Moon" },
      { label: "Material", value: "Titanium Steel & Milan Rope" },
      { label: "Color", value: "Black & Rose Gold" },
      { label: "Size", value: "Adjustable Free Size" },
      { label: "Origin", value: "Imported" },
    ],
  });

  // Marketing & Pixels Hub State
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

  // ডাটা লোড
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/save-order");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
        if (data.length > 0 && !selectedCustomer) {
          setSelectedCustomer(data[0]);
          void fetchAutomatedFraudData(data[0].phone || data[0].Phone || "");
        }
      }
    } catch {
      console.error("Data fetch error");
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
      console.error("Error fetching products");
    }
  };

  // গুগল শিট থেকে ক্যাটাগরি লোড
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (
        data.success &&
        Array.isArray(data.categories) &&
        data.categories.length > 0
      ) {
        setCategories(data.categories);
        setProductForm((prev) => ({
          ...prev,
          category: data.categories.includes(prev.category)
            ? prev.category
            : data.categories[0],
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch categories from API, using defaults.");
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
              orderData[0].phone || orderData[0].Phone || "",
            );
          }
        }
        if (Array.isArray(productData)) {
          setProducts(productData);
        }
      } catch {
        console.error("Data fetch error");
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

  // ক্যাটাগরি তৈরি করার ফাংশন
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
      alert("❌ ক্যাটাগরি সেভ করার সময় সার্ভার এরর হয়েছে!");
    } finally {
      setCategoryLoading(false);
    }
  };

  // ক্যাটাগরি মুছে ফেলার ফাংশন
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
      } else {
        alert("⚠️ " + data.message);
      }
    } catch {
      alert("❌ ডিলিট রিকোয়েস্ট ব্যর্থ হয়েছে!");
    }
  };

  // Steadfast কুরিয়ার বুকিং হ্যান্ডলার
  const handleCourierBooking = async (order: Order, index: number) => {
    const orderId = order.orderId || order.id || `ORD-${index + 1}`;
    setBookingLoading(String(orderId));

    const rawPhone = String(order.phone || order.Phone || "");
    let formattedPhone = rawPhone.replace(/\D/g, "");
    if (formattedPhone.length === 10 && !formattedPhone.startsWith("0")) {
      formattedPhone = "0" + formattedPhone;
    }

    const cleanAmount = Number(
      order.totalPrice ||
        order.amount ||
        order.Amount ||
        order.collectionAmount ||
        0,
    );

    try {
      const res = await fetch("/api/save-order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          name: order.name || order.Name || "Customer",
          phone: formattedPhone,
          address: order.address || order.Address || "N/A",
          totalPrice: cleanAmount,
          thana: order.thana || "",
          district: order.district || "",
          productName:
            order.productName ||
            order.note ||
            order["Product/Note"] ||
            "Product",
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert(
          `✅ সফল! কুরিয়ার কনসাইনমেন্ট ট্র্যাকিং আইডি (CN): ${result.consignmentId}`,
        );
        setOrders((prevOrders) => {
          const updated = [...prevOrders];
          updated[index] = {
            ...updated[index],
            status: "Booked",
            Status: "Booked",
            trackingCode: result.consignmentId,
          };
          return updated;
        });
      } else {
        alert(`❌ বুকিং ব্যর্থ: ${result.error || result.message}`);
      }
    } catch {
      alert("কুরিয়ার বুকিং করার সময় সার্ভার ত্রুটি হয়েছে!");
    } finally {
      setBookingLoading(null);
    }
  };

  // স্পেক্স ইনপুট আপডেট হ্যান্ডলার
  const handleSpecChange = (
    index: number,
    field: "label" | "value",
    val: string,
  ) => {
    const updatedSpecs = [...productForm.specs];
    updatedSpecs[index][field] = val;
    setProductForm({ ...productForm, specs: updatedSpecs });
  };

  // প্রোডাক্ট আপলোড ও গুগল শিটে সেভ হ্যান্ডলার
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.productName || !productForm.offerPrice) {
      alert("দয়া করে প্রোডাক্টের নাম এবং অফার প্রাইস লিখুন!");
      return;
    }

    setIsSubmitting(true);
    try {
      const validAttributes = productForm.specs.filter(
        (s) => s.label.trim() && s.value.trim(),
      );

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_product",
          productName: productForm.productName,
          category: productForm.category,
          regularPrice:
            Number(productForm.regularPrice) || Number(productForm.offerPrice),
          price: Number(productForm.offerPrice),
          stock: Number(productForm.stock) || 100,
          description: productForm.description,
          imageUrl1: productForm.imageUrl1 || "parl.jpg",
          imageUrl2: productForm.imageUrl2 || "parl1.jpg",
          imageUrl3: productForm.imageUrl3 || "parl2.jpg",
          imageUrl4: productForm.imageUrl4 || "parl3.jpg",
          videoUrl: productForm.videoUrl || "/video.mp4",
          attributes: JSON.stringify(validAttributes),
        }),
      });

      const data = await res.json();
      if (data.success || data.status === "success") {
        alert(
          "✅ প্রোডাক্ট ও সম্পূর্ণ স্পেসিফিকেশন গুগল শিটে সফলভাবে সেভ হয়েছে!",
        );
        fetchProducts();
        setActiveTab("inventory");
        setActiveSubTab("list");
      } else {
        alert("❌ প্রোডাক্ট সেভ করতে ব্যর্থ হয়েছে!");
      }
    } catch {
      alert("সার্ভার এরর!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // পিক্সেল সেভ
  const handleSavePixels = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("duo_pixel_config", JSON.stringify(pixelConfig));
    setPixelSaved(true);
    setTimeout(() => setPixelSaved(false), 3000);
  };

  // Clerk Auth Safeguard
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
            অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করতে আপনার আইডি দিয়ে সাইন ইন করুন
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

  // ক্যালকুলেশন
  const totalOrders = orders.length;
  const totalSales = orders.reduce(
    (acc, o) =>
      acc +
      (Number(o.totalPrice) ||
        Number(o.amount) ||
        Number(o.Amount) ||
        Number(o.collectionAmount) ||
        0),
    0,
  );
  const mealFundTotal = totalOrders * 10;
  const pendingCount = orders.filter(
    (o) => String(o.status || o.Status || "").toLowerCase() === "pending",
  ).length;

  const deliveredOrdersList = orders.filter(
    (o) =>
      String(o.status || o.Status || "").toLowerCase() === "delivered" ||
      String(o.courierAction || "").toLowerCase() === "completed",
  );
  const totalCodCollection = deliveredOrdersList.reduce(
    (acc, o) =>
      acc +
      (Number(o.totalPrice) ||
        Number(o.amount) ||
        Number(o.Amount) ||
        Number(o.collectionAmount) ||
        0),
    0,
  );
  const courierDueAmount = orders
    .filter(
      (o) =>
        String(o.status || o.Status || "").toLowerCase() === "booked" ||
        String(o.status || o.Status || "").toLowerCase() === "processing",
    )
    .reduce(
      (acc, o) =>
        acc +
        (Number(o.totalPrice) ||
          Number(o.amount) ||
          Number(o.Amount) ||
          Number(o.collectionAmount) ||
          0),
      0,
    );
  const bankReceivedAmount = totalCodCollection * 0.85;

  const filteredOrders = orders
    .filter((order) => {
      const name = String(order.name || order.Name || "").toLowerCase();
      const phone = String(order.phone || order.Phone || "");
      const district = String(order.district || "").toLowerCase();
      return (
        name.includes(searchTerm.toLowerCase()) ||
        phone.includes(searchTerm) ||
        district.includes(searchTerm.toLowerCase())
      );
    })
    .reverse();

  const filteredProducts = products.filter(
    (p) =>
      String(p["Product Name"] || p.productName || "")
        .toLowerCase()
        .includes(productSearch.toLowerCase()) ||
      String(p["Category"] || p.category || "")
        .toLowerCase()
        .includes(productSearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      {/* ১. সাইডবার নেভিগেশন */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="mb-6 px-2">
            <h2 className="text-xl font-black text-white tracking-wider">
              DUO CORNER
            </h2>
            <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-widest mt-0.5">
              Smart Commerce System
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
              🏷️ Products & Inventory
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

            {/* ডেডিকেটেড সাব-মডিউল লিংক */}
            <div className="pt-2 border-t border-slate-800/80 my-1">
              <Link
                href="/admin/settlements"
                className="w-full text-left px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-3 text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 font-bold"
              >
                💵 Settlements Center ↗
              </Link>
              <Link
                href="/admin/settings"
                className="w-full text-left px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-3 text-indigo-400 hover:bg-slate-800 hover:text-indigo-300 font-bold"
              >
                ⚙️ Module 13: System Control ↗
              </Link>
            </div>

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
              📑 Professional Reports
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
            System Status:{" "}
            <span className="text-emerald-400 font-bold">● Live Synced</span>
          </p>
          <button
            onClick={() => signOut()}
            className="mt-3 w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-2 rounded-xl transition cursor-pointer"
          >
            লগআউট করুন
          </button>
        </div>
      </aside>

      {/* ২. মূল কন্টেন্ট এরিয়া */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-8 gap-4 shadow-sm">
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="🔍 গ্রাহকের নাম, ফোন বা জেলা দিয়ে খুঁজুন..."
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

        {/* OVERVIEW TAB */}
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

            {/* Quick Actions */}
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

            {/* Alerts */}
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
                  <span>📦 Stock Products Synced: {products.length} Pcs</span>
                  <button
                    onClick={() => setActiveTab("inventory")}
                    className="font-bold underline cursor-pointer text-amber-400"
                  >
                    Check
                  </button>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-amber-500/20 flex items-center justify-between">
                  <span>💳 Steadfast Courier API Active</span>
                  <span className="font-bold text-emerald-400">Ready</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
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
                    <th className="p-3">Date</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Number</th>
                    <th className="p-3">Address</th>
                    <th className="p-3">Collection Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Courier Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredOrders.map((order, idx) => {
                    const currentId =
                      order.orderId || order.id || `ORD-${idx + 1}`;
                    const cName =
                      order.name || order.Name || "Unknown Customer";
                    const cPhone = order.phone || order.Phone || "No Number";
                    const cAddress = order.address || order.Address || "N/A";
                    const cAmount =
                      order.totalPrice ||
                      order.amount ||
                      order.Amount ||
                      order.collectionAmount ||
                      0;
                    const cStatus = order.status || order.Status || "Pending";
                    const cDate = order.Timestamp || order.Date || "N/A";

                    const isBooked =
                      cStatus.toLowerCase() === "booked" ||
                      cStatus.toLowerCase() === "sent";

                    return (
                      <tr key={idx} className="hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-rose-400">
                          {currentId}
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {cDate}
                        </td>
                        <td className="p-3 font-bold text-white">{cName}</td>
                        <td className="p-3 text-slate-300 font-mono">
                          {cPhone}
                        </td>
                        <td className="p-3 text-slate-400 max-w-xs truncate">
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
                            onClick={() => handleCourierBooking(order, idx)}
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
                                ? "✅ Booked"
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

        {/* INVENTORY TAB */}
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
                    const stockNum = Number(p.Stock || p.stock || 0);
                    const isLowStock = stockNum < 5;

                    return (
                      <tr key={idx} className="hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-white flex items-center gap-2">
                          {p["Product Name"] || p.productName || "N/A"}
                          {isLowStock && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-bold">
                              Low Stock!
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-300">
                          {p.Category || p.category || "General"}
                        </td>
                        <td className="p-3 text-slate-400 line-through">
                          ৳{p["Regular Price"] || p.regularPrice || 0}
                        </td>
                        <td className="p-3 font-black text-emerald-400">
                          ৳{p["Offer Price"] || p.offerPrice || p.price || 0}
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

        {/* UPLOAD NEW PRODUCT TAB */}
        {activeTab === "upload" && (
          <form
            onSubmit={handleSaveProduct}
            className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 shadow-xl"
          >
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-xl font-black text-white">
                নতুন প্রোডাক্ট আপলোড ও গুগল শিট সিঙ্ক
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                আলাদা ৪টি ছবির লিংক ও ৬টি ডায়নামিক স্পেসিফিকেশন এন্ট্রি করুন।
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

              {/* আলাদা ৪টি ছবির ইনপুট গ্রিড */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-black text-white sm:col-span-2 mb-1">
                  🖼️ আলাদা ছবির ফাইলের নাম বা ইউআরএল (Image URL 1 to 4)
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

            {/* প্রোডাক্ট ডায়নামিক স্পেসিফিকেশন (৬টি লেবেল-ভ্যালু) */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-black text-white mb-3">
                🏷️ প্রোডাক্ট স্পেসিফিকেশন (Label-Value Pairs)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productForm.specs.map((spec, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800"
                  >
                    <input
                      type="text"
                      value={spec.label}
                      onChange={(e) =>
                        handleSpecChange(idx, "label", e.target.value)
                      }
                      placeholder={`Label ${idx + 1}`}
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) =>
                        handleSpecChange(idx, "value", e.target.value)
                      }
                      placeholder={`Value ${idx + 1}`}
                      className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl text-xs transition cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isSubmitting
                ? "প্রসেসিং হচ্ছে..."
                : "💾 প্রোডাক্ট ও স্পেসিফিকেশন সেভ করুন"}
            </button>
          </form>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === "categories" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Tag className="text-rose-500" size={18} /> ক্যাটাগরি
                  ম্যানেজমেন্ট
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  গুগল শিটের সাথে লাইভ সিঙ্ক ক্যাটাগরি লিস্ট।
                </p>
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

        {/* CUSTOMERS & FRAUD TAB */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap gap-2 text-xs font-bold">
              <button
                onClick={() => setCustomerSubTab("profiles")}
                className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                  customerSubTab === "profiles"
                    ? "bg-rose-600 text-white shadow-lg"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                Customer 360°
              </button>
              <button
                onClick={() => setCustomerSubTab("fraud")}
                className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                  customerSubTab === "fraud"
                    ? "bg-rose-600 text-white shadow-lg"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                Fraud Detection
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">
                  Customer Directory ({orders.length})
                </h3>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {orders.map((ord, i) => {
                    const custPhone = ord.phone || ord.Phone || "N/A";
                    const isSelected = selectedCustomer?.phone === custPhone;

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
                            {ord.name || ord.Name || "Customer"}
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
                          {selectedCustomer.name ||
                            selectedCustomer.Name ||
                            "N/A"}
                        </h4>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase">
                          Phone Number
                        </p>
                        <h4 className="text-sm font-mono font-bold text-cyan-400 mt-1">
                          {selectedCustomer.phone ||
                            selectedCustomer.Phone ||
                            "N/A"}
                        </h4>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[11px] font-bold text-slate-400 uppercase">
                          Delivery Address
                        </p>
                        <p className="text-xs text-slate-300 mt-1">
                          {selectedCustomer.address ||
                            selectedCustomer.Address ||
                            "N/A"}
                        </p>
                      </div>
                    </div>

                    {autoFraudLoading ? (
                      <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl text-center">
                        <div className="w-8 h-8 mx-auto mb-2 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
                        <p className="text-xs text-rose-400 font-bold">
                          Steadfast API থেকে অটোমেটিক ফ্রড ও রিসিভ হিস্ট্রি চেক
                          করা হচ্ছে...
                        </p>
                      </div>
                    ) : fraudReportMap[
                        selectedCustomer.phone || selectedCustomer.Phone
                      ] ? (
                      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                            Steadfast Automated Courier Report
                          </h4>
                          <p className="text-xs text-slate-300">
                            মোট অর্ডার:{" "}
                            <span className="font-bold text-white">
                              {
                                fraudReportMap[
                                  selectedCustomer.phone ||
                                    selectedCustomer.Phone
                                ].totalOrders
                              }{" "}
                              টি
                            </span>{" "}
                            | রিসিভ করেছে:{" "}
                            <span className="font-bold text-emerald-400">
                              {
                                fraudReportMap[
                                  selectedCustomer.phone ||
                                    selectedCustomer.Phone
                                ].deliveredOrders
                              }{" "}
                              টি
                            </span>{" "}
                            | ক্যানসেল:{" "}
                            <span className="font-bold text-rose-400">
                              {
                                fraudReportMap[
                                  selectedCustomer.phone ||
                                    selectedCustomer.Phone
                                ].cancelledOrders
                              }{" "}
                              টি
                            </span>
                          </p>
                          <p
                            className={`text-xs font-bold ${
                              Number(
                                fraudReportMap[
                                  selectedCustomer.phone ||
                                    selectedCustomer.Phone
                                ].successRate,
                              ) >= 70
                                ? "text-emerald-400"
                                : "text-rose-500"
                            }`}
                          >
                            স্ট্যাটাস:{" "}
                            {
                              fraudReportMap[
                                selectedCustomer.phone || selectedCustomer.Phone
                              ].riskLevel
                            }
                          </p>
                        </div>
                        <div className="w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 border-emerald-500 bg-emerald-500/10 text-emerald-400 shrink-0">
                          <span className="text-base font-black">
                            {
                              fraudReportMap[
                                selectedCustomer.phone || selectedCustomer.Phone
                              ].successRate
                            }
                            %
                          </span>
                          <span className="text-[9px] uppercase font-bold">
                            Success
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl text-center">
                        <button
                          onClick={() =>
                            fetchAutomatedFraudData(
                              selectedCustomer.phone || selectedCustomer.Phone,
                            )
                          }
                          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-md"
                        >
                          🔄 অটোমেটিক কুরিয়ার হিস্ট্রি ফেচ করুন
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

        {/* MARKETING TAB */}
        {activeTab === "marketing" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Marketing Control
              </span>
              <h3 className="text-lg font-black text-white mt-2">
                📈 Marketing, Pixels & Server-Side Tracking (CAPI)
              </h3>
            </div>

            {pixelSaved && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-bold">
                ✅ পিক্সেল ও ট্র্যাকিং কনফিগারেশন সফলভাবে সেভ হয়েছে!
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
                    Meta CAPI Access Token
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
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                    GA4 Measurement ID
                  </label>
                  <input
                    type="text"
                    value={pixelConfig.ga4Id}
                    onChange={(e) =>
                      setPixelConfig({ ...pixelConfig, ga4Id: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                    TikTok Pixel ID
                  </label>
                  <input
                    type="text"
                    value={pixelConfig.tiktokPixelId}
                    onChange={(e) =>
                      setPixelConfig({
                        ...pixelConfig,
                        tiktokPixelId: e.target.value,
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

        {/* SETTLEMENTS TAB */}
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

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-base font-black text-white mb-4">
                💰 Settlements Ledger (Google Sheet Connected)
              </h3>
              <p className="text-xs text-slate-400">
                সম্পূর্ণ রিকনসিলিয়েশন ও কুরিয়ার স্টেটমেন্ট দেখার জন্য{" "}
                <Link
                  href="/admin/settlements"
                  className="text-emerald-400 underline font-bold"
                >
                  Dedicated Settlements Center
                </Link>{" "}
                পেজ ব্যবহার করুন।
              </p>
            </div>
          </div>
        )}

        {/* AUTOMATION TAB */}
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

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="text-rose-500" size={18} /> 📑 Business &
              Financial Reports
            </h3>
            <p className="text-xs text-slate-400">
              মাসিক বিক্রয়, রিটার্ন অনুপাত এবং লাভ-ক্ষতির পূর্ণাঙ্গ
              অ্যানালিটিক্স রিপোর্ট।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300">
                  Sales & Revenue Report
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  সর্বমোট অর্ডারের ভিত্তিতে প্রস্তুতকৃত লাভ-ক্ষতি স্টেটমেন্ট।
                </p>
                <button className="mt-3 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold">
                  Download CSV
                </button>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-300">
                  Courier Delivery Performance
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  সফল ডেলিভারি ও রিটার্ন রেট পার্সেন্টেজ।
                </p>
                <button className="mt-3 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold">
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAFF & PERMISSIONS TAB */}
        {activeTab === "staff" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Shield className="text-emerald-400" size={18} /> 🔐 Staff &
              Role-Based Access Control
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

        {/* CMS TAB */}
        {activeTab === "cms" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Globe className="text-cyan-400" size={18} /> 🌐 Website & Landing
              Page CMS
            </h3>
            <p className="text-xs text-slate-400">
              ব্যানার, নোটিস বার এবং অফার প্রমোশন টেক্সট নিয়ন্ত্রণ করুন।
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Announcement Bar Text
              </label>
              <input
                type="text"
                defaultValue="🔥 সারা দেশে ফ্রি হোম ডেলিভারি! আজই অর্ডার করুন।"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              />
            </div>
          </div>
        )}

        {/* SYSTEM HEALTH TAB */}
        {activeTab === "system" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity className="text-indigo-400" size={18} /> ⚙️ System
              Health & Performance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Google Sheets DB</span>
                <div className="text-sm font-bold text-emerald-400 mt-1">
                  Connected (210ms)
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
                  2FA Active
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Settings className="text-amber-400" size={18} /> 🛠️ Business &
              Store Settings
            </h3>
            <p className="text-xs text-slate-400">
              পূর্ণাঙ্গ রুলস ইঞ্জিন ও ড্রাইভ ব্যাকআপ সেটিংসের জন্য{" "}
              <Link
                href="/admin/settings"
                className="text-indigo-400 underline font-bold"
              >
                Module 13: System Control Center
              </Link>{" "}
              ব্যবহার করুন।
            </p>
          </div>
        )}

        {/* SOCIAL IMPACT & MEAL FUND TAB */}
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
