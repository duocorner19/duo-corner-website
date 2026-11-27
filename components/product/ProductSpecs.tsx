"use client";

import React, { useState } from "react";
import {
  Sparkles,
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
  productVideo?: string;
  extraHeading?: string;
};

export default function ProductSpecs({
  productAttributes,
  productDescription,
  extraHeading,
}: ProductSpecsProps) {
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  const totalAttrs = productAttributes.length;
  const hasMoreSpecs = totalAttrs > 2;
  const maxPage = Math.max(0, Math.ceil(totalAttrs / 2) - 1);

  const visibleAttributes = showAllSpecs
    ? productAttributes
    : productAttributes.slice(pageIndex * 2, pageIndex * 2 + 2);

  const handleNextSlide = () => {
    setPageIndex((prev) => (prev < maxPage ? prev + 1 : 0));
  };

  const handlePrevSlide = () => {
    setPageIndex((prev) => (prev > 0 ? prev - 1 : maxPage));
  };

  return (
    <div className="my-4 font-sans">
      <div className="bg-[#141619] border border-[#2a2e35] rounded-xl p-3.5 sm:p-4 text-gray-200">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <h3 className="text-xs font-bold text-[#d4a24c] uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#d4a24c]" />
            {extraHeading || "প্রোডাক্টের বিশেষ বিবরণ"}
          </h3>

          {hasMoreSpecs && (
            <div className="flex items-center gap-1.5 shrink-0">
              {!showAllSpecs && (
                <div className="flex items-center gap-0.5 bg-[#1b1d21] border border-[#2f333a] rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="p-1 text-gray-400 hover:text-[#d4a24c] transition cursor-pointer"
                    title="পূর্ববর্তী স্পেক্স"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="text-[10px] font-bold text-gray-400 px-1">
                    {pageIndex + 1}/{maxPage + 1}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="p-1 text-gray-400 hover:text-[#d4a24c] transition cursor-pointer"
                    title="পরবর্তী স্পেক্স দেখুন"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowAllSpecs(!showAllSpecs)}
                className="text-[10px] font-bold bg-[#1e2127] hover:bg-[#262a31] text-[#d4a24c] border border-[#323741] px-2 py-1 rounded-lg transition cursor-pointer"
              >
                {showAllSpecs ? "সংক্ষিপ্ত করুন" : `আরো (${totalAttrs - 2})`}
              </button>
            </div>
          )}
        </div>

        <p className="text-xs sm:text-[13px] text-gray-300 leading-relaxed mb-3">
          {productDescription}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {visibleAttributes.map((attr, idx) => (
            <div
              key={`${attr.label}-${idx}`}
              className="bg-[#1b1d21] border border-[#2b2f36] rounded-lg p-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
            >
              <span className="text-gray-400 font-medium text-[10px] sm:text-[11px] capitalize">
                {attr.label}
              </span>
              <span className="text-gray-100 font-bold text-[11px] sm:text-xs truncate">
                {attr.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#262a30] grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#191b1f] rounded-lg p-2 border border-[#282c34] flex flex-col items-center justify-center gap-1">
            <PackageCheck size={14} className="text-[#d4a24c]" />
            <span className="text-[10px] font-semibold text-gray-300">
              চেক করে রিসিভ
            </span>
          </div>
          <div className="bg-[#191b1f] rounded-lg p-2 border border-[#282c34] flex flex-col items-center justify-center gap-1">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-[10px] font-semibold text-gray-300">
              ১০০% অরিজিনাল
            </span>
          </div>
          <div className="bg-[#191b1f] rounded-lg p-2 border border-[#282c34] flex flex-col items-center justify-center gap-1">
            <HeartHandshake size={14} className="text-rose-400" />
            <span className="text-[10px] font-semibold text-gray-300">
              মানবিক উদ্যোগ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
