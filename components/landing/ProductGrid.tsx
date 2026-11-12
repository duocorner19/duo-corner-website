/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import type { Product } from "@/lib/data";
import { products as localProducts } from "@/lib/data";
import Loader from "@/components/Loader";
import Image from "next/image";
import Link from "next/link";
import { Share2, Check, Sparkles } from "lucide-react";

type ProductGridProps = {
  onDetails?: (product: Product) => void;
  onOrder?: (product: Product) => void;
  searchQuery?: string;
  selectedCategory?: string;
};

// প্রোডাক্টের নাম থেকে SEO-ফ্রেন্ডলি ক্লিন স্লাগ তৈরি করার হেল্পার
function createProductSlug(name: string, fallbackId: string | number): string {
  const clean = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0980-\u09FF-]/g, "") // বাংলা, ইংরেজি, সংখ্যা ও হাইফেন রাখা
    .replace(/\s+/g, "-") // স্পেসকে হাইফেনে রূপান্তর
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return clean || String(fallbackId);
}

export default function ProductGrid({
  searchQuery = "",
  selectedCategory = "",
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const gridSectionRef = useRef<HTMLElement | null>(null);

  const handleSaveScrollPosition = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("home_scroll_pos", window.scrollY.toString());
    }
  };

  // প্রোডাক্টের ডিরেক্ট লিংক কপি করার ফিচার
  const handleCopyProductLink = (
    e: React.MouseEvent,
    productUrl: string,
    id: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const fullUrl = `${window.location.origin}${productUrl}`;
      navigator.clipboard?.writeText(fullUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();

        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      } catch (error) {
        console.error("প্রোডাক্ট লোড করতে সমস্যা হয়েছে:", error);
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };
    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // সার্চ করলে সরাসরি প্রোডাক্ট সেকশনে স্মুথ স্ক্রোল করে নিয়ে যাওয়া
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (searchQuery.trim() !== "") {
      startTransition(() => {
        setIsSearching(true);
      });

      if (gridSectionRef.current) {
        gridSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      timer = setTimeout(() => {
        startTransition(() => {
          setIsSearching(false);
        });
      }, 450);
    } else {
      startTransition(() => {
        setIsSearching(false);
      });
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchQuery]);

  // ফিল্টারিং লজিক
  const filteredProducts = products.filter((product) => {
    const pAny = product as Record<string, unknown>;
    const prodName = String(
      pAny["Product Name"] || pAny.productName || pAny.name || "",
    );
    const prodDesc = String(pAny["Description"] || pAny.description || "");
    const prodCat = String(pAny["Category"] || pAny.category || "");

    const matchesSearch =
      prodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prodDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prodCat.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory
      ? prodCat.toLowerCase().includes(selectedCategory.toLowerCase())
      : true;

    return matchesSearch && matchesCategory;
  });

  if (initialLoading || isSearching) {
    return <Loader />;
  }

  // প্রোডাক্ট কার্ড রেন্ডার ফাংশন (মেইন গ্রিড এবং সরি প্লেকার্ডের নিচের গ্রিড উভয় জায়গায় ব্যবহারের জন্য)
  const renderProductCard = (product: Product, index: number) => {
    const pAny = product as Record<string, unknown>;
    const prodId = String(pAny.id || pAny.product_id || index + 1);
    const prodName = String(
      pAny["Product Name"] || pAny.productName || pAny.name || "Product",
    );

    // প্রোডাক্টের নাম অনুযায়ী ক্লিন URL স্লাগ তৈরি
    const nameSlug = pAny.slug
      ? String(pAny.slug)
      : createProductSlug(prodName, prodId);
    const productUrl = `/product/${encodeURIComponent(nameSlug)}`;

    const regularPrice = Number(
      pAny["Regular Price"] || pAny.regularPrice || 999,
    );
    const offerPrice = Number(
      pAny["Offer Price"] || pAny.offerPrice || pAny.basePrice || 799,
    );
    const discountPercent =
      regularPrice > offerPrice
        ? Math.round(((regularPrice - offerPrice) / regularPrice) * 100)
        : 0;

    const prodCategory = String(
      pAny["Category"] || pAny.category || "Couple Item",
    );

    let prodImage = "/parl.jpg";
    const colImg = pAny["Image URL1"] || pAny.image_url_1 || pAny.imageUrl1;

    if (
      Array.isArray(pAny.images) &&
      pAny.images.length > 0 &&
      pAny.images[0]
    ) {
      prodImage = pAny.images[0] as string;
    } else if (colImg && typeof colImg === "string" && colImg.trim() !== "") {
      prodImage = /^https?:\/\//i.test(colImg)
        ? colImg
        : "/" + colImg.replace(/^\/+/, "");
    }

    return (
      <div
        key={`${prodId}-${index}`}
        className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden flex flex-col group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative"
      >
        <Link
          href={productUrl}
          onClick={handleSaveScrollPosition}
          className="aspect-square bg-gray-100 relative overflow-hidden cursor-pointer block"
        >
          {discountPercent > 0 && (
            <span className="absolute top-2.5 left-2.5 z-10 bg-gradient-to-r from-rose-600 to-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-lg tracking-wider animate-pulse">
              🔥 {discountPercent}% OFF
            </span>
          )}

          {/* কুইক লিংক শেয়ার/কপি বাটন */}
          <button
            type="button"
            onClick={(e) => handleCopyProductLink(e, productUrl, prodId)}
            title="প্রোডাক্টের লিংক কপি করুন"
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-[#D4AF37] text-white hover:text-black backdrop-blur-md flex items-center justify-center shadow-md transition-all cursor-pointer"
          >
            {copiedId === prodId ? (
              <Check size={14} className="text-emerald-400" />
            ) : (
              <Share2 size={13} />
            )}
          </button>

          <Image
            src={prodImage}
            alt={prodName}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </Link>

        <div className="p-3.5 flex flex-col flex-1 justify-between">
          <div>
            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
              {prodCategory}
            </span>

            <Link
              href={productUrl}
              onClick={handleSaveScrollPosition}
              className="block"
            >
              <h3 className="text-xs sm:text-sm font-bold text-gray-800 mt-1.5 line-clamp-2 cursor-pointer hover:text-rose-600 transition">
                {prodName}
              </h3>
            </Link>
          </div>

          <div className="mt-3">
            <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/60 p-2 rounded-xl mb-3 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider block">
                  বিশেষ মূল্য
                </span>
                <span className="text-lg sm:text-xl font-black text-rose-600 tracking-tight leading-none">
                  ৳{offerPrice}
                </span>
              </div>
              {regularPrice > offerPrice && (
                <div className="text-right">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                    নিয়মিত মূল্য
                  </span>
                  <span className="text-xs font-bold text-gray-400 line-through">
                    ৳{regularPrice}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <Link
                href={productUrl}
                onClick={handleSaveScrollPosition}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold py-2 rounded-xl transition cursor-pointer text-center flex items-center justify-center"
              >
                বিস্তারিত
              </Link>
              <Link
                href={productUrl}
                onClick={handleSaveScrollPosition}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 rounded-xl transition cursor-pointer shadow-sm text-center flex items-center justify-center"
              >
                অর্ডার
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      ref={gridSectionRef}
      className="px-4 py-6 max-w-7xl mx-auto font-sans scroll-mt-20"
    >
      {filteredProducts.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-black text-white">
              {selectedCategory
                ? `${selectedCategory} কালেকশন`
                : searchQuery
                  ? `"${searchQuery}" এর সার্চ ফলাফল`
                  : "আমাদের এক্সক্লুসিভ কালেকশন"}
            </h2>
            <span className="text-xs text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1 rounded-full font-bold">
              মোট ({filteredProducts.length}) টি পণ্য
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product, index) =>
              renderProductCard(product, index),
            )}
          </div>
        </>
      ) : (
        /* =================================================================
           সার্চ রেজাল্টে পণ্য না পেলে 3D প্রফেশনাল Sorry প্লেকার্ড + নিচে সব কালেকশন
           ================================================================= */
        <div className="space-y-10 py-6">
          {/* 3D গ্লাসমরফিক Sorry প্লেকার্ড */}
          <div className="flex flex-col items-center justify-center text-center px-4">
            <div className="relative w-full max-w-md rounded-3xl overflow-hidden bg-gradient-to-br from-[#16161d] via-[#1f1a18] to-[#0f0f13] border-2 border-[#D4AF37]/50 shadow-[0_25px_60px_rgba(212,175,55,0.2)] transform hover:scale-[1.01] transition-all duration-500 p-6 sm:p-8">
              {/* ব্যাকগ্রাউন্ড ভিডিও */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-screen pointer-events-none"
              >
                <source src="/couple-sorry.mp4" type="video/mp4" />
              </video>

              {/* 3D গ্লো ওভারলে */}
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-amber-500 flex items-center justify-center text-3xl shadow-[0_10px_25px_rgba(212,175,55,0.4)] animate-bounce">
                  👩‍❤️‍👨
                </div>

                <span className="bg-gradient-to-r from-rose-600 via-red-500 to-orange-500 text-white text-xs font-black px-5 py-1.5 rounded-full shadow-lg tracking-widest uppercase">
                  Sorry 😞
                </span>

                <h3 className="text-base sm:text-lg font-black text-white tracking-wide pt-1">
                  &ldquo;{searchQuery}&rdquo; নামে কোনো পণ্য পাওয়া যায়নি
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed max-w-xs">
                  দুঃখিত! আপনার কাঙ্ক্ষিত পণ্যটি এই মুহূর্তে স্টোরে নেই, তবে
                  আপনার প্রিয়জনের জন্য আমাদের সেরা কালেকশনগুলো নিচে সাজানো আছে।
                </p>
              </div>
            </div>
          </div>

          {/* কাস্টমারের জন্য প্রফেশনাল আহ্বান ও নিচে ওয়েবসাইটের সমস্ত প্রোডাক্ট */}
          <div className="border-t border-gray-800/80 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
                  <Sparkles size={13} /> Duo Corner Exclusive
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  আমাদের ইউনিক কালেকশনগুলো নিচে দেখুন ✨
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-semibold">
                মোট ({products.length}) টি এক্সক্লুসিভ পণ্য
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product, index) =>
                renderProductCard(product, index),
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
