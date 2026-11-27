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

const INPUT_CLASS =
  "w-full bg-[#1b1d21] border border-[#2f333a] rounded-lg px-3 py-2.5 text-xs sm:text-[13px] text-gray-100 placeholder-gray-500 focus:outline-none focus:border-[#c8963e] transition";

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
  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () => setQuantity((q) => q + 1);

  return (
    <section
      id="one-page-checkout"
      className="bg-[#141619] rounded-xl p-3.5 sm:p-5 border border-[#2a2e35] font-sans text-gray-200 scroll-mt-4"
    >
      <div className="pb-3 mb-4 border-b border-[#262a30]">
        <h2 className="text-sm sm:text-base font-bold text-white">
          অর্ডার কনফার্ম করতে নিচের তথ্যগুলো দিন
        </h2>
      </div>

      <form onSubmit={handleOrderSubmit} className="space-y-3.5">
        <div>
          <h3 className="text-xs font-bold text-[#d4a24c] mb-2">
            অর্ডারের পণ্য ও পরিমাণ
          </h3>

          <div className="bg-[#1a1c20] border border-[#2b2f36] rounded-lg p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Image
                src={selectedImage}
                alt={productName}
                width={56}
                height={56}
                className="w-14 h-14 rounded-lg object-cover border border-[#2f333a] shrink-0"
              />

              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  {productName}
                </h4>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs sm:text-sm font-bold text-[#e0b056]">
                    ৳{offerPrice}
                  </span>
                  {regularPrice > offerPrice && (
                    <span className="text-[11px] text-gray-500 line-through">
                      ৳{regularPrice}
                    </span>
                  )}
                </div>

                <div className="mt-1 text-[11px] text-gray-300">
                  ডেলিভারি চার্জ (৳{deliveryCharge}) সহ মোট:{" "}
                  <span className="font-bold text-[#e0b056]">৳{total}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center border border-[#32363e] rounded-lg bg-[#141619] shrink-0">
              <button
                type="button"
                onClick={decreaseQty}
                className="w-7 h-7 flex items-center justify-center text-gray-300 hover:bg-[#262930] font-bold text-sm cursor-pointer rounded-l-lg"
                aria-label="পরিমাণ কমান"
              >
                -
              </button>
              <span className="px-2.5 text-xs font-bold text-white select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={increaseQty}
                className="w-7 h-7 flex items-center justify-center text-gray-300 hover:bg-[#262930] font-bold text-sm cursor-pointer rounded-r-lg"
                aria-label="পরিমাণ বাড়ান"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#d4a24c]">ডেলিভারির ঠিকানা</h3>

          <div>
            <label className="text-[11px] font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              <User size={12} className="text-[#d4a24c]" /> আপনার পুরো নাম{" "}
              <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="আপনার পুরো নাম লিখুন"
              required
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              <Phone size={12} className="text-[#d4a24c]" /> মোবাইল নম্বর{" "}
              <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center border border-[#2f333a] rounded-lg overflow-hidden bg-[#1b1d21] focus-within:border-[#c8963e]">
              <span className="bg-[#141619] px-3 py-2.5 text-xs font-bold text-[#d4a24c] border-r border-[#2f333a] select-none">
                +88
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                maxLength={11}
                required
                className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-[13px] text-gray-100 placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
              <MapPin size={12} className="text-[#d4a24c]" /> জেলা বেছে নিন{" "}
              <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                className={`${INPUT_CLASS} appearance-none pr-9 cursor-pointer`}
                required
              >
                {districts.map((dist) => (
                  <option
                    key={dist}
                    value={dist}
                    className="bg-[#1b1d21] text-gray-100"
                  >
                    {dist}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-300 mb-1">
              সম্পূর্ণ ঠিকানা (বাসা নং, রোড, থানা/এলাকা){" "}
              <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="বাসা বা হোল্ডিং নম্বর, রোড এবং থানা/এলাকার বিস্তারিত লিখুন"
              required
              className={`${INPUT_CLASS} resize-none`}
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <FileText size={12} className="text-[#d4a24c]" /> অর্ডার সংক্রান্ত
            কোনো নির্দেশনা (Optional)
          </label>
          <input
            type="text"
            value={specialNote}
            onChange={(e) => setSpecialNote(e.target.value)}
            placeholder="যেমন: পার্সেলটি বিকেলে দিলে সুবিধা হয়"
            className={INPUT_CLASS}
          />
        </div>

        <label
          className={`flex items-start gap-2.5 rounded-lg p-3 cursor-pointer select-none border transition ${
            agreed
              ? "bg-[#1f1c14] border-[#c8963e]"
              : "bg-[#191b1f] border-[#2c3038] hover:border-[#3d434e]"
          }`}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[#d4a24c] rounded cursor-pointer shrink-0"
          />
          <span className="text-[11px] sm:text-xs text-gray-200 leading-relaxed space-y-1">
            <span className="block">
              প্রিয় গ্রাহক, আপনি জেনেছেন আমাদের লভ্যাংশের টাকা দিয়ে অসহায়
              দুঃস্থ মানুষদের খাবারের ব্যবস্থা করা হবে , আপনিও আমাদের সেই মহৎ
              কাজের সঙ্গী হতে চলেছেন🥀
            </span>
            <span className="block text-red-400 font-medium">
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
          className={`w-full font-bold py-3 rounded-lg transition text-xs sm:text-sm flex items-center justify-center gap-2 ${
            agreed && !loading
              ? "bg-[#d4a24c] hover:bg-[#c3913b] text-[#111315] cursor-pointer"
              : "bg-[#22252b] text-gray-500 cursor-not-allowed border border-[#2e323b]"
          }`}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={15} className="animate-spin" /> অর্ডার প্রসেস
              হচ্ছে...
            </span>
          ) : (
            `🛍️ অর্ডার কনফার্ম করুন (সর্বমোট: ৳${total})`
          )}
        </button>

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-0.5 text-[11px] font-semibold">
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={12} /> ক্যাশ অন ডেলিভারি (হাতে পেয়ে মূল্য
            পরিশোধ)
          </span>
          <span className="text-gray-600">•</span>
          <span className="text-[#d4a24c] flex items-center gap-1">
            <ShieldCheck size={12} /> ১০০% নিরাপদ ও যাচাইকৃত পার্সেল
          </span>
        </div>
      </form>
    </section>
  );
}
