"use client";

type ProductGalleryProps = {
  selectedImage: string;
  setSelectedImage: (img: string) => void;
  imageList: string[];
  productName: string;
  productCategory: string;
  offerPrice: number;
  regularPrice: number;
  discountPercent: number;
  scrollToCheckout: () => void;
};

const THUMB_BASE =
  "w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer";

export default function ProductGallery({
  selectedImage,
  setSelectedImage,
  imageList,
  productName,
  productCategory,
  offerPrice,
  regularPrice,
  discountPercent,
  scrollToCheckout,
}: ProductGalleryProps) {
  const showDiscount = regularPrice > offerPrice && discountPercent > 0;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6 font-sans">
      {/* প্রোডাক্টের একদম উপরে মানবিক উদ্যোগের বার্তা */}
      <div className="mb-3.5 rounded-xl bg-amber-50 border border-amber-200/90 px-3.5 py-2.5 text-[11px] sm:text-xs text-gray-800 leading-relaxed">
        <span className="font-bold text-amber-900">🥀 মানবিক উদ্যোগ:</span>{" "}
        আমাদের লভ্যাংশের টাকা দিয়ে অসহায় ও দুঃস্থ মানুষদের খাবারের ব্যবস্থা
        করা হয়।{" "}
        <span className="text-rose-600 font-semibold">
          ফেইক অর্ডার এড়িয়ে চলুন
        </span>{" "}
        এবং{" "}
        <span className="text-emerald-700 font-semibold">
          ক্যাশ অন ডেলিভারিতে
        </span>{" "}
        নিশ্চিন্তে অর্ডার করুন।
      </div>

      {/* অফার ব্যানার */}
      <div className="bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold px-3 py-2 rounded-xl mb-4 flex items-center justify-between shadow-sm">
        <span>
          🔥 সীমিত সময়ের মেগা অফার! ফ্রি গিফট বক্স ও ক্যাশ অন ডেলিভারি
        </span>
        {showDiscount && (
          <span className="bg-white text-rose-600 px-2 py-0.5 rounded-lg text-[11px] font-black">
            SAVE {discountPercent}%
          </span>
        )}
      </div>

      {/* মূল ছবি */}
      <div className="w-full h-72 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 mb-3 relative">
        <img
          src={selectedImage}
          alt={productName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/parl.jpg";
          }}
        />
      </div>

      {/* থাম্বনেইল তালিকা */}
      {imageList.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {imageList.map((img, idx) => {
            const isSelected = selectedImage === img;
            const activeRing = isSelected
              ? "border-[#f8931f] scale-105 shadow-md"
              : "border-gray-200 opacity-70 hover:opacity-100";

            return (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`${THUMB_BASE} ${activeRing}`}
              >
                <img
                  src={img}
                  alt={`${productName} - ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* প্রোডাক্টের শিরোনাম ও মূল্য */}
      <div className="mt-4">
        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md">
          {productCategory}
        </span>
        <h1 className="text-lg font-bold text-gray-900 mt-2">{productName}</h1>

        <div className="flex items-center gap-3 mt-2">
          <span className="text-2xl font-black text-orange-600">
            ৳{offerPrice}
          </span>
          {regularPrice > offerPrice && (
            <span className="text-sm font-bold text-gray-400 line-through">
              ৳{regularPrice}
            </span>
          )}
          {showDiscount && (
            <span className="bg-rose-100 text-rose-600 text-xs font-black px-2 py-0.5 rounded-full">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </div>

      {/* অ্যাকশন বাটন */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <button
          type="button"
          onClick={scrollToCheckout}
          className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded-xl shadow-sm text-xs transition cursor-pointer flex items-center justify-center gap-2"
        >
          🛒 Add to Cart
        </button>
        <button
          type="button"
          onClick={scrollToCheckout}
          className="bg-[#f8931f] hover:bg-[#e08219] text-white font-bold py-3 px-4 rounded-xl shadow-sm text-xs transition cursor-pointer flex items-center justify-center gap-2"
        >
          ⚡ Order Now
        </button>
      </div>
    </div>
  );
}
