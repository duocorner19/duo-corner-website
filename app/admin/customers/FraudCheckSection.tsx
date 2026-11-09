"use client";

import Image from "next/image";
import {
  Loader2,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  CheckCircle2,
} from "lucide-react";

type CheckoutFormProps = {
  fullName: string;
  setFullName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  selectedDivision?: string;
  handleDivisionChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  divisions?: string[];
  selectedDistrict: string;
  handleDistrictChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  districts: string[];
  selectedThana?: string;
  setSelectedThana?: (val: string) => void;
  thanas?: string[];
  paymentMethod?: string;
  setPaymentMethod?: (val: string) => void;
  coupon?: string;
  setCoupon?: (val: string) => void;
  specialNote: string;
  setSpecialNote: (val: string) => void;
  agreed: boolean;
  setAgreed: (val: boolean) => void;
  loading: boolean;
  handleOrderSubmit: (e: React.FormEvent) => void;
  productName: string;
  offerPrice: number;
  regularPrice: number;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  selectedImage: string;
  subtotal: number;
  deliveryCharge: number;
  total: number;
};

export default function CheckoutForm({
  fullName,
  setFullName,
  phone,
  setPhone,
  address,
  setAddress,
  selectedDistrict,
  handleDistrictChange,
  districts,
  specialNote,
  setSpecialNote,
  agreed,
  setAgreed,
  loading,
  handleOrderSubmit,
  productName,
  offerPrice,
  regularPrice,
  quantity,
  setQuantity,
  selectedImage,
  deliveryCharge,
  total,
}: CheckoutFormProps) {
  const inputClass =
    "w-full bg-[#1e1e22] border border-gray-700/80 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition shadow-inner";

  return (
    <div
      id="one-page-checkout"
      className="bg-[#121214] rounded-3xl p-4 sm:p-7 shadow-2xl border border-[#D4AF37]/30 font-sans text-gray-200 relative overflow-hidden"
    >
      {/* টপ হেডার নোটিশ */}
      <div className="text-center mb-5 border-b border-gray-800 pb-3">
        <h2 className="text-xs sm:text-sm font-black text-[#D4AF37] tracking-wider uppercase flex items-center justify-center gap-1.5">
          <span>⚡</span> অর্ডার কনফার্ম করতে নিচের সাধারণ তথ্যগুলো দিন
        </h2>
      </div>

      <form onSubmit={handleOrderSubmit} className="space-y-5">
        {/* ১. অর্ডারের পণ্য ও পরিমাণ (Product Review Box) */}
        <div>
          <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-[#D4AF37] rounded-full"></span>{" "}
            অর্ডারের পণ্য ও পরিমাণ
          </h3>
          <div className="bg-[#1a1a1e] border border-gray-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <Image
                src={selectedImage}
                alt={productName}
                width={60}
                height={60}
                className="w-14 h-14 rounded-xl object-cover border border-gray-700 shrink-0"
              />
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                  {productName}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs sm:text-sm font-black text-[#D4AF37]">
                    ৳{offerPrice}
                  </span>
                  {regularPrice > offerPrice && (
                    <span className="text-[11px] text-gray-500 line-through">
                      ৳{regularPrice}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  ডেলিভারি চার্জ সহ মোট:{" "}
                  <span className="text-[#D4AF37] font-bold">৳{total}</span> (
                  {selectedDistrict === "ঢাকা"
                    ? "ঢাকার ভেতর ৳১০০"
                    : "ঢাকার বাইরে ৳১৪০"}
                  )
                </p>
              </div>
            </div>

            {/* কোয়ান্টিটি কন্ট্রোল (- / +) */}
            <div className="flex items-center border border-gray-700 rounded-xl bg-[#242428] overflow-hidden shrink-0 shadow self-end sm:self-center">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3.5 py-2 text-gray-300 hover:text-white hover:bg-gray-700 font-bold text-xs transition cursor-pointer"
              >
                -
              </button>
              <span className="px-4 py-2 text-xs font-black text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3.5 py-2 text-gray-300 hover:text-white hover:bg-gray-700 font-bold text-xs transition cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
            * পণ্য ১টির বেশি নিতে চাইলে + বাটনে চাপুন (সর্বনিম্ন ১টি)
          </p>
        </div>

        {/* ২. ডেলিভারির ঠিকানা (Shipping Address) */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-[#D4AF37] rounded-full"></span>{" "}
            ডেলিভারির ঠিকানা
          </h3>

          {/* আপনার পুরো নাম */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1 flex items-center gap-1">
              <User size={12} className="text-[#D4AF37]" /> আপনার পুরো নাম *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="যেমন: মোঃ ইমরান হোসেন"
              required
              className={inputClass}
            />
          </div>

          {/* মোবাইল নম্বর */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1 flex items-center gap-1">
              <Phone size={12} className="text-[#D4AF37]" /> মোবাইল নম্বর *
            </label>
            <div className="flex items-center border border-gray-700/80 rounded-2xl overflow-hidden bg-[#1e1e22] focus-within:border-[#D4AF37] transition shadow-inner">
              <div className="bg-black/40 px-3.5 py-3.5 text-xs font-bold text-gray-400 border-r border-gray-700">
                +88
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                maxLength={11}
                required
                className="w-full bg-transparent px-3.5 py-3.5 text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          {/* জেলা ড্রপডাউন (৬৪ জেলা) */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1 flex items-center gap-1">
              <MapPin size={12} className="text-[#D4AF37]" /> জেলা বেছে নিন *
            </label>
            <select
              value={selectedDistrict}
              onChange={handleDistrictChange}
              className={`${inputClass} cursor-pointer`}
              required
            >
              {districts.map((dist) => (
                <option
                  key={dist}
                  value={dist}
                  className="bg-[#1e1e22] text-white"
                >
                  {dist}{" "}
                  {dist === "ঢাকা"
                    ? "(ডেলিভারি চার্জ: ৳১০০)"
                    : "(ডেলিভারি চার্জ: ৳১৪০)"}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-amber-400/90 mt-1 ml-1">
              * ঢাকা ছাড়া অন্য জেলা সিলেক্ট করলে ডেলিভারি চার্জ ৳১৪০ হবে
            </p>
          </div>

          {/* সম্পূর্ণ ঠিকানা */}
          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1">
              সম্পূর্ণ ঠিকানা (বাসা নং, রোড, থানা/উপজেলা) *
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="যেমন: বাড়ি ১২, রোড ৪, থানা বা এলাকার নাম লিখুন..."
              required
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* ৩. অর্ডার সংক্রান্ত কোনো নির্দেশনা (Optional) */}
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            অর্ডার সংক্রান্ত কোনো নির্দেশনা থাকলে লিখুন... (Optional)
          </label>
          <input
            type="text"
            value={specialNote}
            onChange={(e) => setSpecialNote(e.target.value)}
            placeholder="যেমন: পার্সেলটি বিকেলে ডেলিভারি দিলে ভালো হয়..."
            className={inputClass}
          />
        </div>

        {/* ৪. মানবিক নোটিশ ও সম্মতি কার্ড */}
        <div className="bg-gradient-to-r from-[#18181c] via-[#221c15] to-[#18181c] border border-[#D4AF37]/45 rounded-2xl p-4 space-y-3 text-xs shadow-md">
          <p className="font-medium text-[11px] leading-relaxed text-gray-300">
            🥀 <span className="font-bold text-[#D4AF37]">প্রিয় গ্রাহক:</span>{" "}
            আমাদের লভ্যাংশের টাকা দিয়ে অসহায় দুঃস্থ মানুষদের খাবারের ব্যবস্থা
            করা হবে।{" "}
            <span className="text-rose-400 font-semibold">
              ❌ বিনা প্রয়োজনে ফেইক অর্ডার করে ক্ষতি করবেন না।
            </span>{" "}
            <span className="text-emerald-400 font-semibold">
              ✅ আপনার সুবিধার্থে সম্পূর্ণ ক্যাশ অন ডেলিভারিতে পার্সেল পাঠানো
              হবে!
            </span>
          </p>

          <label className="flex items-start gap-2.5 pt-2 border-t border-gray-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#D4AF37] rounded cursor-pointer shrink-0"
            />
            <span className="text-[11px] text-gray-300 leading-snug">
              আমি নোটিশটি পড়েছি এবং{" "}
              <span className="text-[#D4AF37] underline font-bold">
                Terms & Refund Policy
              </span>{" "}
              মেনে অর্ডার কনফার্ম করছি।
            </span>
          </label>
        </div>

        {/* ৫. অর্ডার সাবমিট বাটন */}
        <button
          type="submit"
          disabled={loading || !agreed}
          className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer ${
            agreed && !loading
              ? "bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black shadow-[#D4AF37]/25 active:scale-[0.99]"
              : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
          }`}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2 text-black">
              <Loader2 size={16} className="animate-spin" />
              অর্ডার প্রসেস হচ্ছে...
            </span>
          ) : !agreed ? (
            `🔒 অর্ডার কনফার্ম করুন (সর্বমোট: ৳${total})`
          ) : (
            `🛍️ অর্ডার কনফার্ম করুন (সর্বমোট: ৳${total})`
          )}
        </button>

        {/* পেমেন্ট ইনফো ফুটার */}
        <div className="text-center pt-1">
          <p className="text-[11px] font-bold text-emerald-400 flex items-center justify-center gap-1">
            <CheckCircle2 size={13} /> ক্যাশ অন ডেলিভারি (পার্সেল হাতে পেয়ে
            ডেলিভারিম্যানকে টাকা দিন)
          </p>
        </div>
      </form>
    </div>
  );
}
