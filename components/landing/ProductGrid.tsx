"use client";

import { useState, useEffect, useTransition } from "react";
import type { Product } from "@/lib/data";
import { products as localProducts } from "@/lib/data";
import Loader from "@/components/Loader";
import Image from "next/image";
import Link from "next/link";

type ProductGridProps = {
  onDetails?: (product: Product) => void;
  onOrder?: (product: Product) => void;
  searchQuery?: string;
  selectedCategory?: string;
};

export default function ProductGrid({
  onDetails,
  onOrder,
  searchQuery = "",
  selectedCategory = "",
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [, startTransition] = useTransition();

  const handleSaveScrollPosition = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("home_scroll_pos", window.scrollY.toString());
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
        console.error("প্রোডাক্ট লোড করতে সমস্যা হয়েছে", error);
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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (searchQuery.trim() !== "") {
      startTransition(() => {
        setIsSearching(true);
      });
      timer = setTimeout(() => {
        startTransition(() => {
          setIsSearching(false);
        });
      }, 700);
    } else {
      startTransition(() => {
        setIsSearching(false);
      });
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchQuery]);

  const filteredProducts = products.filter((product) => {
    const pAny = product as Record<string, unknown>;
    const prodName = String(
      product.name || pAny.productName || pAny["Product Name"] || "",
    );
    const prodDesc = String(product.description || pAny.Description || "");
    const prodCat = String(pAny.category || pAny["Category"] || "");

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

  return (
    <section className="px-4 py-6 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-black text-gray-800">
          {selectedCategory
            ? `${selectedCategory} কালেকশন`
            : "আমাদের এক্সক্লুসিভ কালেকশন"}
        </h2>
        <span className="text-xs text-gray-500 font-semibold">
          মোট ({filteredProducts.length}) টি পণ্য
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product, index) => {
          const pAny = product as Record<string, unknown>;
          const prodId = product.id || index + 1;
          const prodName = String(
            product.name ||
              pAny.productName ||
              pAny["Product Name"] ||
              "Product",
          );

          const rawSlug = String(
            pAny.slug ||
              product.slug ||
              prodId ||
              prodName.toLowerCase().replace(/\s+/g, "-"),
          );
          const productUrl = `/product/${encodeURIComponent(rawSlug)}`;

          const regularPrice = Number(
            pAny.regularPrice || pAny["Regular Price"] || 999,
          );
          const offerPrice = Number(
            pAny.offerPrice ||
              pAny["Offer Price"] ||
              product.basePrice ||
              pAny.price ||
              799,
          );
          const discountPercent =
            regularPrice > offerPrice
              ? Math.round(((regularPrice - offerPrice) / regularPrice) * 100)
              : 0;

          const prodCategory = String(
            pAny.category || pAny["Category"] || "Couple Item",
          );

          let prodImage = "/parl.jpg";
          const colImg = pAny["Image URL1"] || pAny.imageUrl1 || pAny.image;

          if (
            Array.isArray(product.images) &&
            product.images.length > 0 &&
            product.images[0]
          ) {
            prodImage = product.images[0];
          } else if (
            colImg &&
            typeof colImg === "string" &&
            colImg.trim() !== ""
          ) {
            prodImage = /^https?:\/\//i.test(colImg)
              ? colImg
              : "/" + colImg.replace(/^\/+/, "");
          }

          if (pAny["Image URL1"]) {
            const imgVal = String(pAny["Image URL1"]).trim();
            prodImage = imgVal.startsWith("/") ? imgVal : "/" + imgVal;
          }

          return (
            <div
              key={prodId}
              className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300"
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
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-6">
          <div className="relative w-full max-w-sm aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black border border-amber-500/40 shadow-2xl flex flex-col items-center justify-center p-6">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay pointer-events-none"
            >
              <source src="/couple-sorry.mp4" type="video/mp4" />
            </video>

            <div className="relative z-10 flex flex-col items-center space-y-3">
              <span className="text-3xl animate-bounce">👩‍❤️‍👨</span>
              <div className="bg-gradient-to-r from-rose-600 to-orange-500 text-white text-[11px] font-black px-4 py-1 rounded-full shadow-lg tracking-wider uppercase animate-pulse">
                Sorry 😞
              </div>
            </div>
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-base sm:text-lg font-black text-gray-800 tracking-wide">
              এমন ফলাফল পাওয়া যায়নি
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              আপনার সার্চ করা নাম বা কিওয়ার্ড দিয়ে আমাদের স্টোরে এই মুহূর্তে
              কোনো পণ্য পাওয়া যায়নি। অনুগ্রহ করে সঠিক বানানে বা অন্য কিছু
              দিয়ে আবার সার্চ করুন।
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
