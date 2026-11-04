// components/admin/CustomerRiskBadge.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

export default function CustomerRiskBadge({ phone }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (!phone) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function checkRisk() {
      try {
        const res = await fetch(
          `/api/fraud-check?phone=${encodeURIComponent(phone)}`,
        );
        const result = await res.json();
        if (isMounted && result.success) {
          setData(result);
        }
      } catch (err) {
        console.error("Risk check error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void checkRisk();
    return () => {
      isMounted = false;
    };
  }, [phone]);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 animate-pulse bg-slate-800/80 px-2 py-0.5 rounded-full ml-1.5 border border-slate-700">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />{" "}
        checking...
      </span>
    );
  }

  if (!data) return null;

  const isHigh = data.riskColor === "rose";
  const isMedium = data.riskColor === "amber";
  const isNew = data.riskColor === "cyan";

  const badgeStyle = isHigh
    ? "bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25 animate-pulse"
    : isMedium
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25"
      : isNew
        ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/25"
        : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25";

  const Icon = isHigh
    ? ShieldAlert
    : isMedium
      ? AlertTriangle
      : isNew
        ? UserCheck
        : ShieldCheck;

  return (
    <div className="relative inline-block ml-1.5">
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition cursor-pointer ${badgeStyle}`}
      >
        <Icon size={11} />
        <span>{data.successRate}%</span>
      </button>

      {/* পপওভার টুলটিপ */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-64 p-3 bg-slate-950 text-white rounded-2xl shadow-2xl border border-slate-800 text-xs space-y-2 pointer-events-none backdrop-blur-md">
          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-300">
              Steadfast কুরিয়ার রিপোর্ট
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                isHigh ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
              }`}
            >
              {data.riskLevel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[9px] block">
                সাকসেস রেট
              </span>
              <span className="font-black text-emerald-400 text-sm">
                {data.successRate}%
              </span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[9px] block">
                মোট পার্সেল
              </span>
              <span className="font-bold text-slate-200 text-sm">
                {data.totalOrders} টি
              </span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[9px] block">
                রিসিভ করেছে
              </span>
              <span className="font-bold text-emerald-400">
                {data.deliveredOrders} টি
              </span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[9px] block">
                ক্যানসেল / রিটার্ন
              </span>
              <span className="font-bold text-rose-400">
                {data.cancelledOrders} টি
              </span>
            </div>
          </div>

          {isHigh && (
            <p className="text-[10px] text-rose-300 bg-rose-950/60 p-1.5 rounded-xl border border-rose-800/80">
              ⚠️ সতর্কবার্তা: কাস্টমারের একাধিক রিটার্ন রেকর্ড আছে। কনফার্ম করার
              আগে ডেলিভারি চার্জ অগ্রিম নিতে পারেন।
            </p>
          )}
        </div>
      )}
    </div>
  );
}
