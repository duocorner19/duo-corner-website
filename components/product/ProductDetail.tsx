/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/lib/data";
import { divisionData } from "@/lib/data";
import { trackEvent } from "@/lib/tracker";

import ProductGallery from "./ProductGallery";
import ProductSpecs from "./ProductSpecs";
import CheckoutForm from "./CheckoutForm";
import ThankYouModal from "./ThankYouModal";

type ProductDetailProps = {
  product: Product;
  onBack: () => void;
};

// পাবলিক ফোল্ডার বা এক্সটার্নাল URL অটো-ফরম্যাটিং হেল্পার
function resolveMediaPath(rawPath: unknown, fallback: string): string {
  if (!rawPath || typeof rawPath !== "string") return fallback;
  const clean = rawPath.trim();
  if (!clean) return fallback;
  if (/^https?:\/\//i.test(clean)) return clean;
  // উইন্ডোজ ব্যাকস্ল্যাশ থাকলে ফরওয়ার্ড স্ল্যাশে রূপান্তর ও শুরুতে '/' নিশ্চিত করা
  const normalized = clean.replace(/\\/g, "/").replace(/^public\//i, "");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export default function ProductDetail({ product, onBack }: ProductDetailProps) {
  const p = product as any;

  const productName = p["Product Name"] || p.name || p.productName || "Product";

  const regularPrice = Number(
    p["Regular Price"] || p.regularPrice || p.RegularPrice || 999,
  );

  const offerPrice = Number(
    p["Offer Price"] || p.basePrice || p.price || p.OfferPrice || 799,
  );

  const discountPercent =
    regularPrice > offerPrice
      ? Math.round(((regularPrice - offerPrice) / regularPrice) * 100)
      : 0;

  const productCategory = p["Category"] || p.category || "Couple Item";

  const productDescription =
    p["Description"] ||
    p.description ||
    "এক্সক্লুসিভ কাপল প্রোডাক্ট এবং আকর্ষণীয় গিফট বক্স।";

  // =========================================================================
  // ৮টি স্পেসিফিকেশন বক্স তৈরি (প্রথম ২টি মেইন + সুপাবেজের বাকি ৬টি কলাম)
  // =========================================================================
  const buildSpecifications = () => {
    const specs: { label: string; value: string }[] = [
      { label: "Category", value: String(productCategory) },
      {
        label: "Stock",
        value:
          p["Stock"] !== undefined && p["Stock"] !== null
            ? Number(p["Stock"]) > 0
              ? `In Stock (${p["Stock"]})`
              : "Available"
            : String(p.stock || "Available"),
      },
    ];

    // সুপাবেজ টেবিলের ৬ জোড়া ডায়নামিক স্পেসিফিকেশন কলাম
    const dynamicPairs = [
      {
        label: p["product type"] || "Product Type",
        value: p["Value 1"],
      },
      {
        label: p["usable gender"] || "Usable Gender",
        value: p["Value 2"],
      },
      {
        label: p["Material"] || "Material",
        value: p["Value 3"],
      },
      {
        label: p["Color"] || "Color",
        value: p["Value 4"],
      },
      {
        label: p["Single package size"] || "Package Size",
        value: p["Value 5"],
      },
      {
        label: p["Single gross weight"] || "Gross Weight",
        value: p["Value 6"],
      },
    ];

    dynamicPairs.forEach((pair) => {
      const cleanLabel = String(pair.label || "").trim();
      const cleanValue = String(pair.value || "").trim();
      if (cleanLabel && cleanValue) {
        specs.push({ label: cleanLabel, value: cleanValue });
      }
    });

    // যদি JSON আকারে অতিরিক্ত attributes থাকে তবে সেটিও সাপোর্ট করবে
    if (specs.length <= 2 && p.attributes) {
      let parsed = p.attributes;
      if (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          parsed = [];
        }
      }
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          if (item?.label && item?.value) {
            specs.push({
              label: String(item.label),
              value: String(item.value),
            });
          }
        });
      }
    }

    return specs;
  };

  const productAttributes = buildSpecifications();

  // =========================================================================
  // পাবলিক ফোল্ডার ও সুপাবেজ থেকে সব ছবি অটো-ডিটেক্ট করা
  // =========================================================================
  let imageList: string[] = [];

  const columnSources = [
    p["Image URL1"],
    p["Image URL2"],
    p["Image URL3"],
    p["Image URL4"],
    p.imageUrl1,
    p.imageUrl2,
    p.imageUrl3,
    p.imageUrl4,
    ...(Array.isArray(p.images) ? p.images : []),
  ];

  columnSources.forEach((img) => {
    if (img && typeof img === "string" && img.trim() !== "") {
      const formatted = resolveMediaPath(img, "");
      if (formatted && !imageList.includes(formatted)) {
        imageList.push(formatted);
      }
    }
  });

  if (imageList.length === 0) {
    imageList = ["/parl.jpg"];
  }

  // =========================================================================
  // পাবলিক ফোল্ডার থেকে ভিডিও অটো-ডিটেক্ট করা ("Video URL" কলাম)
  // =========================================================================
  const rawVideoSource =
    p["Video URL"] || p.videoUrl || p.video || "/video.mp4";
  const productVideo = resolveMediaPath(rawVideoSource, "/video.mp4");

  const [selectedImage, setSelectedImage] = useState(
    imageList[0] || "/parl.jpg",
  );

  // প্রোডাক্ট পরিবর্তন হলে প্রথম ছবি অটো সিলেক্ট নিশ্চিত করা
  useEffect(() => {
    if (imageList.length > 0 && !imageList.includes(selectedImage)) {
      setSelectedImage(imageList[0]);
    }
  }, [product]);

  const [quantity, setQuantity] = useState(1);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const districtEntries = Object.entries(divisionData).flatMap(
    ([division, districtMap]) =>
      Object.keys(districtMap).map((district) => ({
        division,
        district,
      })),
  );

  const districts = Array.from(
    new Set(districtEntries.map((item) => item.district)),
  );

  const initialDistrictEntry =
    districtEntries.find((item) => item.district === "ঢাকা") ||
    districtEntries[0];

  const [selectedDistrict, setSelectedDistrict] = useState(
    initialDistrictEntry?.district || "ঢাকা",
  );

  const [specialNote, setSpecialNote] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    trackEvent("ViewContent", {
      customData: {
        content_name: productName,
        content_category: productCategory,
        value: offerPrice,
        currency: "BDT",
      },
    });
  }, [productName, offerPrice, productCategory]);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDistrict(e.target.value);
  };

  // ডেলিভারি চার্জ: ঢাকা ৮০ টাকা, ঢাকার বাইরে ১৪০ টাকা
  const deliveryCharge = selectedDistrict === "ঢাকা" ? 80 : 140;
  const subtotal = offerPrice * quantity;
  const total = subtotal + deliveryCharge;

  const scrollToCheckout = () => {
    const formElement = document.getElementById("one-page-checkout");
    if (formElement) {
      formElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !selectedDistrict ||
      !address.trim()
    ) {
      alert("দয়া করে নাম, মোবাইল নম্বর, জেলা এবং সম্পূর্ণ ঠিকানা পূরণ করুন!");
      return;
    }

    const cleanPhone = phone.trim();
    const bdPhoneRegex = /^01[3-9]\d{8}$/;

    if (!bdPhoneRegex.test(cleanPhone)) {
      alert(
        "দয়া করে ১১ ডিজিটের সঠিক বাংলাদেশি মোবাইল নম্বর দিন। যেমন: 017XXXXXXXX",
      );
      return;
    }

    if (!agreed) {
      alert("দয়া করে নোটিশটি পড়ে সম্মতি দিয়ে অর্ডার কনফার্ম করুন।");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      let attributionData: Record<string, string> = {};

      if (typeof window !== "undefined") {
        try {
          attributionData = JSON.parse(
            sessionStorage.getItem("duo_attribution") || "{}",
          );
        } catch {
          attributionData = {};
        }
      }

      const res = await fetch("/api/save-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName.trim(),
          number: cleanPhone,
          district: selectedDistrict,
          address: address.trim(),
          note: `${productName} (Qty: ${quantity}), জেলা: ${selectedDistrict}, Note: ${specialNote}, Delivery: ${deliveryCharge} BDT`,
          collection_amount: total,
          utmSource: attributionData.utm_source || "Direct",
          utmCampaign: attributionData.utm_campaign || "",
        }),
      });

      const result = await res.json();

      if (!res.ok || (result?.status && result.status !== "success")) {
        throw new Error(result?.message || "অর্ডার সংরক্ষণ করা সম্ভব হয়নি।");
      }

      trackEvent("PlaceOrder", {
        userData: {
          phone: cleanPhone,
          firstName: fullName.trim(),
        },
        customData: {
          content_name: productName,
          value: total,
          currency: "BDT",
        },
      });

      setOrderSuccess(true);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch (err) {
      console.error("Order submission error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "সার্ভার সমস্যা! দয়া করে আবার চেষ্টা করুন।",
      );
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <ThankYouModal
        fullName={fullName}
        productName={productName}
        total={total}
        onBack={() => {
          window.location.href = "/";
        }}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 font-sans text-gray-900">
      <button
        type="button"
        onClick={() => {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          onBack();
        }}
        className="mb-4 inline-flex items-center gap-2 bg-[#181818] hover:bg-[#242424] text-[#D4AF37] font-semibold px-4 py-2 rounded-xl shadow-md border border-[#D4AF37]/30 text-xs transition cursor-pointer"
      >
        <span>←</span>
        হোমপেজে ফিরে যান
      </button>

      <ProductGallery
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        imageList={imageList}
        productName={productName}
        productCategory={productCategory}
        offerPrice={offerPrice}
        regularPrice={regularPrice}
        discountPercent={discountPercent}
        scrollToCheckout={scrollToCheckout}
      />

      <ProductSpecs
        productAttributes={productAttributes}
        productName={productName}
        productDescription={productDescription}
        productVideo={productVideo}
        extraHeading={p["PRODUCT SPECIFICATIONS"]}
      />

      <CheckoutForm
        fullName={fullName}
        setFullName={setFullName}
        phone={phone}
        setPhone={setPhone}
        address={address}
        setAddress={setAddress}
        selectedDistrict={selectedDistrict}
        handleDistrictChange={handleDistrictChange}
        districts={districts}
        specialNote={specialNote}
        setSpecialNote={setSpecialNote}
        agreed={agreed}
        setAgreed={setAgreed}
        loading={loading}
        handleOrderSubmit={handleOrderSubmit}
        productName={productName}
        offerPrice={offerPrice}
        regularPrice={regularPrice}
        quantity={quantity}
        setQuantity={setQuantity}
        selectedImage={selectedImage}
        subtotal={subtotal}
        deliveryCharge={deliveryCharge}
        total={total}
      />
    </div>
  );
}
