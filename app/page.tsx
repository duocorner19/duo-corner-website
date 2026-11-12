"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import TrustStrip from "@/components/landing/TrustStrip";
import Footer from "@/components/landing/Footer";
import ProductGrid from "@/components/landing/ProductGrid";
import CustomerReviews from "@/components/reviews/CustomerReviews";
import { whatsappChatLink } from "@/lib/data";
import { ArrowUp, ShieldAlert } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([
    "ব্রেসলেট (Bracelet)",
    "নেকলেস (Necklace)",
    "স্মার্ট ওয়াচ (Smart Watch)",
    "গিফট বক্স (Gift Box)",
  ]);

  // ইউআই ও নেভিগেশন স্টেট
  const [showExitToast, setShowExitToast] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const exitWarnedRef = useRef(false);

  const handleBackToHome = () => {
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ১. Supabase API থেকে লাইভ ক্যাটাগরি ফেচ করা
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        const data = await res.json();
        if (
          data.success &&
          Array.isArray(data.categories) &&
          data.categories.length > 0
        ) {
          setCategories(data.categories);
        }
      } catch {
        console.warn("Categories fetch error, using default fallback.");
      }
    }
    loadCategories();
  }, []);

  // ২. হোমপেজ ভিজিট মার্ক করা এবং আগের স্ক্রোল পজিশনে ফিরিয়ে আনা
  useEffect(() => {
    if (typeof window === "undefined") return;

    // মার্ক করে রাখা যে ইউজার হোমপেজ হয়ে এসেছে
    sessionStorage.setItem("duo_visited_home", "true");

    const savedScroll = sessionStorage.getItem("home_scroll_pos");
    if (savedScroll) {
      const targetY = parseInt(savedScroll, 10);
      const timer = setTimeout(() => {
        window.scrollTo({
          top: targetY,
          behavior: "smooth",
        });
        sessionStorage.removeItem("home_scroll_pos");
      }, 120);
      return () => clearTimeout(timer);
    }
  }, []);

  // ৩. হোমপেজ এক্সিট গার্ড (একবার ব্যাক চাপলে আটকে রাখবে, ২য় বার চাপলে বের হবে)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // বর্তমান স্টেট গার্ড পুশ করা
    window.history.pushState({ homeExitGuard: true }, "", window.location.href);

    const handlePopState = () => {
      if (!exitWarnedRef.current) {
        exitWarnedRef.current = true;
        setShowExitToast(true);
        // ইউজারকে হোমপেজেই ধরে রাখতে পুনরায় স্টেট পুশ করা
        window.history.pushState(
          { homeExitGuard: true },
          "",
          window.location.href,
        );

        setTimeout(() => {
          exitWarnedRef.current = false;
          setShowExitToast(false);
        }, 2500);
      } else {
        // ২.৫ সেকেন্ডের মধ্যে দ্বিতীয়বার ব্যাক চাপলে বের হতে দেওয়া
        window.history.back();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // ৪. নিচে স্ক্রোল করলে Scroll-to-Top বাটন দেখানো
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 450);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative selection:bg-[#D4AF37] selection:text-black font-sans">
      {/* ১. স্মার্ট ও প্রিমিয়াম হেডার */}
      <Header
        onHome={handleBackToHome}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCategorySelect={(cat) => {
          setSearchQuery(cat);
        }}
      />

      {/* ২. মূল কন্টেন্ট ও প্রোডাক্ট সেকশন */}
      <div id="products-section">
        <div>
          {/* ৩:১ ওয়াইড সিনেম্যাটিক হিরো ব্যানার */}
          <Hero onHome={handleBackToHome} />

          {/* হিরো ব্যানারের ঠিক নিচে রিয়েল-টাইম রেটিং ও রিভিউ সেকশন */}
          <section className="w-full bg-[#101010]/95 border-b border-[#D4AF37]/15 my-2">
            <CustomerReviews />
          </section>

          {/* প্রোডাক্ট গ্রিড, সার্চ ও ফিল্টারিং সহ */}
          <ProductGrid searchQuery={searchQuery} />
        </div>
      </div>

      {/* ৩. ট্রাস্ট স্ট্রিপ */}
      <TrustStrip />

      {/* ৪. প্রিমিয়াম ব্ল্যাক অ্যান্ড গোল্ড ফুটার */}
      <Footer />

      {/* ডাবল-ব্যাক এক্সিট ওয়ার্নিং টোস্ট (প্রিমিয়াম গোল্ডেন পিল) */}
      {showExitToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-[#181818]/95 backdrop-blur-md border border-[#D4AF37]/60 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-center gap-2.5 text-xs font-bold">
            <ShieldAlert
              size={18}
              className="text-[#D4AF37] shrink-0 animate-pulse"
            />
            <span>ওয়েবসাইট থেকে বের হতে চাইলে আবার ব্যাক চাপুন</span>
          </div>
        </div>
      )}

      {/* ফ্লোটিং অ্যাকশন বাটনসমূহ (Scroll Top + WhatsApp) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
        {showScrollTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-10 h-10 bg-[#1a1a1a]/90 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black border border-[#D4AF37]/40 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 cursor-pointer"
            title="উপরে যান"
          >
            <ArrowUp size={18} />
          </button>
        )}

        <a
          href={whatsappChatLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 cursor-pointer"
          title="WhatsApp Chat"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </a>
      </div>
    </main>
  );
}
