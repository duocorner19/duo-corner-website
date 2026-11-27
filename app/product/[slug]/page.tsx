"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductDetail from "@/components/product/ProductDetail";
import { products as localProducts, type Product } from "@/lib/data";

function normalizeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0980-\u09FF-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function matchProduct(
  p: Record<string, unknown>,
  index: number,
  decodedSlug: string,
  normalizedParam: string,
): boolean {
  const pId = String(p.id || p.product_id || index + 1)
    .toLowerCase()
    .trim();
  const pSlug = p.slug ? normalizeSlug(String(p.slug)) : "";
  const rawName = String(p["Product Name"] || p.productName || p.name || "")
    .toLowerCase()
    .trim();
  const generatedSlug = normalizeSlug(rawName);

  return (
    pId === decodedSlug ||
    pSlug === decodedSlug ||
    pSlug === normalizedParam ||
    generatedSlug === decodedSlug ||
    generatedSlug === normalizedParam ||
    rawName === decodedSlug
  );
}

export default function SingleProductPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = typeof params?.slug === "string" ? params.slug : "";

  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleBackStep = () => {
    if (typeof window !== "undefined") {
      const cameFromHome =
        sessionStorage.getItem("duo_visited_home") === "true";
      if (cameFromHome && window.history.length > 1) {
        router.back();
        return;
      }
    }
    router.push("/");
  };

  useEffect(() => {
    if (!rawSlug) return;

    let active = true;
    setNotFound(false);

    const decodedSlug = decodeURIComponent(rawSlug).toLowerCase().trim();
    const normalizedParam = normalizeSlug(decodedSlug);

    // ১. আগে লোকাল ডেটা থেকে দ্রুত ম্যাচ খুঁজে দেখানো
    const localFound = localProducts.find((p, idx) =>
      matchProduct(
        p as unknown as Record<string, unknown>,
        idx,
        decodedSlug,
        normalizedParam,
      ),
    );
    if (localFound && active) {
      setProduct(localFound);
    }

    // ২. লাইভ API থেকে আপডেটেড প্রোডাক্ট ডেটা সিঙ্ক করা
    async function syncProduct() {
      try {
        const res = await fetch("/api/products", { next: { revalidate: 60 } });
        if (!res.ok) {
          if (!localFound && active) setNotFound(true);
          return;
        }

        const apiData = await res.json();
        if (Array.isArray(apiData) && apiData.length > 0) {
          const apiFound = apiData.find(
            (p: Record<string, unknown>, idx: number) =>
              matchProduct(p, idx, decodedSlug, normalizedParam),
          );

          if (apiFound && active) {
            setProduct(apiFound as unknown as Product);
            return;
          }
        }

        if (!localFound && active) {
          setNotFound(true);
        }
      } catch {
        if (!localFound && active) {
          setNotFound(true);
        }
      }
    }

    syncProduct();
    return () => {
      active = false;
    };
  }, [rawSlug]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 gap-4 font-sans">
        <p className="text-sm sm:text-base font-bold text-[#E5BE67]">
          দুঃখিত, এই পণ্যটি খুঁজে পাওয়া যায়নি।
        </p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="bg-[#D4AF37] hover:bg-[#e2be69] text-black text-xs font-extrabold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          হোমপেজে ফিরে যান
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4 font-sans">
        <div className="max-w-2xl mx-auto space-y-5 animate-pulse">
          <div className="h-9 w-36 bg-[#161619] rounded-xl border border-white/10" />
          <div className="aspect-square w-full bg-[#141417] rounded-3xl border border-[#D4AF37]/20 flex items-center justify-center">
            <span className="text-xs font-bold text-[#E5BE67]">
              পণ্য লোড হচ্ছে...
            </span>
          </div>
          <div className="h-28 w-full bg-[#141417] rounded-2xl border border-white/10" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white py-6">
      <ProductDetail product={product} onBack={handleBackStep} />
    </main>
  );
}
