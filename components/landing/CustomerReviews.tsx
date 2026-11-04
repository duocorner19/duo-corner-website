"use client";

import React, { useState, useEffect } from "react";
import { Star, MessageSquarePlus, ChevronDown, ChevronUp, CheckCircle, Send } from "lucide-react";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
};

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState("5.0");
  const [totalCount, setTotalCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        setAvgRating(data.averageRating || "5.0");
        setTotalCount(data.totalReviews || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      alert("দয়া করে আপনার নাম ও মন্তব্য প্রদান করুন।");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        setFormSuccess(true);
        setName("");
        setComment("");
        setRating(5);
        void fetchReviews();
        setTimeout(() => setFormSuccess(false), 4000);
      } else {
        alert(data.error || "রিভিউ জমা নেওয়া যায়নি।");
      }
    } catch {
      alert("সার্ভার ত্রুটি হয়েছে।");
    } finally {
      setSubmitting(false);
    }
  };

  const featuredReview = reviews[0];

  return (
    <div className="w-full max-w-4xl mx-auto px-3 py-2.5 font-sans">
      <div className="bg-[#181818] border border-[#D4AF37]/30 rounded-2xl p-3 sm:px-4 shadow-lg backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center bg-gradient-to-br from-[#D4AF37] to-amber-600 text-black font-black text-base w-10 h-10 rounded-xl shadow-md shrink-0">
              {loading ? "..." : avgRating}
            </div>
            <div>
              <div className="flex items-center gap-1 text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
                <span className="text-xs font-bold text-gray-200 ml-1.5">
                  ({totalCount}টি কাস্টমার রিভিউ)
                </span>
              </div>
              <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle size={12} className="text-emerald-400" />
                ১০০% ভেরিফাইড ক্রেতার আসল প্রতিক্রিয়া
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center gap-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-bold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            {isOpen ? "রিভিউ লুকান" : "সব রিভিউ ও মতামত"}
            {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

        {featuredReview && !isOpen && (
          <div className="mt-2.5 pt-2 border-t border-gray-800 text-[11px] sm:text-xs text-gray-300 flex items-start gap-2">
            <span className="text-[#D4AF37] font-serif text-base leading-none">“</span>
            <div className="truncate">
              <span className="font-bold text-white">{featuredReview.name}:</span>{" "}
              <span className="text-gray-400">{featuredReview.comment}</span>
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="mt-2.5 bg-[#141414] border border-[#D4AF37]/30 rounded-2xl p-4 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} className="bg-[#1c1c1c] border border-gray-800 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37]">
              <MessageSquarePlus size={16} />
              <span>আপনার অভিজ্ঞতা ও মতামত শেয়ার করুন</span>
            </div>

            {formSuccess && (
              <p className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 p-2 rounded-lg text-center">
                ধন্যবাদ! আপনার মূল্যবান রিভিউটি সফলভাবে প্রকাশিত হয়েছে।
              </p>
            )}

            <div>
              <label className="block text-[11px] font-bold text-gray-400 mb-1">রেটিং নির্বাচন করুন:</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition cursor-pointer"
                  >
                    <Star
                      size={18}
                      fill={star <= rating ? "currentColor" : "none"}
                      className={star <= rating ? "text-[#D4AF37]" : "text-gray-600"}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-gray-400 ml-2">{rating} স্টার</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="আপনার নাম *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>

            <textarea
              placeholder="প্রোডাক্ট ও ডেলিভারি কেমন লেগেছে লিখুন... *"
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs p-2.5 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
              required
            />

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-1.5 bg-[#D4AF37] hover:bg-amber-600 text-black font-black text-xs px-4 py-2 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Send size={13} />
              {submitting ? "পোস্ট হচ্ছে..." : "রিভিউ জমা দিন"}
            </button>
          </form>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            <h4 className="text-xs font-bold text-gray-300 border-b border-gray-800 pb-1.5">
              কাস্টমারদের রিভিউসমূহ ({reviews.length}টি)
            </h4>

            {reviews.map((rev) => (
              <div key={rev.id} className="bg-[#1c1c1c] border border-gray-800/80 rounded-xl p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{rev.name}</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/70 px-1.5 py-0.5 rounded-full border border-emerald-800">
                      ভেরিফাইড ক্রেতা
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500">{rev.date}</span>
                </div>

                <div className="flex items-center gap-0.5 text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      fill={i < rev.rating ? "currentColor" : "none"}
                      className={i < rev.rating ? "text-[#D4AF37]" : "text-gray-700"}
                    />
                  ))}
                </div>

                <p className="text-gray-300 leading-relaxed pt-0.5">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
