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
    <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-gray-200 mb-4 font-sans">
      <div className="mb-3 rounded-lg bg-[#fff8eb] border border-[#f3dfb8] px-3 py-2 text-[11px] sm:text-xs text-gray-800 leading-snug">
        <span className="font-bold text-[#8a5300]">🥀 মানবিক উদ্যোগ:</span>{" "}
        প্রিয়জনকে উপহার দিন,{" "}
        <span className="text-[#b42318] font-semibold">
          একদিকে প্রিয়জনের হাসি, অন্যদিকে অসহায়ের খাবার—এই অর্ডারে দুইটাই একসাথে
        </span>{" "}
        এবং{" "}
        <span className="text-[#067647] font-semibold">
          ক্যাশ অন ডেলিভারিতে
        </span>{" "}
        নিশ্চিন্তে অর্ডার করুন।
      </div>

      <div className="bg-[#c83e2b] text-white text-xs font-bold px-3 py-1.5 rounded-lg mb-3 flex items-center justify-between gap-2">
        <span>
          🔥 সীমিত সময়ের মেগা অফার! ফ্রি গিফট বক্স ও ক্যাশ অন ডেলিভারি
        </span>
        {showDiscount && (
          <span className="bg-white text-[#b42318] px-2 py-0.5 rounded text-[11px] font-extrabold shrink-0">
            SAVE {discountPercent}%
          </span>
        )}
      </div>

      <div className="w-full h-64 sm:h-72 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 mb-2.5">
        <img
          src={selectedImage}
          alt={productName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/parl.jpg";
          }}
        />
      </div>

      {imageList.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imageList.map((img, idx) => {
            const active = selectedImage === img;
            return (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`w-14 h-14 rounded-lg overflow-hidden border shrink-0 transition cursor-pointer ${
                  active
                    ? "border-[#d97706] ring-1 ring-[#d97706]"
                    : "border-gray-200 opacity-75 hover:opacity-100"
                }`}
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

      <div className="mt-3">
        <span className="inline-block text-[10px] font-bold text-[#9a3412] bg-[#fff7ed] border border-[#fed7aa] px-2 py-0.5 rounded">
          {productCategory}
        </span>
        <h1 className="text-base sm:text-lg font-bold text-gray-900 mt-1.5 leading-snug">
          {productName}
        </h1>

        <div className="flex items-center gap-2.5 mt-1.5">
          <span className="text-xl sm:text-2xl font-extrabold text-[#c2410c]">
            ৳{offerPrice}
          </span>
          {regularPrice > offerPrice && (
            <span className="text-xs sm:text-sm font-semibold text-gray-400 line-through">
              ৳{regularPrice}
            </span>
          )}
          {showDiscount && (
            <span className="bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] text-[11px] font-bold px-2 py-0.5 rounded">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mt-4">
        <button
          type="button"
          onClick={scrollToCheckout}
          className="bg-[#1f242b] hover:bg-[#111418] text-white font-bold py-2.5 px-3 rounded-lg text-xs transition cursor-pointer"
        >
          🛒 Add to Cart
        </button>
        <button
          type="button"
          onClick={scrollToCheckout}
          className="bg-[#d97706] hover:bg-[#b45309] text-white font-bold py-2.5 px-3 rounded-lg text-xs transition cursor-pointer"
        >
          ⚡ Order Now
        </button>
      </div>
    </div>
  );
}
