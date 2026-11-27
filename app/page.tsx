"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import TrustStrip from "@/components/landing/TrustStrip";
import Footer from "@/components/landing/Footer";
import ProductGrid from "@/components/landing/ProductGrid";
import CustomerReviews from "@/components/reviews/CustomerReviews";
import CheckoutForm from "@/components/product/CheckoutForm";
import type { Product } from "@/lib/data";
import { whatsappChatLink } from "@/lib/data";
import { ArrowUp, MessageCircle, X, CheckCircle2 } from "lucide-react";

const DISTRICTS = [
  "ঢাকা",
  "হবিগঞ্জ",
  "বরিশাল",
  "চট্টগ্রাম",
  "সিলেট",
  "রাজশাহী",
  "খুলনা",
  "রংপুর",
  "ময়মনসিংহ",
  "কুমিল্লা",
  "গাজীপুর",
  "নারায়ণগঞ্জ",
];

function getProductInfo(product: Product) {
  const p = product as Record<string, unknown>;
  const name = String(
    p["Product Name"] || p.productName || p.name || "Exclusive Gift",
  );
  const regularPrice = Number(p["Regular Price"] || p.regularPrice || 999);
  const offerPrice = Number(
    p["Offer Price"] || p.offerPrice || p.basePrice || 799,
  );

  let image = "/parl.webp";
  const rawImg = p["Image URL1"] || p.image_url_1 || p.imageUrl1;
  if (Array.isArray(p.images) && p.images[0]) {
    image = String(p.images[0]);
  } else if (typeof rawImg === "string" && rawImg.trim()) {
    image = /^https?:\/\//i.test(rawImg)
      ? rawImg
      : `/${rawImg.replace(/^\/+/, "")}`;
  }

  return { name, regularPrice, offerPrice, image };
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // মূল পেজে সরাসরি চেকআউট ফর্মের স্টেট
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("ঢাকা");
  const [address, setAddress] = useState("");
  const [specialNote, setSpecialNote] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState("");
  const [orderErrorMessage, setOrderErrorMessage] = useState("");

  const checkoutWrapperRef = useRef<HTMLDivElement | null>(null);

  const handleBackToHome = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setCheckoutProduct(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDirectCheckout = (product: Product) => {
    setCheckoutProduct(product);
    setQuantity(1);
    setOrderSuccessMessage("");
    setOrderErrorMessage("");

    setTimeout(() => {
      const target =
        document.getElementById("one-page-checkout") ||
        checkoutWrapperRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("duo_visited_home", "true");
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 450);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const productInfo = checkoutProduct ? getProductInfo(checkoutProduct) : null;
  const subtotal = productInfo ? productInfo.offerPrice * quantity : 0;
  const deliveryCharge =
    selectedDistrict === "ঢাকা"
      ? 70
      : selectedDistrict === "হবিগঞ্জ"
        ? 100
        : 120;
  const total = subtotal + deliveryCharge;

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutProduct || !productInfo || !agreed) return;

    setSubmitting(true);
    setOrderErrorMessage("");
    setOrderSuccessMessage("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId:
            (checkoutProduct as Record<string, unknown>).id ||
            (checkoutProduct as Record<string, unknown>).product_id ||
            productInfo.name,
          productName: productInfo.name,
          unitPrice: productInfo.offerPrice,
          quantity,
          deliveryCharge,
          totalAmount: total,
          customerName: fullName.trim(),
          phone: phone.trim(),
          district: selectedDistrict,
          address: address.trim(),
          note: specialNote.trim(),
          paymentMethod: "COD",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok && data?.success === false) {
        throw new Error(data?.message || "অর্ডার সম্পন্ন করা যায়নি।");
      }

      const fbqFn = (
        window as unknown as { fbq?: (...args: unknown[]) => void }
      ).fbq;
      if (typeof fbqFn === "function") {
        fbqFn("track", "Purchase", {
          value: total,
          currency: "BDT",
          content_name: productInfo.name,
          num_items: quantity,
        });
      }

      setOrderSuccessMessage(
        `ধন্যবাদ ${fullName}! "${productInfo.name}" (${quantity} টি, মোট ৳${total}) এর ক্যাশ অন ডেলিভারি অর্ডারটি গ্রহণ করা হয়েছে।`,
      );
      setFullName("");
      setPhone("");
      setAddress("");
      setSpecialNote("");
      setQuantity(1);
    } catch (err) {
      setOrderErrorMessage(
        err instanceof Error
          ? err.message
          : "অর্ডার পাঠাতে সমস্যা হয়েছে, আবার চেষ্টা করুন।",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white relative selection:bg-[#D4AF37] selection:text-black font-sans">
      <Header
        onHome={handleBackToHome}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCategorySelect={(cat) => {
          setSelectedCategory(cat);
          setSearchQuery("");
        }}
      />

      <div id="products-section">
        <Hero onHome={handleBackToHome} />

        <section className="w-full bg-[#101010]/95 border-b border-[#D4AF37]/15 my-2">
          <CustomerReviews />
        </section>

        <ProductGrid
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onDirectCheckout={handleDirectCheckout}
        />
      </div>

      {/* মূল পেজেই সরাসরি চেকআউট ফর্ম সেকশন */}
      {checkoutProduct && productInfo && (
        <div
          ref={checkoutWrapperRef}
          className="max-w-3xl mx-auto px-4 py-6 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#E5BE67] uppercase tracking-wider">
              সরাসরি কুইক অর্ডার
            </span>
            <button
              type="button"
              onClick={() => setCheckoutProduct(null)}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={14} />
              <span>বন্ধ করুন</span>
            </button>
          </div>

          {orderSuccessMessage && (
            <div className="rounded-xl bg-emerald-950/60 border border-emerald-500/40 p-3.5 text-xs sm:text-sm text-emerald-200 flex items-start gap-2">
              <CheckCircle2
                size={18}
                className="text-emerald-400 shrink-0 mt-0.5"
              />
              <span>{orderSuccessMessage}</span>
            </div>
          )}

          {orderErrorMessage && (
            <div className="rounded-xl bg-rose-950/60 border border-rose-500/40 p-3.5 text-xs sm:text-sm text-rose-200">
              {orderErrorMessage}
            </div>
          )}

          <CheckoutForm
            fullName={fullName}
            setFullName={setFullName}
            phone={phone}
            setPhone={setPhone}
            address={address}
            setAddress={setAddress}
            selectedDistrict={selectedDistrict}
            handleDistrictChange={(e) => setSelectedDistrict(e.target.value)}
            districts={DISTRICTS}
            specialNote={specialNote}
            setSpecialNote={setSpecialNote}
            agreed={agreed}
            setAgreed={setAgreed}
            loading={submitting}
            handleOrderSubmit={handleOrderSubmit}
            productName={productInfo.name}
            offerPrice={productInfo.offerPrice}
            regularPrice={productInfo.regularPrice}
            quantity={quantity}
            setQuantity={setQuantity}
            selectedImage={productInfo.image}
            subtotal={subtotal}
            deliveryCharge={deliveryCharge}
            total={total}
          />
        </div>
      )}

      <TrustStrip />
      <Footer />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2.5">
        {showScrollTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="উপরে যান"
            className="w-10 h-10 bg-[#181818] hover:bg-[#D4AF37] text-[#E5BE67] hover:text-black border border-[#D4AF37]/40 rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer"
          >
            <ArrowUp size={17} />
          </button>
        )}

        <a
          href={whatsappChatLink || "https://wa.me/8801777156691"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp-এ যোগাযোগ করুন"
          className="w-12 h-12 bg-[#D4AF37] hover:bg-[#e2be69] text-black rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircle size={22} />
        </a>
      </div>
    </main>
  );
}
