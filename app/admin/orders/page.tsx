/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, Search, RefreshCw } from "lucide-react";
import CustomerRiskBadge from "@/components/admin/CustomerRiskBadge";

type Order = {
  id?: number;
  order_id?: string;
  orderId?: string;
  date?: string;
  time?: string;
  name?: string;
  number?: string;
  address?: string;
  collection_amount?: number;
  tracking_id?: string;
  trackingCode?: string;
  status?: string;
  courier_action?: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/save-order");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Order fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();
  }, []);

  const handleCourierBooking = async (order: Order) => {
    // সঠিক order_id নিশ্চিত করা (ডাটাবেজের order_id অথবা fallback)
    const targetId = String(order.order_id || order.orderId || "");
    if (!targetId) {
      alert("অর্ডার আইডি পাওয়া যায়নি!");
      return;
    }

    setBookingLoading(targetId);

    const rawPhone = String(order.number || "");
    let formattedPhone = rawPhone.replace(/\D/g, "");
    if (formattedPhone.length === 10 && !formattedPhone.startsWith("0")) {
      formattedPhone = "0" + formattedPhone;
    }

    const cleanAmount = Number(order.collection_amount || 0);

    try {
      const res = await fetch("/api/save-order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: targetId,
          name: order.name,
          phone: formattedPhone,
          address: order.address,
          totalPrice: cleanAmount,
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`সফল! কুরিয়ার ট্র্যাকিং আইডি (CN): ${result.consignmentId}`);
        await fetchOrders(); // ডাটা রিফ্রেশ করে UI সাথে সাথে আপডেট করা
      } else {
        alert(`বুকিং ব্যর্থ: ${result.error}`);
      }
    } catch (err) {
      console.error("Courier booking error:", err);
      alert("কুরিয়ার বুকিং করার সময় সার্ভার ত্রুটি হয়েছে!");
    } finally {
      setBookingLoading(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const name = String(order.name || "").toLowerCase();
    const phone = String(order.number || "");
    const orderId = String(order.order_id || order.orderId || "").toLowerCase();
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      orderId.includes(searchTerm.toLowerCase());

    const currentStatus = String(order.status || "pending").toLowerCase();

    if (statusFilter === "pending") {
      return matchesSearch && (currentStatus === "pending" || !order.status);
    }
    if (statusFilter === "booked") {
      return (
        matchesSearch &&
        (currentStatus === "booked" || currentStatus === "sent")
      );
    }
    if (statusFilter === "delivered") {
      return (
        matchesSearch &&
        (currentStatus === "delivered" || currentStatus === "completed")
      );
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto font-sans">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
            Duo Corner Operations Center
          </span>
          <h2 className="text-xl font-black text-white mt-2 flex items-center gap-2">
            <ShoppingCart className="text-rose-500" size={22} /> Orders &
            Courier Processing Hub
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            সুপাবেজ থেকে রিয়েল-টাইম সিঙ্ক হওয়া সমস্ত কাস্টমার অর্ডার এবং
            Steadfast কুরিয়ার বুকিং ম্যানেজমেন্ট।
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer border border-slate-700 shadow-sm"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />{" "}
          Refresh Orders
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search
            className="absolute left-3.5 top-3 text-slate-500"
            size={16}
          />
          <input
            type="text"
            placeholder="অর্ডার আইডি, নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-rose-500 w-full"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === "all"
                ? "bg-rose-600 text-white shadow-md"
                : "bg-slate-950 text-slate-300 hover:bg-slate-800"
            }`}
          >
            সকল অর্ডার ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === "pending"
                ? "bg-rose-600 text-white shadow-md"
                : "bg-slate-950 text-slate-300 hover:bg-slate-800"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("booked")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === "booked"
                ? "bg-rose-600 text-white shadow-md"
                : "bg-slate-950 text-slate-300 hover:bg-slate-800"
            }`}
          >
            Booked / Shipped
          </button>
          <button
            onClick={() => setStatusFilter("delivered")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === "delivered"
                ? "bg-rose-600 text-white shadow-md"
                : "bg-slate-950 text-slate-300 hover:bg-slate-800"
            }`}
          >
            Delivered
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Order ID</th>
                <th className="p-4 font-bold">Date & Time</th>
                <th className="p-4 font-bold">Customer Name & Phone</th>
                <th className="p-4 font-bold">Delivery Address</th>
                <th className="p-4 font-bold">Collection Amount</th>
                <th className="p-4 font-bold">Tracking ID</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Courier Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <div className="w-8 h-8 mx-auto mb-2 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
                    অর্ডার ডাটা লোড হচ্ছে...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    কোনো অর্ডার পাওয়া যায়নি!
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => {
                  const cStatus = order.status || "Pending";
                  const cStatusLower = cStatus.toLowerCase();
                  const isBooked =
                    cStatusLower === "booked" ||
                    cStatusLower === "sent" ||
                    cStatusLower === "delivered";
                  const orderIdentifier =
                    order.order_id || order.orderId || `ORD-${idx + 1}`;
                  const trackingVal = order.tracking_id || order.trackingCode;

                  return (
                    <tr
                      key={order.id || idx}
                      className="hover:bg-slate-800/50 transition"
                    >
                      <td className="p-4 font-bold text-rose-500">
                        {orderIdentifier}
                      </td>
                      <td className="p-4 text-slate-400">
                        {order.date || "N/A"} <br />
                        <span className="text-[10px] text-slate-500">
                          {order.time || ""}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-white">
                        {order.name || "Unknown"} <br />
                        <div className="flex items-center flex-wrap gap-1 mt-0.5">
                          <span className="text-[11px] text-cyan-400 font-mono font-normal">
                            {order.number || "No Number"}
                          </span>
                          {order.number && (
                            <CustomerRiskBadge phone={order.number} />
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 max-w-xs truncate">
                        {order.address || "N/A"}
                      </td>
                      <td className="p-4 text-emerald-400 font-bold text-sm">
                        ৳{order.collection_amount || 0}
                      </td>
                      <td className="p-4 font-mono text-cyan-400 font-bold">
                        {trackingVal ? (
                          trackingVal
                        ) : (
                          <span className="text-slate-500 font-normal">
                            Not Booked
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full font-bold text-[10px] ${
                            isBooked
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {cStatus}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => void handleCourierBooking(order)}
                          disabled={
                            bookingLoading === orderIdentifier || isBooked
                          }
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                            isBooked
                              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed"
                              : "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                          }`}
                        >
                          {bookingLoading === orderIdentifier
                            ? "Booking..."
                            : isBooked
                              ? "✅ Booked"
                              : "🚚 Steadfast"}
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
  );
}
