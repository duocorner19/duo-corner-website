"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Video,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  PackageCheck,
  HeartHandshake,
} from "lucide-react";

type ProductSpecsProps = {
  productAttributes: { label: string; value: string }[];
  productName: string;
  productDescription: string;
  productVideo: string;
  extraHeading?: string;
};

export default function ProductSpecs({
  productAttributes,
  productName,
  productDescription,
  productVideo,
  extraHeading,
}: ProductSpecsProps) {
  // স্পেসিফিকেশন স্লাইডার/পেজিনেশন স্টেট (প্রথমে ২টি মেইন দেখাবে, ক্লিক করলে বাকিগুলো)
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  // ভিডিও সোর্স স্টেট (সুপাবেজের নাম অনুযায়ী পাবলিক ফোল্ডার থেকে লোড হবে, না পেলে ফলব্যাক)
  const [videoSrc, setVideoSrc] = useState(productVideo);

  useEffect(() => {
    setVideoSrc(productVideo);
  }, [productVideo]);

  const totalAttrs = productAttributes.length;
  const hasMoreSpecs = totalAttrs > 2;

  // কাস্টমার যদি তীর বাটনে ক্লিক করে পেজ স্লাইড করে বা "সবগুলো দেখুন" চাপে
  const visibleAttributes = showAllSpecs
    ? productAttributes
    : productAttributes.slice(pageIndex * 2, pageIndex * 2 + 2);

  const maxPage = Math.max(0, Math.ceil(totalAttrs / 2) - 1);

  const handleNextSlide = () => {
    setPageIndex((prev) => (prev < maxPage ? prev + 1 : 0));
  };

  const handlePrevSlide = () => {
    setPageIndex((prev) => (prev > 0 ? prev - 1 : maxPage));
  };

  return (
    <div className="space-y-4 my-6 font-sans">
      {/* =====================================================================
          ১. প্রোডাক্টের বিশেষ বিবরণ ও ৮টি ডায়নামিক স্পেসিফিকেশন টেবিল কার্ড
         ===================================================================== */}
      <div className="bg-[#141414] border border-[#D4AF37]/30 rounded-2xl p-4 sm:p-5 shadow-xl text-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#D4AF37]" />
            {extraHeading || "প্রোডাক্টের বিশেষ বিবরণ"}
          </h3>

          {/* ডানপাশে স্লাইড কন্ট্রোল ও সব দেখার বাটন */}
          {hasMoreSpecs && (
            <div className="flex items-center gap-1.5">
              {!showAllSpecs && (
                <div className="flex items-center gap-1 bg-black/50 border border-gray-800 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="p-1 text-gray-400 hover:text-[#D4AF37] transition cursor-pointer"
                    title="পূর্ববর্তী স্পেক্স"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-[10px] font-bold text-gray-400 px-1">
                    {pageIndex + 1}/{maxPage + 1}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="p-1 text-gray-400 hover:text-[#D4AF37] transition cursor-pointer"
                    title="পরবর্তী স্পেক্স দেখুন"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowAllSpecs(!showAllSpecs)}
                className="text-[10px] font-bold bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-0.5"
              >
                <span>
                  {showAllSpecs
                    ? "সংক্ষিপ্ত করুন"
                    : `আরো (${totalAttrs - 2}) ▸`}
                </span>
              </button>
            </div>
          )}
        </div>

        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal mb-4">
          {productDescription}
        </p>

        {/* স্পেসিফিকেশন কার্ড গ্রিড (প্রথমে ২টি মেইন, ক্লিকে বাকিগুলো) */}
        <div className="grid grid-cols-2 gap-2 text-xs transition-all duration-300">
          {visibleAttributes.map((attr, idx) => (
            <div
              key={`${attr.label}-${idx}`}
              className="bg-[#1c1c1c] hover:bg-[#222224] border border-gray-800 hover:border-[#D4AF37]/40 rounded-xl p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 transition"
            >
              <span className="text-gray-400 font-medium text-[10px] sm:text-[11px] capitalize">
                {attr.label}
              </span>
              <span className="text-white font-bold text-[11px] sm:text-xs truncate">
                {attr.value}
              </span>
            </div>
          ))}
        </div>

        {/* কাস্টমার ট্রাস্ট গ্যারান্টি মিনি স্ট্রিপ */}
        <div className="mt-4 pt-3 border-t border-gray-800/80 grid grid-cols-3 gap-2 text-center">
          <div className="bg-black/40 rounded-xl p-2 border border-gray-800/60 flex flex-col items-center justify-center gap-1">
            <PackageCheck size={15} className="text-[#D4AF37]" />
            <span className="text-[10px] font-bold text-gray-300">
              চেক করে রিসিভ
            </span>
          </div>
          <div className="bg-black/40 rounded-xl p-2 border border-gray-800/60 flex flex-col items-center justify-center gap-1">
            <ShieldCheck size={15} className="text-emerald-400" />
            <span className="text-[10px] font-bold text-gray-300">
              ১০০% অরিজিনাল
            </span>
          </div>
          <div className="bg-black/40 rounded-xl p-2 border border-gray-800/60 flex flex-col items-center justify-center gap-1">
            <HeartHandshake size={15} className="text-rose-400" />
            <span className="text-[10px] font-bold text-gray-300">
              মানবিক উদ্যোগ
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          ২. প্রোডাক্ট লাইভ ভিডিও রিভিউ (পাবলিক ফোল্ডার অটো-ডিটেক্ট)
         ===================================================================== */}
      {videoSrc && (
        <div className="bg-[#141414] border border-[#D4AF37]/30 rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <Video size={15} className="text-[#D4AF37]" /> প্রোডাক্ট লাইভ
              ভিডিও রিভিউ
            </h3>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <CheckCircle2 size={11} /> রিয়েল আনবক্সিং
            </span>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-gray-800 shadow-2xl">
            <video
              key={videoSrc}
              src={videoSrc}
              controls
              playsInline
              preload="metadata"
              onError={() => {
                // যদি নির্দিষ্ট ভিডিও ফাইলটি public ফোল্ডারে না পাওয়া যায় তবে ফলব্যাক ভিডিও প্লে হবে
                if (videoSrc !== "/video.mp4") {
                  setVideoSrc("/video.mp4");
                }
              }}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
