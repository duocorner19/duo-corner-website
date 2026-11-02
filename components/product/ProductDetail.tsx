"use client";
import { useState, useEffect } from "react";
import type { Product } from "@/lib/data";
import { divisionData } from "@/lib/data";
import { trackEvent } from "@/lib/tracker"; // ট্র্যাকার ইমপোর্ট
import ProductGallery from "./ProductGallery";
import ProductSpecs from "./ProductSpecs";
import CheckoutForm from "./CheckoutForm";
import ThankYouModal from "./ThankYouModal";

type ProductDetailProps = {
  product: Product;
  onBack: () => void;
};

export default function ProductDetail({ product, onBack }: ProductDetailProps) {
  const p = product as any;

  const productName = p.name || p.productName || p["Product Name"] || "Product";
  const regularPrice = Number(
    p.regularPrice || p["Regular Price"] || p.RegularPrice || 999,
  );
  const offerPrice = Number(
    p.basePrice || p.price || p["Offer Price"] || p.OfferPrice || 799,
  );
  const discountPercent =
    regularPrice > offerPrice
      ? Math.round(((regularPrice - offerPrice) / regularPrice) * 100)
      : 0;
  const productCategory = p.category || p["Category"] || "Couple Item";
  const productDescription =
    p.description ||
    p["Description"] ||
    "এক্সক্লুসিভ কাপল প্রোডাক্ট এবং আকর্ষণীয় গিফট বক্স।";

  let productAttributes = p.attributes || [];
  if (typeof productAttributes === "string") {
    try {
      productAttributes = JSON.parse(productAttributes);
    } catch {
      productAttributes = [];
    }
  }

  if (!Array.isArray(productAttributes) || productAttributes.length === 0) {
    productAttributes = [
      { label: "Category", value: productCategory },
      { label: "Stock", value: String(p.stock || p["Stock"] || "Available") },
    ];
  }

  let imageList: string[] = [];
  if (Array.isArray(p.images) && p.images.length > 0) {
    imageList = p.images;
  } else {
    const columnSources = [
      p["Image URL1"] || p.imageUrl1,
      p["Image URL2"] || p.imageUrl2,
      p["Image URL3"] || p.imageUrl3,
      p["Image URL4"] || p.imageUrl4,
    ];

    columnSources.forEach((img) => {
      if (img && typeof img === "string" && img.trim() !== "") {
        let clean = img.trim();
        let formatted = /^https?:\/\//i.test(clean)
          ? clean
          : "/" + clean.replace(/^\/+/, "");
        if (!imageList.includes(formatted)) {
          imageList.push(formatted);
        }
      }
    });
  }

  if (imageList.length === 0) {
    imageList = ["/parl.jpg"];
  }

  let productVideo = p.videoUrl || p["Video URL"] || p.video || "/video.mp4";
  if (
    productVideo &&
    !productVideo.startsWith("http") &&
    !productVideo.startsWith("/")
  ) {
    productVideo = "/" + productVideo;
  }

  const [selectedImage, setSelectedImage] = useState(
    imageList[0] || "/parl.jpg",
  );
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const divisions = Object.keys(divisionData);
  const [selectedDivision, setSelectedDivision] = useState(
    divisions[0] || "ঢাকা",
  );

  const districts = Object.keys(divisionData[selectedDivision] || {});
  const [selectedDistrict, setSelectedDistrict] = useState(districts[0] || "");

  const thanas = divisionData[selectedDivision]?.[selectedDistrict] || [];
  const [selectedThana, setSelectedThana] = useState(thanas[0] || "");

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [coupon, setCoupon] = useState("");
  const [specialNote, setSpecialNote] = useState("");
  const [agreed, setAgreed] = useState(true);

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // ১. প্রোডাক্ট পেজ লোড হলে ViewContent ট্র্যাক হবে
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

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const div = e.target.value;
    setSelectedDivision(div);
    const newDistricts = Object.keys(divisionData[div] || {});
    const firstDist = newDistricts[0] || "";
    setSelectedDistrict(firstDist);
    const newThanas = divisionData[div]?.[firstDist] || [];
    setSelectedThana(newThanas[0] || "");
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dist = e.target.value;
    setSelectedDistrict(dist);
    const newThanas = divisionData[selectedDivision]?.[dist] || [];
    setSelectedThana(newThanas[0] || "");
  };

  const deliveryCharge = selectedDivision === "ঢাকা" ? 70 : 130;
  const subtotal = offerPrice * quantity;
  const total = subtotal + deliveryCharge;

  const scrollToCheckout = () => {
    const formElement = document.getElementById("one-page-checkout");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      alert("দয়া করে নাম, ফোন নম্বর এবং ঠিকানা পূরণ করুন!");
      return;
    }

    const cleanPhone = phone.trim();
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(cleanPhone)) {
      alert(
        "দয়া করে ১১ ডিজিটের সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)!",
      );
      return;
    }

    if (!agreed) {
      alert("দয়া করে শর্তাবলীতে সম্মতি দিন!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/save-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          phone: cleanPhone,
          division: selectedDivision,
          district: selectedDistrict,
          thana: selectedThana,
          address: address,
          note: `${productName} (Qty: ${quantity}), Note: ${specialNote}, Payment: ${paymentMethod}, Delivery: ${deliveryCharge} BDT`,
          amount: total,
        }),
      });

      // ২. অর্ডার সাবমিট হলে 'PlaceOrder' বা 'Lead' ইভেন্ট মেটায় যাবে (Purchase ফায়ার হবে না)
      trackEvent("PlaceOrder", {
        userData: {
          phone: cleanPhone,
          firstName: fullName,
        },
        customData: {
          content_name: productName,
          value: total,
          currency: "BDT",
        },
      });

      setOrderSuccess(true);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch {
      setOrderSuccess(true);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
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
        onBack={onBack}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 font-sans text-gray-900">
      <button
        onClick={() => {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          onBack();
        }}
        className="mb-4 inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-xl shadow-sm border border-gray-200 text-xs transition cursor-pointer"
      >
        <span>←</span> হোমপেজে ফিরে যান
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
      />

      <CheckoutForm
        fullName={fullName}
        setFullName={setFullName}
        phone={phone}
        setPhone={setPhone}
        address={address}
        setAddress={setAddress}
        selectedDivision={selectedDivision}
        handleDivisionChange={handleDivisionChange}
        divisions={divisions}
        selectedDistrict={selectedDistrict}
        handleDistrictChange={handleDistrictChange}
        districts={districts}
        selectedThana={selectedThana}
        setSelectedThana={setSelectedThana}
        thanas={thanas}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        coupon={coupon}
        setCoupon={setCoupon}
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
