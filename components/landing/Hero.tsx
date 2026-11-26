'use client';

type HeroProps = {
  onHome: () => void;
};

export default function Hero({ onHome }: HeroProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-2 max-w-7xl mx-auto">
      <div
        onClick={onHome}
        className="group relative isolate aspect-[3/1] min-h-[260px] sm:min-h-[340px] w-full cursor-pointer overflow-hidden rounded-[28px] border border-[#D4AF37]/30 shadow-[0_20px_50px_rgba(212,175,55,0.15)] bg-[#101010]"
      >
        <img
          src="/banner.webp"
          alt="Duo Corner Luxury Couple Gifts"
          width={1355}
          height={452}
          loading="eager"
          fetchPriority="high"
          decoding="sync"
          className="absolute inset-0 h-full w-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            const img = e.currentTarget;
            img.onerror = null; // ইনফিনিট লুপ আটকাতে
            img.src = '/parl.webp';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-start pt-6 sm:pt-8 px-6 sm:px-12 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-black/40 px-3.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] w-max mb-2 sm:mb-3 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            DUO CORNER • EXCLUSIVE COLLECTION
          </div>

          {/* দুই লাইনে বিভক্ত প্রিমিয়াম বড় হেডিং ও নিখুঁত কালার কম্বিনেশন */}
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug mb-2">
            ভালোবাসার মুহূর্ত হোক <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-amber-200">
              আরও বেশি স্পেশাল
            </span>
          </h1>
        </div>
      </div>
    </section>
  );
}