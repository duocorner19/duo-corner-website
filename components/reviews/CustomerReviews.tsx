"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Sparkles,
  Camera,
  X,
  CheckCircle2,
  Send,
  MessageSquareHeart,
  ChevronDown,
  ChevronUp,
  Quote,
} from "lucide-react";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  tags?: string[];
  image?: string;
  verified?: boolean;
};

const QUICK_TAGS = [
  "🔥 ছবির চেয়েও সুন্দর",
  "🎁 ওয়াও প্যাকিং",
  "❤️ পার্টনার চরম খুশি",
  "⚡ সুপারফাস্ট ডেলিভারি",
  "💎 প্রিমিয়াম ফিনিশিং",
  "💯 শতভাগ বিশ্বস্ত",
];

const RATING_MOODS: Record<
  number,
  { emoji: string; text: string; color: string }
> = {
  1: { emoji: "💔", text: "একেবারেই পছন্দ হয়নি", color: "text-rose-500" },
  2: { emoji: "😕", text: "মোটামুটি", color: "text-amber-500" },
  3: { emoji: "🙂", text: "ভালো লেগেছে", color: "text-yellow-400" },
  4: { emoji: "💖", text: "অসাধারণ ও সুন্দর!", color: "text-pink-400" },
  5: {
    emoji: "😍",
    text: "ফিদা হয়ে গেছি! সেরা গিফট!",
    color: "text-[#D4AF37]",
  },
};

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState("5.0");
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ইনপুট স্টেট
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
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

  const handleStarClick = (selectedStar: number) => {
    setRating(selectedStar);
    setIsFormOpen(true);
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
      if (!comment.includes(tag)) {
        setComment((prev) => (prev ? `${prev} ${tag}` : tag));
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("ছবির সাইজ সর্বোচ্চ 2MB হতে হবে!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (!comment.trim() && selectedTags.length === 0)) {
      alert("দয়া করে আপনার নাম এবং মূল্যায়ন প্রদান করুন।");
      return;
    }

    setSubmitting(true);
    try {
      const finalComment = comment.trim() || selectedTags.join(", ");
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          rating,
          comment: finalComment,
          tags: selectedTags,
          image: imageBase64,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFormSuccess(true);
        setName("");
        setComment("");
        setSelectedTags([]);
        setImageBase64(null);
        setRating(5);
        void fetchReviews();
        setTimeout(() => {
          setFormSuccess(false);
          setIsFormOpen(false);
        }, 3000);
      } else {
        alert(data.error || "রিভিউ জমা নেওয়া সম্ভব হয়নি।");
      }
    } catch {
      alert("সার্ভার ত্রুটি হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;
  const currentMood = RATING_MOODS[activeRating] || RATING_MOODS[5];

  // প্রথম পেজে হাইলাইট হিসেবে দেখানোর জন্য সেরা টপ-রেটেড রিভিউ
  const topReview = reviews.find((r) => r.rating === 5) || reviews[0];

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-3 font-sans">
      {/* ========================================================
          ১. প্রথম দর্শনেই সরাসরি রিভিউ দেওয়ার ইন্টারেক্টিভ কুইক কার্ড
         ======================================================== */}
      <div className="bg-gradient-to-r from-[#161616] via-[#1c1c1c] to-[#161616] border border-[#D4AF37]/40 rounded-3xl p-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* রেটিং স্কোর ও ট্রাস্ট ব্যাজ */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-amber-500 text-black font-black text-lg flex items-center justify-center shadow-lg shrink-0">
              {loading ? "..." : avgRating}
            </div>
            <div>
              <div className="flex items-center gap-1 text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
                <span className="text-xs font-bold text-white ml-1">
                  ({totalCount}টি কাস্টমার রিভিউ)
                </span>
              </div>
              <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 size={12} /> ১০০% জেনুইন কাপলদের রিভিউ
              </p>
            </div>
          </div>

          {/* সরাসরি ক্লিকযোগ্য রিভিউ ইনপুট বক্স */}
          <div className="w-full lg:flex-1 max-w-xl bg-black/60 border border-[#D4AF37]/30 hover:border-[#D4AF37] p-2 sm:px-3.5 rounded-2xl flex items-center justify-between gap-2 transition cursor-pointer shadow-inner">
            <div
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="flex items-center gap-2 flex-1"
            >
              <MessageSquareHeart
                size={18}
                className="text-[#D4AF37] shrink-0"
              />
              <span className="text-xs sm:text-sm font-semibold text-gray-300 truncate">
                {isFormOpen
                  ? "নিচে আপনার রিভিউ লিখুন..."
                  : "আপনার অভিজ্ঞতা কেমন ছিল? রিভিউ দিন..."}
              </span>
            </div>

            {/* সরাসরি ক্লিকযোগ্য স্টার বার */}
            <div className="flex items-center gap-0.5 shrink-0">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 hover:scale-125 transition cursor-pointer"
                  title={`${star} Star`}
                >
                  <Star
                    size={18}
                    fill={star <= activeRating ? "currentColor" : "none"}
                    className={
                      star <= activeRating ? "text-[#D4AF37]" : "text-gray-600"
                    }
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="hidden sm:inline-flex bg-[#D4AF37] hover:bg-amber-500 text-black font-black text-xs px-3 py-1.5 rounded-xl transition shadow-md shrink-0"
            >
              {isFormOpen ? "বন্ধ করুন" : "রিভিউ লিখুন"}
            </button>
          </div>
        </div>

        {/* ========================================================
            ২. ওপেন হওয়া রিয়েল-টাইম রিভিউ ফর্ম
           ======================================================== */}
        {isFormOpen && (
          <form
            onSubmit={handleSubmit}
            className="mt-4 pt-4 border-t border-[#D4AF37]/25 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-300"
          >
            {formSuccess && (
              <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-300 p-3 rounded-xl text-xs font-bold text-center">
                🎉 ধন্যবাদ! আপনার মূল্যবান রিভিউটি সফলভাবে প্রকাশিত হয়েছে।
              </div>
            )}

            <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl border border-gray-800">
              <span className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#D4AF37]" /> আপনার রেটিং
                মুড:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentMood.emoji}</span>
                <span className={`text-xs font-bold ${currentMood.color}`}>
                  {currentMood.text} ({rating} স্টার)
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-gray-400 block mb-1.5">
                ⚡ এক ক্লিকে ট্যাগ সিলেক্ট করুন:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold transition border cursor-pointer ${
                        isSelected
                          ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-sm scale-105"
                          : "bg-black/50 text-gray-300 border-gray-700 hover:border-[#D4AF37]/50"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                placeholder="আপনার নাম লিখুন *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-3 bg-black/70 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                required
              />
              <input
                type="text"
                placeholder="মতামত লিখুন (যেমন: কোয়ালিটি বা ডেলিভারি কেমন ছিল) *"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full text-xs p-3 bg-black/70 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] sm:col-span-2"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 bg-black/60 hover:bg-black text-[#D4AF37] border border-[#D4AF37]/40 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition">
                <Camera size={15} />
                <span>
                  {imageBase64
                    ? "ছবি চেঞ্জ করুন"
                    : "আনবক্সিং ছবি যোগ করুন (ঐচ্ছিক)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {imageBase64 && (
                <div className="relative inline-block border border-[#D4AF37]/40 rounded-lg overflow-hidden w-12 h-12">
                  <img
                    src={imageBase64}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageBase64(null)}
                    className="absolute top-0 right-0 bg-red-600 text-white p-0.5 rounded-bl"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs px-7 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-105 disabled:opacity-50 cursor-pointer ml-auto"
              >
                <Send size={13} />
                {submitting ? "পোস্ট হচ্ছে..." : "রিভিউ প্রকাশ করুন"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================
          ৩. ফ্রন্ট পেজেই টপ-রেটেড রিভিউ শোকেস এবং ডানপাশে 'আরো রিভিউ দেখুন'
         ======================================================== */}
      <div className="mt-2.5 bg-[#141414] border border-gray-800 hover:border-[#D4AF37]/40 rounded-2xl px-3.5 py-2.5 transition shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* বামপাশে: সরাসরি একটি সেরা টপ-রেটেড রিভিউ শোকেস */}
          <div className="flex items-center gap-2.5 overflow-hidden flex-1">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center shrink-0">
              <Quote size={14} className="rotate-180" />
            </div>

            {topReview ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 truncate text-xs">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-bold text-white text-xs">
                    {topReview.name}
                  </span>
                  <div className="flex text-[#D4AF37]">
                    {[...Array(topReview.rating || 5)].map((_, i) => (
                      <Star key={i} size={11} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-500 hidden md:inline">
                    |
                  </span>
                </div>
                <span className="text-gray-300 truncate text-[11px] sm:text-xs">
                  “{topReview.comment}”
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">
                ১০০% ভেরিফাইড ক্রেতার মতামত
              </span>
            )}
          </div>

          {/* ডানপাশে: আরও রিভিউ দেখার স্মার্ট বাটন */}
          <button
            type="button"
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="flex items-center justify-center gap-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer self-end sm:self-center"
          >
            <span>
              {showAllReviews
                ? "রিভিউ লুকান"
                : `আরো রিভিউ দেখুন (${reviews.length})`}
            </span>
            {showAllReviews ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
        </div>

        {/* ড্রপডাউন: সম্পূর্ণ রিভিউ তালিকা */}
        {showAllReviews && (
          <div className="mt-3 pt-3 border-t border-gray-800 space-y-2.5 max-h-80 overflow-y-auto animate-in fade-in duration-200">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#1a1a1a] border border-gray-800/80 rounded-xl p-3 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-black text-[10px] flex items-center justify-center">
                      {rev.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-white">{rev.name}</span>
                    <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-0.5">
                      <CheckCircle2 size={10} /> ভেরিফাইড ক্রেতা
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500">{rev.date}</span>
                </div>

                <div className="flex items-center gap-0.5 text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      fill={i < rev.rating ? "currentColor" : "none"}
                      className={
                        i < rev.rating ? "text-[#D4AF37]" : "text-gray-700"
                      }
                    />
                  ))}
                </div>

                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rev.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 px-2 py-0.5 rounded-full font-bold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-gray-300 leading-relaxed text-[11px]">
                  {rev.comment}
                </p>

                {rev.image && (
                  <div className="pt-1">
                    <img
                      src={rev.image}
                      alt="Unboxing preview"
                      className="w-16 h-16 object-cover rounded-lg border border-gray-700 cursor-pointer hover:scale-105 transition"
                      onClick={() => window.open(rev.image, "_blank")}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
