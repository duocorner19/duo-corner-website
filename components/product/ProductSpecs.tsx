"use client";

import React from "react";
import { Sparkles, Video, CheckCircle2 } from "lucide-react";

type ProductSpecsProps = {
  productAttributes: { label: string; value: string }[];
  productName: string;
  productDescription: string;
  productVideo: string;
};

export default function ProductSpecs({
  productAttributes,
  productName,
  productDescription,
  productVideo,
}: ProductSpecsProps) {
  return (
    <div className="space-y-4 my-6 font-sans">
      {/* প্রোডাক্ট স্পেসিফিকেশন কার্ড */}
      <div className="bg-[#141414] border border-[#D4AF37]/25 rounded-2xl p-4 sm:p-5 shadow-xl text-gray-200">
        <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#D4AF37]" /> প্রোডাক্টের বিশেষ
          বিবরণ
        </h3>

        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal mb-4">
          {productDescription}
        </p>

        {/* অ্যাট্রিবিউট গ্রিড */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {productAttributes.map((attr, idx) => (
            <div
              key={idx}
              className="bg-[#1c1c1c] border border-gray-800 rounded-xl p-2.5 flex items-center justify-between"
            >
              <span className="text-gray-400 font-medium text-[11px]">
                {attr.label}
              </span>
              <span className="text-white font-bold text-[11px] truncate">
                {attr.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* প্রোডাক্ট ভিডিও রিভিউ সেকশন (ডার্ক প্রিমিয়াম ফ্রেম) */}
      {productVideo && (
        <div className="bg-[#141414] border border-[#D4AF37]/25 rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <Video size={15} className="text-[#D4AF37]" /> প্রোডাক্ট লাইভ
              ভিডিও রিভিউ
            </h3>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <CheckCircle2 size={11} /> ১০০% অরিজিনাল ভিডিও
            </span>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-gray-800 shadow-2xl">
            <video
              src={productVideo}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
