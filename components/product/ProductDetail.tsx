/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
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

function resolveMediaPath(rawPath: unknown, fallback: string): string {
  if (!rawPath || typeof rawPath !== "string") return fallback;
  const trimmed = rawPath.trim();
  if (!trimmed) return fallback;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const normalized = trimmed.replace(/\\/g, "/").replace(/^public\//i, "");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export default function ProductDetail({ product, onBack }: ProductDetailProps) {
  const item = product as any;

  const productName =
    item["Product Name"] || item.name || item.productName || "Product";

  const regularPrice = Number(
    item["Regular Price"] || item.regularPrice || item.RegularPrice || 999,
  );

  const offerPrice = Number(
    item["Offer Price"] ||
      item.basePrice ||
      item.price ||
      item.OfferPrice ||
      799,
  );

  const discountPercent =
    regularPrice > offerPrice
      ? Math.round(((regularPrice - offerPrice) / regularPrice) * 100)
      : 0;

  const productCategory = item["Category"] || item.category || "Couple Item";

  const productDescription =
    item["Description"] ||
    item.description ||
    "এক্সক্লুসিভ কাপল প্রোডাক্ট এবং আকর্ষণীয় গিফট বক্স।";

  const buildSpecifications = () => {
    const list: { label: string; value: string }[] = [
      { label: "Category", value: String(productCategory) },
      {
        label: "Stock",
        value:
          item["Stock"] !== undefined && item["Stock"] !== null
            ? Number(item["Stock"]) > 0
              ? `In Stock (${item["Stock"]})`
              : "Available"
            : String(item.stock || "Available"),
      },
    ];

    const specFields = [
      { label: item["product type"] || "Product Type", value: item["Value 1"] },
      {
        label: item["usable gender"] || "Usable Gender",
        value: item["Value 2"],
      },
      { label: item["Material"] || "Material", value: item["Value 3"] },
      { label: item["Color"] || "Color", value: item["Value 4"] },
      {
        label: item["Single package size"] || "Package Size",
        value: item["Value 5"],
      },
      {
        label: item["Single gross weight"] || "Gross Weight",
        value: item["Value 6"],
      },
    ];

    for (const field of specFields) {
      const label = String(field.label || "").trim();
      const value = String(field.value || "").trim();
      if (label && value) {
        list.push({ label, value });
      }
    }

    if (list.length <= 2 && item.attributes) {
      let extraSpecs = item.attributes;
      if (typeof extraSpecs === "string") {
        try {
          extraSpecs = JSON.parse(extraSpecs);
        } catch {
          extraSpecs = [];
        }
      }
      if (Array.isArray(extraSpecs)) {
        for (const entry of extraSpecs) {
          if (entry?.label && entry?.value) {
            list.push({
              label: String(entry.label),
              value: String(entry.value),
            });
          }
        }
      }
    }

    return list;
  };

  const productAttributes = buildSpecifications();

  const rawImages = [
    item["Image URL1"],
    item["Image URL2"],
    item["Image URL3"],
    item["Image URL4"],
    item.imageUrl1,
    item.imageUrl2,
    item.imageUrl3,
    item.imageUrl4,
    ...(Array.isArray(item.images) ? item.images : []),
  ];

  const collectedImages: string[] = [];
  for (const src of rawImages) {
    if (typeof src === "string" && src.trim()) {
      const resolved = resolveMediaPath(src, "");
      if (resolved && !collectedImages.includes(resolved)) {
        collectedImages.push(resolved);
      }
    }
  }

  const imageList =
    collectedImages.length > 0 ? collectedImages : ["/parl.jpg"];

  const [selectedImage, setSelectedImage] = useState(imageList[0]);

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
      Object.keys(districtMap).map((district) => ({ division, district })),
  );

  const districts = Array.from(
    new Set(districtEntries.map((entry) => entry.district)),
  );

  const defaultDistrict =
    districtEntries.find((entry) => entry.district === "ঢাকা")?.district ||
    districtEntries[0]?.district ||
    "ঢাকা";

  const [selectedDistrict, setSelectedDistrict] = useState(defaultDistrict);
  const [specialNote, setSpecialNote] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const initiatedRef = useRef(false);
  const mountedQtyRef = useRef(true);

  const deliveryCharge = selectedDistrict === "ঢাকা" ? 80 : 140;
  const subtotal = offerPrice * quantity;
  const total = subtotal + deliveryCharge;

  useEffect(() => {
    initiatedRef.current = false;
    mountedQtyRef.current = true;

    trackEvent("ViewContent", {
      customData: {
        content_name: productName,
        content_category: productCategory,
        value: offerPrice,
        currency: "BDT",
      },
    });
  }, [productName, offerPrice, productCategory]);

  useEffect(() => {
    if (mountedQtyRef.current) {
      mountedQtyRef.current = false;
      return;
    }

    trackEvent("AddToCart", {
      customData: {
        content_name: productName,
        content_category: productCategory,
        quantity,
        value: offerPrice * quantity,
        currency: "BDT",
      },
    });
  }, [quantity, productName, productCategory, offerPrice]);

  const beginCheckoutOnce = () => {
    if (initiatedRef.current) return;
    initiatedRef.current = true;

    trackEvent("InitiateCheckout", {
      customData: {
        content_name: productName,
        content_category: productCategory,
        num_items: quantity,
        value: total,
        currency: "BDT",
      },
    });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    beginCheckoutOnce();
    setSelectedDistrict(e.target.value);
  };

  const scrollToCheckout = () => {
    trackEvent("AddToCart", {
      customData: {
        content_name: productName,
        content_category: productCategory,
        quantity,
        value: subtotal,
        currency: "BDT",
      },
    });
    beginCheckoutOnce();

    const targetEl = document.getElementById("one-page-checkout");
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
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
    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
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
      let attribution: Record<string, string> = {};
      if (typeof window !== "undefined") {
        try {
          attribution = JSON.parse(
            sessionStorage.getItem("duo_attribution") || "{}",
          );
        } catch {
          attribution = {};
        }
      }

      const response = await fetch("/api/save-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          number: cleanPhone,
          district: selectedDistrict,
          address: address.trim(),
          note: `${productName} (Qty: ${quantity}), জেলা: ${selectedDistrict}, Note: ${specialNote}, Delivery: ${deliveryCharge} BDT`,
          collection_amount: total,
          utmSource: attribution.utm_source || "Direct",
          utmCampaign: attribution.utm_campaign || "",
        }),
      });

      const data = await response.json();

      if (!response.ok || (data?.status && data.status !== "success")) {
        throw new Error(data?.message || "অর্ডার সংরক্ষণ করা সম্ভব হয়নি।");
      }

      trackEvent("Purchase", {
        userData: {
          phone: cleanPhone,
          firstName: fullName.trim(),
        },
        customData: {
          content_name: productName,
          content_category: productCategory,
          value: total,
          currency: "BDT",
          order_id: data?.orderId,
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
    <div
      className="max-w-2xl mx-auto px-3.5 sm:px-4 py-4 font-sans text-gray-900"
      onFocusCapture={(e) => {
        const el = e.target as HTMLElement | null;
        if (
          el &&
          (el.tagName === "INPUT" ||
            el.tagName === "TEXTAREA" ||
            el.tagName === "SELECT")
        ) {
          beginCheckoutOnce();
        }
      }}
    >
      <button
        type="button"
        onClick={() => {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          onBack();
        }}
        className="mb-3 inline-flex items-center gap-1.5 bg-[#191b1f] hover:bg-[#23272d] text-[#d4a24c] font-semibold px-3 py-1.5 rounded-lg border border-[#2e333c] text-xs transition cursor-pointer"
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
        extraHeading={item["PRODUCT SPECIFICATIONS"]}
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
