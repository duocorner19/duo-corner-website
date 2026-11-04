"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";

type CheckoutFormProps = {
  fullName: string;
  setFullName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  selectedDivision: string;
  handleDivisionChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  divisions: string[];
  selectedDistrict: string;
  handleDistrictChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  districts: string[];
  selectedThana: string;
  setSelectedThana: (val: string) => void;
  thanas: string[];
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  coupon: string;
  setCoupon: (val: string) => void;
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
  selectedDivision,
  handleDivisionChange,
  divisions,
  selectedDistrict,
  handleDistrictChange,
  districts,
  selectedThana,
  setSelectedThana,
  thanas,
  paymentMethod,
  setPaymentMethod,
  coupon,
  setCoupon,
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
  subtotal,
  deliveryCharge,
  total,
}: CheckoutFormProps) {
  // ঘরগুলোর জন্য নরমাল লাইট অ্যাশ ব্যাকগ্রাউন্ড ক্লাস
  const ashInputClass =
    "w-full bg-[#242426] border border-gray-600/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition shadow-inner";

  return (
    <div
      id="one-page-checkout"
      className="bg-[#121212] rounded-3xl p-4 sm:p-6 shadow-2xl border border-[#D4AF37]/30 scroll-mt-6 font-sans relative text-gray-200"
    >
      <form onSubmit={handleOrderSubmit} className="space-y-4">
        {/* Order review */}
        <div>
          <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-[#D4AF37] rounded-full"></span>{" "}
            Order review
          </h3>
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image
                src={selectedImage}
                alt=""
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl object-cover border border-gray-700 shrink-0"
              />
              <div>
                <h4 className="text-xs font-bold text-white line-clamp-1">
                  {productName}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-black text-[#D4AF37]">
                    ৳{offerPrice * quantity}
                  </span>
                  {regularPrice > offerPrice && (
                    <span className="text-[10px] text-gray-400 line-through">
                      ৳{regularPrice * quantity}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center border border-gray-700 rounded-xl bg-[#242426] overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-2.5 py-1 text-gray-300 hover:text-white hover:bg-gray-700 font-bold text-xs transition"
              >
                -
              </button>
              <span className="px-3 py-1 text-xs font-bold text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="px-2.5 py-1 text-gray-300 hover:text-white hover:bg-gray-700 font-bold text-xs transition"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Shipping Address (ধবধবে সাদা সরিয়ে হালকা অ্যাশ কালারের বক্স) */}
        <div>
          <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-[#D4AF37] rounded-full"></span>{" "}
            Shipping Address
          </h3>

          <div className="space-y-2.5">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your Full Name *"
              required
              className={ashInputClass}
            />

            <div className="flex items-center border border-gray-600/60 rounded-xl overflow-hidden bg-[#242426] focus-within:border-[#D4AF37] focus-within:ring-1 focus-within:ring-[#D4AF37] transition shadow-inner">
              <div className="bg-black/30 px-3 py-2.5 text-xs font-bold text-gray-300 border-r border-gray-600/60">
                88
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017********"
                maxLength={11}
                required
                className="w-full bg-transparent px-3 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-300 mb-1">
                  বিভাগ (Division)
                </label>
                <select
                  value={selectedDivision}
                  onChange={handleDivisionChange}
                  className={`${ashInputClass} py-2 cursor-pointer`}
                >
                  {divisions.map((div) => (
                    <option
                      key={div}
                      value={div}
                      className="bg-[#242426] text-white"
                    >
                      {div}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-300 mb-1">
                  জেলা (District)
                </label>
                <select
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  className={`${ashInputClass} py-2 cursor-pointer`}
                >
                  {districts.map((dist) => (
                    <option
                      key={dist}
                      value={dist}
                      className="bg-[#242426] text-white"
                    >
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-300 mb-1">
                থানা / উপজেলা (Thana)
              </label>
              <select
                value={selectedThana}
                onChange={(e) => setSelectedThana(e.target.value)}
                className={`${ashInputClass} py-2 cursor-pointer`}
              >
                {thanas.map((thana) => (
                  <option
                    key={thana}
                    value={thana}
                    className="bg-[#242426] text-white"
                  >
                    {thana}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ex: House no. / building / street / area *"
              required
              className={ashInputClass}
            />
          </div>
        </div>

        {/* Payment method */}
        <div>
          <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-3.5 bg-[#D4AF37] rounded-full"></span>{" "}
            Payment method
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={() => setPaymentMethod("cod")}
              className={`border rounded-xl p-3 flex items-center justify-between cursor-pointer transition ${
                paymentMethod === "cod"
                  ? "border-[#D4AF37] bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]"
                  : "border-gray-700 bg-[#242426] hover:border-gray-500"
              }`}
            >
              <span className="text-xs font-bold text-gray-200">
                💵 Cash On Delivery
              </span>
              <input
                type="radio"
                checked={paymentMethod === "cod"}
                readOnly
                className="accent-[#D4AF37]"
              />
            </div>

            <div
              onClick={() => setPaymentMethod("online")}
              className={`border rounded-xl p-3 flex items-center justify-between cursor-pointer transition ${
                paymentMethod === "online"
                  ? "border-[#D4AF37] bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]"
                  : "border-gray-700 bg-[#242426] hover:border-gray-500"
              }`}
            >
              <span className="text-xs font-bold text-gray-200">
                💳 Online Payment
              </span>
              <input
                type="radio"
                checked={paymentMethod === "online"}
                readOnly
                className="accent-[#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* Coupon Section */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-2.5">
          <div className="flex gap-2">
            <input
              type="text"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Have any coupon or voucher?"
              className="flex-1 bg-[#242426] border border-gray-600/60 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              type="button"
              className="bg-[#D4AF37] hover:bg-amber-500 text-black px-3.5 py-1.5 rounded-lg text-xs font-black cursor-pointer transition shadow"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="space-y-1.5 border-t border-b border-gray-800 py-3 text-xs">
          <div className="flex justify-between text-gray-400">
            <span>Sub total</span>
            <span className="font-bold text-white">{subtotal}.00 BDT</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Delivery cost</span>
            <span className="font-bold text-white">
              {deliveryCharge}.00 BDT
            </span>
          </div>
          <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-gray-800/60">
            <span>Total</span>
            <span className="text-[#D4AF37] text-base">{total}.00 BDT</span>
          </div>
        </div>

        {/* Special Notes */}
        <div>
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Special notes (Optional)
          </label>
          <input
            type="text"
            value={specialNote}
            onChange={(e) => setSpecialNote(e.target.value)}
            placeholder="অর্ডার সংক্রান্ত কোনো নির্দেশনা থাকলে লিখুন..."
            className={ashInputClass}
          />
        </div>

        {/* প্রিমিয়াম মানবিক নোটিশ + সম্মতি কার্ড */}
        <div className="bg-gradient-to-r from-[#181818] via-[#221c15] to-[#181818] border border-[#D4AF37]/45 rounded-2xl p-3.5 space-y-2 text-xs shadow-md">
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

          <label className="flex items-start gap-2.5 pt-2 border-t border-gray-800/80 cursor-pointer select-none">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#D4AF37] rounded cursor-pointer shrink-0"
            />
            <span className="text-[11px] text-gray-300 leading-snug">
              আমি নোটিশটি পড়েছি এবং{" "}
              <span className="text-[#D4AF37] underline font-bold">
                Terms, Privacy & Refund Policy
              </span>{" "}
              মেনে অর্ডার কনফার্ম করছি।
            </span>
          </label>
        </div>

        {/* অর্ডার সাবমিট বাটন */}
        <button
          type="submit"
          disabled={loading || !agreed}
          className={`w-full font-black py-4 rounded-xl shadow-xl transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer ${
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
          ) : (
            `Submit Order (${total}.00 BDT)`
          )}
        </button>
      </form>
    </div>
  );
}
