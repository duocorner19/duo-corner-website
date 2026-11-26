"use client";

import Image from "next/image";
import {
  Loader2,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  ChevronDown,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type CheckoutFormProps = {
  fullName: string;
  setFullName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  selectedDistrict: string;
  handleDistrictChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  districts: string[];
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

const FIELD_INPUT_STYLE =
  "w-full bg-[#202025] border border-gray-700/70 rounded-2xl px-4 py-3.5 text-xs sm:text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:bg-[#25252b] focus:ring-2 focus:ring-[#D4AF37]/20 transition duration-200";

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
  const decreaseQty = () => setQuantity((prev) => Math.max(1, prev - 1));
  const increaseQty = () => setQuantity((prev) => prev + 1);

  return (
    <section
      id="one-page-checkout"
      className="bg-gradient-to-b from-[#141417] to-[#0e0e11] rounded-3xl p-4 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-[#D4AF37]/30 font-sans text-gray-200 relative overflow-hidden scroll-mt-6"
    >
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80" />

      <div className="text-center mb-6 border-b border-gray-800/80 pb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-2">
          <Sparkles size={11} /> Express Checkout
        </span>
        <h2 className="text-sm sm:text-base font-black text-white tracking-wide">
          অর্ডার কনফার্ম করতে নিচের তথ্যগুলো দিন
        </h2>
      </div>

      <form onSubmit={handleOrderSubmit} className="space-y-5">
        <div>
          <h3 className="text-[11px] font-black text-[#D4AF37] uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-gradient-to-b from-[#D4AF37] to-amber-600 rounded-full" />
            অর্ডারের পণ্য ও পরিমাণ
          </h3>

          <div className="bg-[#19191e] border border-gray-800/90 hover:border-[#D4AF37]/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div className="relative shrink-0">
                <Image
                  src={selectedImage}
                  alt={productName}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-xl object-cover border border-[#D4AF37]/30"
                />
                <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {quantity}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
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

                <div className="mt-1.5 inline-flex items-center gap-1.5 bg-black/40 border border-gray-800 px-2.5 py-1 rounded-lg">
                  <span className="text-[10px] sm:text-[11px] text-gray-300">
                    ডেলিভারি চার্জ (৳{deliveryCharge}) সহ মোট:
                  </span>
                  <span className="text-xs sm:text-sm font-black text-[#D4AF37]">
                    ৳{total}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center border border-gray-700/80 rounded-xl bg-[#222228] p-0.5 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={decreaseQty}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-black hover:bg-[#D4AF37] font-black text-sm transition cursor-pointer"
                aria-label="পরিমাণ কমান"
              >
                -
              </button>
              <span className="px-3.5 text-xs sm:text-sm font-black text-white select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={increaseQty}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-black hover:bg-[#D4AF37] font-black text-sm transition cursor-pointer"
                aria-label="পরিমাণ বাড়ান"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3.5">
          <h3 className="text-[11px] font-black text-[#D4AF37] uppercase tracking-wider mb-1 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-gradient-to-b from-[#D4AF37] to-amber-600 rounded-full" />
            ডেলিভারির ঠিকানা
          </h3>

          <div>
            <label className="text-[11px] font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <User size={13} className="text-[#D4AF37]" /> আপনার পুরো নাম{" "}
              <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="আপনার পুরো নাম লিখুন"
              required
              className={FIELD_INPUT_STYLE}
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Phone size={13} className="text-[#D4AF37]" /> মোবাইল নম্বর{" "}
              <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center border border-gray-700/70 rounded-2xl overflow-hidden bg-[#202025] focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/20 transition duration-200">
              <span className="bg-black/40 px-3.5 py-3.5 text-xs font-extrabold text-[#D4AF37] border-r border-gray-700/70 select-none">
                +88
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                maxLength={11}
                required
                className="w-full bg-transparent px-3.5 py-3.5 text-xs sm:text-[13px] text-white placeholder-gray-500 focus:outline-none tracking-wide"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <MapPin size={13} className="text-[#D4AF37]" /> জেলা বেছে নিন{" "}
              <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                className={`${FIELD_INPUT_STYLE} appearance-none pr-10 cursor-pointer font-medium`}
                required
              >
                {districts.map((dist) => (
                  <option
                    key={dist}
                    value={dist}
                    className="bg-[#1c1c21] text-white"
                  >
                    {dist}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="text-[#D4AF37] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-300 mb-1.5">
              সম্পূর্ণ ঠিকানা (বাসা নং, রোড, থানা/এলাকা){" "}
              <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="বাসা বা হোল্ডিং নম্বর, রোড এবং থানা/এলাকার বিস্তারিত লিখুন"
              required
              className={`${FIELD_INPUT_STYLE} resize-none leading-relaxed`}
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FileText size={12} className="text-[#D4AF37]" /> অর্ডার সংক্রান্ত
            কোনো নির্দেশনা (Optional)
          </label>
          <input
            type="text"
            value={specialNote}
            onChange={(e) => setSpecialNote(e.target.value)}
            placeholder="যেমন: পার্সেলটি বিকেলে দিলে সুবিধা হয়"
            className={FIELD_INPUT_STYLE}
          />
        </div>

        <label
          className={`flex items-start gap-2.5 rounded-2xl p-4 cursor-pointer select-none group transition-colors border ${
            agreed
              ? "bg-gradient-to-r from-[#1c1a14] via-[#252015] to-[#1c1a14] border-[#D4AF37]/70"
              : "bg-gradient-to-r from-[#18181c] via-[#1f1b16] to-[#18181c] border-[#D4AF37]/35 hover:border-[#D4AF37]/55"
          }`}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[#D4AF37] rounded cursor-pointer shrink-0"
          />
          <span className="text-[11px] sm:text-xs text-gray-200 group-hover:text-white leading-relaxed transition-colors space-y-1">
            <span className="block">
              প্রিয় গ্রাহক, আপনি জেনেছেন আমাদের লভ্যাংশের টাকা দিয়ে অসহায়
              দুঃস্থ মানুষদের খাবারের ব্যবস্থা করা হবে , আপনিও আমাদের সেই মহৎ
              কাজের সঙ্গী হতে চলেছেন🥀
            </span>
            <span className="block text-rose-400 font-medium">
              ❌বিনা প্রয়োজনে ফেইক অর্ডার করে এক টাকারও ক্ষতি করলে সেটা লভ্যাংশ
              থেকে কমে যাবে এবং সেই দায় আপনার উপরে থাকবে,
            </span>
            <span className="block text-emerald-400 font-medium">
              ✅আপনার বিশ্বস্ততার জন্য সম্পূর্ণ ক্যাশ অন ডেলিভারিতে প্রোডাক্টটি
              পাঠানো হবে! ধন্যবাদ,!
            </span>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !agreed}
          className={`w-full font-black py-4 rounded-2xl transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-2 tracking-wide ${
            agreed && !loading
              ? "bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37] hover:brightness-110 text-black active:scale-[0.98] cursor-pointer"
              : "bg-[#1e1e24] text-gray-500 cursor-not-allowed border border-gray-800"
          }`}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2 text-black">
              <Loader2 size={16} className="animate-spin" /> অর্ডার প্রসেস
              হচ্ছে...
            </span>
          ) : (
            `🛍️ অর্ডার কনফার্ম করুন (সর্বমোট: ৳${total})`
          )}
        </button>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-[11px] font-bold">
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={13} /> ক্যাশ অন ডেলিভারি (হাতে পেয়ে মূল্য
            পরিশোধ)
          </span>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <span className="text-[#D4AF37]/90 flex items-center gap-1">
            <ShieldCheck size={13} /> ১০০% নিরাপদ ও যাচাইকৃত পার্সেল
          </span>
        </div>
      </form>
    </section>
  );
}
