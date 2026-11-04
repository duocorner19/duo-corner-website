/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  Zap,
  FileText,
  ShieldCheck,
  Globe,
  Activity,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  Sparkles,
} from "lucide-react";

// আপনার অনুমোদিত ১০টি অ্যাডমিন ইমেইলের লিস্ট (প্রথম ইমেইলটি আপনার দেওয়া)
const ADMIN_EMAILS = [
  "mdimranatick@gmail.com",
  "copyvai1998@gmail.com",
  "admin3@gmail.com",
  "admin4@gmail.com",
  "admin5@gmail.com",
  "admin6@gmail.com",
  "admin7@gmail.com",
  "admin8@gmail.com",
  "admin9@gmail.com",
  "admin10@gmail.com",
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // ক্লাক অথেন্টিকেশন ও অ্যাডমিন ইমেইল ভ্যালিডেশন চেক
  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/sign-in");
        return;
      }
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
        alert("দুঃখিত! আপনার অ্যাডমিন প্যানেল অ্যাক্সেস করার অনুমতি নেই।");
        router.push("/");
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  // লোডিং বা আনঅথরাইজড অবস্থায় ব্ল্যাঙ্ক বা লোডিং স্ক্রিন দেখাবে
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 font-bold">
            অ্যাডমিন সিকিউরিটি ভেরিফিকেশন চলছে...
          </p>
        </div>
      </div>
    );
  }

  const currentUserEmail = user?.primaryEmailAddress?.emailAddress || "";
  if (!ADMIN_EMAILS.includes(currentUserEmail)) {
    return null;
  }

  const navItems = [
    { name: "Overview Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Orders & Processing", href: "/admin/orders", icon: ShoppingCart },
    { name: "Products & Inventory", href: "/admin/inventory", icon: Package },
    { name: "Customer & Risk (360°)", href: "/admin/customers", icon: Users },
    { name: "Marketing & Pixels", href: "/admin/marketing", icon: TrendingUp },
    {
      name: "Payments & COD Settlements",
      href: "/admin/settlements",
      icon: DollarSign,
    },
    { name: "Automation Rules", href: "/admin/automation", icon: Zap },
    { name: "Professional Reports", href: "/admin/reports", icon: FileText },
    { name: "Staff & Permissions", href: "/admin/staff", icon: ShieldCheck },
    { name: "Website & CMS Control", href: "/admin/cms", icon: Globe },
    { name: "System Health & Logs", href: "/admin/system", icon: Activity },
    { name: "Business Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h2 className="text-xl font-black text-white tracking-wider">
                DUO CORNER
              </h2>
              <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-widest mt-0.5">
                Enterprise Admin Management System
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1.5 text-xs font-semibold overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${
                    isActive
                      ? "bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/20"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            <p className="font-bold text-white">
              {user?.fullName || "Md Imran Hossain"}
            </p>
            <p className="text-emerald-400 text-[10px]">● Super Admin Online</p>
          </div>
          <button
            onClick={() => signOut(() => router.push("/"))}
            className="p-2 bg-slate-800 hover:bg-rose-600/20 hover:text-rose-400 rounded-xl text-slate-400 transition cursor-pointer"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-18 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block">
              <Search
                className="absolute left-3.5 top-3 text-slate-500"
                size={16}
              />
              <input
                type="text"
                placeholder="Global Search (Orders, Products, Customers)..."
                className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-rose-500 w-80 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl relative transition cursor-pointer border border-slate-700"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      System Notifications
                    </h4>
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full font-bold">
                      3 New
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      📦 New order placed from Barishal (৳1,250)
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      ⚡ Steadfast Courier webhook synced successfully.
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                      ⚠️ Low stock alert on Magnetic Couple Bracelet (&lt;5
                      pcs).
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl">
              <Sparkles size={16} className="text-amber-400" />
              <span className="text-xs font-bold text-white hidden sm:inline">
                Duo Corner v2.5
              </span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
