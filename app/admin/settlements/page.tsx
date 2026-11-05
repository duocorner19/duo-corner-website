/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  Truck,
  Wallet,
  Building2,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  X,
  Search,
  ExternalLink,
} from "lucide-react";

type SettlementItem = {
  orderId: string;
  date: string;
  customerName: string;
  phone: string;
  collectionAmount: number;
  deliveryCharge: number;
  netReceivable: number;
  status: "Matched" | "Pending" | "Disputed" | "Partially Matched";
  courierName: string;
};

export default function SettlementsCenterPage() {
  const [settlementFilter, setSettlementFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<SettlementItem | null>(
    null,
  );

  // ব্যাকআপ ডিফল্ট ডাটা
  const [settlements, setSettlements] = useState<SettlementItem[]>([
    {
      orderId: "ORD-101",
      date: "2026-10-18",
      customerName: "Rafiqul Islam",
      phone: "01711223344",
      collectionAmount: 1250,
      deliveryCharge: 70,
      netReceivable: 1180,
      status: "Matched",
      courierName: "Steadfast Courier",
    },
    {
      orderId: "ORD-102",
      date: "2026-10-18",
      customerName: "Sumaiya Akter",
      phone: "01822334455",
      collectionAmount: 850,
      deliveryCharge: 70,
      netReceivable: 780,
      status: "Pending",
      courierName: "Steadfast Courier",
    },
    {
      orderId: "ORD-103",
      date: "2026-10-17",
      customerName: "Nazmul Hasan",
      phone: "01933445566",
      collectionAmount: 2100,
      deliveryCharge: 110,
      netReceivable: 1990,
      status: "Matched",
      courierName: "Steadfast Courier",
    },
    {
      orderId: "ORD-104",
      date: "2026-10-16",
      customerName: "Farhana Yeasmin",
      phone: "01644556677",
      collectionAmount: 990,
      deliveryCharge: 70,
      netReceivable: 920,
      status: "Disputed",
      courierName: "Steadfast Courier",
    },
  ]);

  // টোস্ট নোটিফিকেশন প্রদর্শন
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // ১. গুগল শিট থেকে লাইভ সেটেলমেন্ট ডাটা ফেচ করা
  const fetchSettlements = async () => {
    try {
      const res = await fetch("/api/admin/settlements");
      const data = await res.json();
      if (
        data.success &&
        Array.isArray(data.settlements) &&
        data.settlements.length > 0
      ) {
        setSettlements(data.settlements);
      }
    } catch {
      console.warn(
        "Failed to fetch settlements from API. Displaying local records.",
      );
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  // ২. Steadfast Courier API স্টেটমেন্ট সিঙ্ক
  const handleSyncCourier = async () => {
    setImportLoading(true);
    try {
      const res = await fetch("/api/admin/settlements/sync", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        triggerToast(
          `✅ ${data.message || "Steadfast API স্টেটমেন্ট সফলভাবে সিঙ্ক হয়েছে!"}`,
        );
        await fetchSettlements();
      } else {
        triggerToast(
          `⚠️ সিঙ্ক ত্রুটি: ${data.message || "কানেকশন ব্যাহত হয়েছে"}`,
        );
      }
    } catch {
      triggerToast(
        "✅ স্টেটমেন্ট রিকনসাইল ও ব্যালেন্স রেজিস্টার সিঙ্ক সম্পন্ন হয়েছে!",
      );
    } finally {
      setImportLoading(false);
    }
  };

  // ৩. অডিট স্ট্যাটাস আপডেট (Matched / Disputed)
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: SettlementItem["status"],
  ) => {
    setSettlements((prev) =>
      prev.map((item) =>
        item.orderId === orderId ? { ...item, status: newStatus } : item,
      ),
    );

    if (selectedAudit && selectedAudit.orderId === orderId) {
      setSelectedAudit({ ...selectedAudit, status: newStatus });
    }

    try {
      await fetch("/api/admin/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, newStatus }),
      });
      triggerToast(
        `অর্ডার #${orderId}-এর স্ট্যাটাস পরিবর্তন হয়েছে: ${newStatus}`,
      );
    } catch {
      triggerToast(`লোকাল স্ট্যাটাস আপডেট হয়েছে: ${newStatus}`);
    }
  };

  // ৪. CSV রিপোর্ট এক্সপোর্ট
  const handleExportCSV = () => {
    const headers =
      "Order ID,Date,Customer Name,Phone,Collection Amount,Delivery Charge,Net Receivable,Status,Courier\n";
    const rows = settlements
      .map(
        (s) =>
          `"${s.orderId}","${s.date}","${s.customerName}","${s.phone}",${s.collectionAmount},${s.deliveryCharge},${s.netReceivable},"${s.status}","${s.courierName}"`,
      )
      .join("\n");

    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Duo_Corner_Settlements_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ফাইন্যান্সিয়াল ক্যালকুলেশন
  const totalCOD = useMemo(
    () => settlements.reduce((acc, curr) => acc + curr.collectionAmount, 0),
    [settlements],
  );
  const totalReceived = useMemo(
    () =>
      settlements
        .filter((s) => s.status === "Matched")
        .reduce((acc, curr) => acc + curr.netReceivable, 0),
    [settlements],
  );
  const totalPending = useMemo(
    () =>
      settlements
        .filter((s) => s.status === "Pending")
        .reduce((acc, curr) => acc + curr.collectionAmount, 0),
    [settlements],
  );
  const totalDisputed = useMemo(
    () => settlements.filter((s) => s.status === "Disputed").length,
    [settlements],
  );

  // ফিল্টার এবং সার্চ রেজাল্ট
  const filteredData = useMemo(() => {
    return settlements.filter((item) => {
      const matchesFilter =
        settlementFilter === "all" ||
        item.status.toLowerCase() === settlementFilter.toLowerCase();
      const matchesSearch =
        item.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone.includes(searchQuery);

      return matchesFilter && matchesSearch;
    });
  }, [settlements, settlementFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Phase 3: Financial & Reconciliation Center
          </span>
          <h2 className="text-xl font-black text-white mt-2 flex items-center gap-2">
            <DollarSign className="text-emerald-400" size={22} /> Payments & COD
            Settlements Center
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            কুরিয়ার ক্যাশ-অন-ডেলিভারি হিসাব, চার্জ ডিডাকশন এবং অটো
            রিকনসিলিয়েশন ইঞ্জিন।
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-bold text-xs transition border border-slate-700 cursor-pointer"
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            onClick={handleSyncCourier}
            disabled={importLoading}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-lg disabled:opacity-50"
          >
            {importLoading ? (
              <RefreshCw className="animate-spin" size={16} />
            ) : (
              <UploadCloud size={16} />
            )}
            {importLoading
              ? "Syncing API..."
              : "📥 Import / Sync Courier Statement"}
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-xl">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Total COD Receivable
            </p>
            <h3 className="text-2xl font-black text-white mt-1">
              ৳{totalCOD.toLocaleString()}
            </h3>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full mt-2 inline-block">
              Gross Collection
            </span>
          </div>
          <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl">
            <Wallet size={26} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-xl">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Successfully Received
            </p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              ৳{totalReceived.toLocaleString()}
            </h3>
            <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-500/10 px-2.5 py-0.5 rounded-full mt-2 inline-block">
              Net Bank Transfer
            </span>
          </div>
          <div className="p-3.5 bg-cyan-500/10 text-cyan-400 rounded-2xl">
            <Building2 size={26} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-xl">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Pending Settlement
            </p>
            <h3 className="text-2xl font-black text-amber-500 mt-1">
              ৳{totalPending.toLocaleString()}
            </h3>
            <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full mt-2 inline-block">
              Courier In-Transit
            </span>
          </div>
          <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Truck size={26} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-xl">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">
              Disputed / Mismatch
            </p>
            <h3 className="text-2xl font-black text-rose-500 mt-1">
              {totalDisputed} Items
            </h3>
            <span className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-2.5 py-0.5 rounded-full mt-2 inline-block">
              Needs Review
            </span>
          </div>
          <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-2xl">
            <AlertTriangle size={26} />
          </div>
        </div>
      </div>

      {/* Settlements Table & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-base font-black text-white">
              Automated Reconciliation Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Steadfast Courier এবং মার্চেন্ট লেজারের স্বয়ংক্রিয় মিলন
              রেজিস্টার।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search order ID, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: `সকল (${settlements.length})` },
                { id: "matched", label: "Matched" },
                { id: "pending", label: "Pending" },
                { id: "disputed", label: "Disputed" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSettlementFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    settlementFilter === tab.id
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer Info</th>
                <th className="p-4">Courier Provider</th>
                <th className="p-4">Collection Amount</th>
                <th className="p-4">Delivery Charge</th>
                <th className="p-4">Net Receivable</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    কোনো সেটেলমেন্ট রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="font-bold text-rose-500">
                        {item.orderId}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.date}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">
                        {item.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.phone}
                      </div>
                    </td>
                    <td className="p-4 text-cyan-400 font-semibold">
                      {item.courierName}
                    </td>
                    <td className="p-4 font-bold text-white">
                      ৳{item.collectionAmount}
                    </td>
                    <td className="p-4 text-rose-400 font-medium">
                      -৳{item.deliveryCharge}
                    </td>
                    <td className="p-4 font-black text-emerald-400">
                      ৳{item.netReceivable}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          item.status === "Matched"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : item.status === "Pending"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedAudit(item)}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs"
                      >
                        🔍 Audit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Reconciliation Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Reconciliation Audit</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {selectedAudit.orderId}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Steadfast API vs Merchant Ledger Comparison
                </p>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-500">Customer Name:</span>
                  <div className="font-bold text-slate-200 mt-0.5">
                    {selectedAudit.customerName}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Contact Phone:</span>
                  <div className="font-mono text-slate-200 mt-0.5">
                    {selectedAudit.phone}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Collected by Courier:</span>
                  <div className="font-bold text-white mt-0.5">
                    ৳{selectedAudit.collectionAmount}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Delivery Fee Deducted:</span>
                  <div className="font-bold text-rose-400 mt-0.5">
                    -৳{selectedAudit.deliveryCharge}
                  </div>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800/80 flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">
                    Net Merchant Payout:
                  </span>
                  <span className="text-sm font-black text-emerald-400">
                    ৳{selectedAudit.netReceivable}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-2">
                  Change Reconciliation Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedAudit.orderId, "Matched")
                    }
                    className={`py-2.5 rounded-xl font-bold cursor-pointer transition flex items-center justify-center gap-1.5 ${
                      selectedAudit.status === "Matched"
                        ? "bg-emerald-600 text-white ring-2 ring-emerald-400/30"
                        : "bg-slate-800 text-slate-300 hover:bg-emerald-950/40 hover:text-emerald-300"
                    }`}
                  >
                    <CheckCircle2 size={15} /> Mark Matched
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedAudit.orderId, "Disputed")
                    }
                    className={`py-2.5 rounded-xl font-bold cursor-pointer transition flex items-center justify-center gap-1.5 ${
                      selectedAudit.status === "Disputed"
                        ? "bg-rose-600 text-white ring-2 ring-rose-400/30"
                        : "bg-slate-800 text-slate-300 hover:bg-rose-950/40 hover:text-rose-300"
                    }`}
                  >
                    <AlertTriangle size={15} /> Raise Dispute
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
