/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { Product } from "@/lib/data";
import { products as localProducts } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { Share2, Check, Sparkles, ShoppingBag } from "lucide-react";

type ProductGridProps = {
  searchQuery?: string;
  selectedCategory?: string;
  onDirectCheckout?: (product: Product) => void;
};

function createProductSlug(name: string, fallbackId: string | number): string {
  const clean = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0980-\u09FF-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return clean || String(fallbackId);
}

function trackInitiateCheckoutPixel(product: Product, price: number) {
  if (typeof window === "undefined") return;
  const p = product as Record<string, unknown>;
  const contentId = String(p.id || p.product_id || p.slug || p.name || "item");
  const contentName = String(
    p["Product Name"] || p.productName || p.name || "Duo Corner Product",
  );

  const fbqFn = (window as unknown as { fbq?: (...args: unknown[]) => void })
    .fbq;
  if (typeof fbqFn === "function") {
    fbqFn("track", "InitiateCheckout", {
      content_ids: [contentId],
      content_name: contentName,
      content_type: "product",
      value: price,
      currency: "BDT",
      num_items: 1,
    });
  }
}

export default function ProductGrid({
  searchQuery = "",
  selectedCategory = "",
  onDirectCheckout,
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const gridSectionRef = useRef<HTMLElement | null>(null);
  const prevSearchRef = useRef("");

  const saveScrollPosition = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("home_scroll_pos", String(window.scrollY));
    }
  };

  const handleCopyLink = (
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
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const res = await fetch("/api/products", { next: { revalidate: 60 } });
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.warn("লাইভ প্রোডাক্ট লোড হয়নি, লোকাল ডেটা ব্যবহৃত হচ্ছে।", err);
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (
      trimmed &&
      trimmed !== prevSearchRef.current &&
      gridSectionRef.current
    ) {
      gridSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    prevSearchRef.current = trimmed;
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const cat = selectedCategory.trim().toLowerCase();

    return products.filter((product) => {
      const p = product as Record<string, unknown>;
      const name = String(p["Product Name"] || p.productName || p.name || "");
      const desc = String(p["Description"] || p.description || "");
      const category = String(p["Category"] || p.category || "");

      const matchQuery =
        !q ||
        name.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        category.toLowerCase().includes(q);

      const matchCategory = !cat || category.toLowerCase().includes(cat);
      return matchQuery && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const renderCard = (product: Product, index: number) => {
    const p = product as Record<string, unknown>;
    const id = String(p.id || p.product_id || index + 1);
    const name = String(
      p["Product Name"] || p.productName || p.name || "Exclusive Gift",
    );
    const slug = p.slug ? String(p.slug) : createProductSlug(name, id);
    const productUrl = `/product/${encodeURIComponent(slug)}`;

    const regularPrice = Number(p["Regular Price"] || p.regularPrice || 999);
    const offerPrice = Number(
      p["Offer Price"] || p.offerPrice || p.basePrice || 799,
    );
    const discount =
      regularPrice > offerPrice
        ? Math.round(((regularPrice - offerPrice) / regularPrice) * 100)
        : 0;

    const category = String(p["Category"] || p.category || "Couple Item");

    let imgSrc = "/parl.webp";
    const rawImg = p["Image URL1"] || p.image_url_1 || p.imageUrl1;
    if (Array.isArray(p.images) && p.images[0]) {
      imgSrc = String(p.images[0]);
    } else if (typeof rawImg === "string" && rawImg.trim()) {
      imgSrc = /^https?:\/\//i.test(rawImg)
        ? rawImg
        : `/${rawImg.replace(/^\/+/, "")}`;
    }

    const handleOrderClick = () => {
      trackInitiateCheckoutPixel(product, offerPrice);
      if (onDirectCheckout) {
        onDirectCheckout(product);
      }
    };

    return (
      <article
        key={`${id}-${index}`}
        className="bg-[#141416] rounded-2xl border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 overflow-hidden flex flex-col justify-between transition-colors duration-200"
      >
        <div>
          <div className="relative aspect-square bg-[#1c1c20] overflow-hidden">
            {discount > 0 && (
              <span className="absolute top-2.5 left-2.5 z-10 bg-[#D4AF37] text-black text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-md">
                {discount}% ছাড়
              </span>
            )}

            <button
              type="button"
              onClick={(e) => handleCopyLink(e, productUrl, id)}
              aria-label={`${name} এর লিংক কপি করুন`}
              className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-black/70 hover:bg-[#D4AF37] text-gray-200 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
            >
              {copiedId === id ? <Check size={14} /> : <Share2 size={13} />}
            </button>

            <Link
              href={productUrl}
              onClick={saveScrollPosition}
              className="block w-full h-full"
            >
              <Image
                src={imgSrc}
                alt={name}
                fill
                priority={index < 2}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          <div className="p-3.5">
            <span className="inline-block text-[10px] font-bold text-[#E5BE67] bg-[#D4AF37]/10 border border-[#D4AF37]/25 px-2 py-0.5 rounded">
              {category}
            </span>

            <Link
              href={productUrl}
              onClick={saveScrollPosition}
              className="block mt-1.5"
            >
              <h3 className="text-xs sm:text-sm font-bold text-gray-100 hover:text-[#E5BE67] line-clamp-2 leading-snug transition-colors">
                {name}
              </h3>
            </Link>
          </div>
        </div>

        <div className="px-3.5 pb-3.5 pt-1">
          <div className="flex items-baseline justify-between gap-2 bg-[#1b1b1f] border border-white/5 rounded-xl px-3 py-2 mb-3">
            <div>
              <span className="text-[10px] text-gray-400 block">
                অফার মূল্য
              </span>
              <span className="text-base sm:text-lg font-black text-[#E5BE67]">
                ৳{offerPrice}
              </span>
            </div>
            {regularPrice > offerPrice && (
              <span className="text-xs text-gray-500 line-through">
                ৳{regularPrice}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={productUrl}
              onClick={saveScrollPosition}
              className="py-2 px-2 rounded-xl border border-white/15 hover:border-[#D4AF37]/50 text-gray-200 text-xs font-semibold text-center transition-colors"
            >
              বিস্তারিত
            </Link>

            <button
              type="button"
              onClick={handleOrderClick}
              className="py-2 px-2 rounded-xl bg-[#D4AF37] hover:bg-[#e2be69] text-black text-xs font-extrabold text-center inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <ShoppingBag size={13} />
              <span>অর্ডার করুন</span>
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section
      ref={gridSectionRef}
      className="px-4 py-6 max-w-7xl mx-auto font-sans scroll-mt-20"
    >
      {filteredProducts.length > 0 ? (
        <>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-base sm:text-xl font-extrabold text-white">
              {selectedCategory
                ? `${selectedCategory} কালেকশন`
                : searchQuery.trim()
                  ? `"${searchQuery.trim()}" এর ফলাফল`
                  : "আমাদের কালেকশন"}
            </h2>
            <span className="text-xs font-bold text-[#E5BE67] bg-[#D4AF37]/10 border border-[#D4AF37]/25 px-3 py-1 rounded-full shrink-0">
              {filteredProducts.length} টি পণ্য
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {filteredProducts.map((product, idx) => renderCard(product, idx))}
          </div>
        </>
      ) : (
        <div className="space-y-8 py-4">
          <div className="max-w-md mx-auto text-center rounded-2xl bg-[#141416] border border-[#D4AF37]/30 p-6">
            <span className="inline-block text-xs font-bold text-[#E5BE67] bg-[#D4AF37]/10 px-3 py-1 rounded-full mb-2">
              পণ্য পাওয়া যায়নি
            </span>
            <h3 className="text-base font-bold text-white">
              &ldquo;{searchQuery}&rdquo; নামে কোনো পণ্য নেই
            </h3>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              ভিন্ন কোনো শব্দ দিয়ে খুঁজে দেখুন অথবা নিচে আমাদের বাকি কালেকশনগুলো
              দেখুন।
            </p>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E5BE67] mb-3">
              <Sparkles size={14} />
              <span>অন্যান্য পণ্যসমূহ</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {products
                .slice(0, 8)
                .map((product, idx) => renderCard(product, idx))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
