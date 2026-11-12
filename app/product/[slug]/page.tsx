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

export default function SingleProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);

  // ১. কাস্টমার যদি সরাসরি সোশ্যাল মিডিয়া লিংক থেকে প্রোডাক্ট পেজে আসে,
  // তবে ব্যাক বাটন চাপলে সাইট থেকে বের না হয়ে প্রথমে হোমপেজে নিয়ে যাবে।
  useEffect(() => {
    if (typeof window === "undefined") return;

    const cameFromHome = sessionStorage.getItem("duo_visited_home") === "true";
    if (!cameFromHome) {
      window.history.pushState(
        { directLanding: true },
        "",
        window.location.href,
      );
      const handleDirectBack = () => {
        sessionStorage.setItem("duo_visited_home", "true");
        router.replace("/");
      };
      window.addEventListener("popstate", handleDirectBack);
      return () => window.removeEventListener("popstate", handleDirectBack);
    }
  }, [router]);

  // ২. "হোমপেজে ফিরে যান" বাটন বা ব্যাক নেভিগেশন হ্যান্ডলার
  const handleBackStep = () => {
    if (typeof window !== "undefined") {
      const cameFromHome =
        sessionStorage.getItem("duo_visited_home") === "true";
      if (cameFromHome && window.history.length > 1) {
        router.back();
      } else {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  };

  // ৩. Supabase API এবং লোকাল ডেটা থেকে প্রোডাক্ট নাম/স্লাগ অনুযায়ী লোড করা
  useEffect(() => {
    let isMounted = true;

    const findProduct = async () => {
      if (!slug) return;

      const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();
      const normalizedParam = normalizeSlug(decodedSlug);

      const checkMatch = (p: Record<string, unknown>, index?: number) => {
        const pId = String(
          p.id || p.product_id || (index !== undefined ? index + 1 : ""),
        );
        const pSlug = p.slug ? String(p.slug).toLowerCase().trim() : "";
        const rawName = String(
          p["Product Name"] || p.productName || p.name || "",
        );
        const generatedSlug = normalizeSlug(rawName);

        return (
          pId === decodedSlug ||
          pSlug === decodedSlug ||
          pSlug === normalizedParam ||
          generatedSlug === decodedSlug ||
          generatedSlug === normalizedParam ||
          rawName.toLowerCase().trim() === decodedSlug
        );
      };

      // প্রথমে Supabase লাইভ API থেকে খোঁজা
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const apiData = await res.json();

        if (Array.isArray(apiData) && apiData.length > 0) {
          const apiFound = apiData.find(
            (p: Record<string, unknown>, idx: number) => checkMatch(p, idx),
          );
          if (apiFound && isMounted) {
            setProduct(apiFound as unknown as Product);
            return;
          }
        }
      } catch (err) {
        console.error("Supabase প্রোডাক্ট লোড এরর:", err);
      }

      // API-তে না পেলে লোকাল ফলব্যাক ডেটা থেকে খোঁজা
      const localFound = localProducts.find((p, idx) =>
        checkMatch(p as unknown as Record<string, unknown>, idx),
      );
      if (localFound && isMounted) {
        setProduct(localFound);
        return;
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
          দুঃখিত! পণ্যটি খুঁজে পাওয়া যায়নি।
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black text-xs font-black px-5 py-2.5 rounded-xl transition cursor-pointer shadow-lg"
        >
          হোমপেজে ফিরে যান
        </button>
      </div>
    );
  }

  // প্রিমিয়াম শিমার স্কেলিটন লোডার
  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-4 font-sans">
        <div className="max-w-2xl mx-auto space-y-5 animate-pulse">
          <div className="h-9 w-36 bg-[#181818] rounded-xl border border-gray-800" />
          <div className="aspect-square w-full bg-[#141414] rounded-3xl border border-[#D4AF37]/20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-bold text-[#D4AF37]">
                প্রোডাক্ট প্রস্তুত হচ্ছে...
              </span>
            </div>
          </div>
          <div className="h-28 w-full bg-[#141414] rounded-2xl border border-gray-800" />
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
