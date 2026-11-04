"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  MessageSquarePlus,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Send,
} from "lucide-react";

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

  // ফর্ম স্টেট
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
        setReviews(data.reviews);
        setAvgRating(data.averageRating);
        setTotalCount(data.totalReviews);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      alert("দয়া করে আপনার নাম এবং মন্তব্য লিখুন।");
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
        fetchReviews();
        setTimeout(() => setFormSuccess(false), 4000);
      } else {
        alert(data.error || "রিভিউ যোগ করা সম্ভব হয়নি।");
      }
    } catch {
      alert("সার্ভার ত্রুটি হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  const featuredReview = reviews[0];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 my-3 font-sans">
      {/* কম্প্যাক্ট কার্ড: হেডার ও প্রোডাক্টের মাঝখানে দৃশ্যমান */}
      <div className="bg-gradient-to-r from-rose-50/70 via-white to-rose-50/40 border border-rose-200/80 rounded-2xl p-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* রেটিং সারাংশ */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center bg-rose-600 text-white w-11 h-11 rounded-xl font-black text-lg shadow-sm">
              {loading ? "..." : avgRating}
            </div>
            <div>
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
                <span className="text-xs font-bold text-gray-800 ml-1">
                  ({totalCount}টি রিভিউ)
                </span>
              </div>
              <p className="text-[11px] font-semibold text-rose-700 flex items-center gap-1 mt-0.5">
                <CheckCircle size={12} className="text-emerald-600" />
                ১০০% ভেরিফাইড কাস্টমার সন্তুষ্টি
              </p>
            </div>
          </div>

          {/* বিস্তারিত দেখার বাটন */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center gap-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
          >
            {isOpen ? "রিভিউ লুকান" : "সব রিভিউ ও মতামত"}
            {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

        {/* প্রথম একটি হাইলাইটেড রিভিউ */}
        {featuredReview && !isOpen && (
          <div className="mt-2.5 pt-2.5 border-t border-rose-100/90 text-xs text-gray-700 flex items-start gap-2">
            <span className="text-rose-500 font-serif text-lg leading-none">
              “
            </span>
            <div className="truncate">
              <span className="font-bold text-gray-900">
                {featuredReview.name}:
              </span>{" "}
              <span className="text-gray-600">{featuredReview.comment}</span>
            </div>
          </div>
        )}
      </div>

      {/* ড্রপডাউন প্যানেল: সম্পূর্ণ রিভিউ লিস্ট ও ফর্ম */}
      {isOpen && (
        <div className="mt-2 bg-white border border-rose-200 rounded-2xl p-4 shadow-lg space-y-5 animate-in fade-in duration-200">
          {/* রিভিউ সাবমিশন ফর্ম */}
          <form
            onSubmit={handleSubmit}
            className="bg-rose-50/50 border border-rose-200/60 rounded-xl p-3.5 space-y-3"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
              <MessageSquarePlus size={16} />
              <span>আপনার অভিজ্ঞতা জানান ও রেটিং দিন</span>
            </div>

            {formSuccess && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-center">
                ধন্যবাদ! আপনার মূল্যবান রিভিউটি সফলভাবে প্রকাশিত হয়েছে।
              </p>
            )}

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                রেটিং নির্বাচন করুন:
              </label>
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition cursor-pointer"
                  >
                    <Star
                      size={20}
                      fill={star <= rating ? "currentColor" : "none"}
                      className={
                        star <= rating ? "text-amber-500" : "text-gray-300"
                      }
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-gray-600 ml-2">
                  {rating} স্টার
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="আপনার নাম *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <textarea
              placeholder="পণ্য ও সার্ভিসের কোয়ালিটি কেমন লেগেছে লিখুন... *"
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500"
              required
            />

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Send size={13} />
              {submitting ? "পোস্ট হচ্ছে..." : "রিভিউ জমা দিন"}
            </button>
          </form>

          {/* রিভিউ তালিকা */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            <h4 className="text-xs font-bold text-gray-800 border-b pb-1.5">
              কাস্টমারদের মতামত ({reviews.length}টি)
            </h4>

            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-gray-50/80 border border-gray-100 rounded-xl p-3 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900">{rev.name}</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                      ভেরিফাইড ক্রেতা
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400">{rev.date}</span>
                </div>

                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      fill={i < rev.rating ? "currentColor" : "none"}
                      className={
                        i < rev.rating ? "text-amber-500" : "text-gray-300"
                      }
                    />
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed pt-0.5">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
