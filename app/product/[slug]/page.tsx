"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductDetail from "@/components/product/ProductDetail";
import { products as localProducts, type Product } from "@/lib/data";

export default function SingleProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const findProduct = async () => {
      if (!slug) return;

      const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();

      // ১. প্রথমে লোকাল ডেটায় খোঁজা
      const checkMatch = (p: any, index?: number) => {
        const pId = String(p.id || (index !== undefined ? index + 1 : ""));
        const pSlug = p.slug ? String(p.slug).toLowerCase().trim() : "";
        const pName = String(p.name || p.productName || p["Product Name"] || "")
          .toLowerCase()
          .replace(/\s+/g, "-");

        return (
          pId === decodedSlug ||
          pSlug === decodedSlug ||
          pName === decodedSlug ||
          decodeURIComponent(pName) === decodedSlug
        );
      };

      const localFound = localProducts.find((p, idx) => checkMatch(p, idx));
      if (localFound && isMounted) {
        setProduct(localFound);
        return;
      }

      // ২. লোকাল ফাইলে না পেলে সরাসরি API (/api/products) থেকে ফেচ করা
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const apiData = await res.json();

        if (Array.isArray(apiData) && apiData.length > 0) {
          const apiFound = apiData.find((p: any, idx: number) =>
            checkMatch(p, idx),
          );
          if (apiFound && isMounted) {
            setProduct(apiFound);
            return;
          }
        }
      } catch (err) {
        console.error("প্রোডাক্ট ফেচিং এরর:", err);
      }

      if (isMounted) {
        setNotFound(true);
      }
    };

    findProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 space-y-4 font-sans">
        <p className="text-base font-bold text-rose-500">
          দুঃখিত! পণ্যটি খুঁজে পাওয়া যায়নি।
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-[#f8931f] hover:bg-[#e08219] text-white text-xs font-bold px-4 py-2 rounded-xl transition"
        >
          হোমপেজে ফিরে যান
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-300">
            প্রোডাক্ট লোড হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white py-6">
      <ProductDetail product={product} onBack={() => router.push("/")} />
    </main>
  );
}
