/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function imageValue(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeProduct(product: any) {
  // আপনার সুপাবেসের নিখুঁত ৪টি ইমেজ কলাম থেকে ইমেজ সংগ্রহ
  const imageColumns = [
    product?.["Image URL1"],
    product?.["Image URL2"],
    product?.["Image URL3"],
    product?.["Image URL4"],
  ];

  let images = imageColumns.map(imageValue).filter(Boolean);

  if (images.length === 0) {
    images = ["/parl.jpg"];
  }

  images = images.map((image) =>
    /^https?:\/\//i.test(image) ? image : `/${image.replace(/^\/+/, "")}`,
  );

  return {
    ...product,
    id: product.id ?? product.product_id,
    productName: product["Product Name"] || "Product",
    regularPrice: Number(product["Regular Price"] || 0),
    offerPrice: Number(product["Offer Price"] || 0),
    category: product["Category"] || "Couple Item",
    description: product["Description"] || "",
    stock: Number(product["Stock"] || 0),
    images,
    image: images[0] ?? "/parl.jpg",
    imageUrl: images[0] ?? "/parl.jpg",
    // অতিরিক্ত প্রপার্টিগুলো ম্যাপিং করা হলো যাতে কোনো ডাটা মিসিং না হয়
    videoUrl: product["Video URL"] || "",
    productSpecifications: product["⚡ PRODUCT SPECIFICATIONS"] || "",
    productType: product["product type"] || "",
    usableGender: product["usable gender"] || "Unisex",
    material: product["Material"] || "",
    color: product["Color"] || "",
    singlePackageSize: product["Single package size"] || "",
    singleGrossWeight: product["Single gross weight"] || "",
    value1: product["Value 1"] || "",
    value2: product["Value 2"] || "",
    value3: product["Value 3"] || "",
    value4: product["Value 4"] || "",
    value5: product["Value 5"] || "",
    value6: product["Value 6"] || "",
  };
}

// ১. POST: নতুন প্রোডাক্ট সরাসরি Supabase-এর products টেবিলে সেভ করা
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const payload = {
      "Product Name": body["Product Name"] || body.productName || "",
      "Regular Price": Number(body["Regular Price"] || body.regularPrice || 0),
      "Offer Price":
        body["Offer Price"] !== undefined ? Number(body["Offer Price"]) : null,
      Category: body["Category"] || body.category || "",
      Stock: Number(body["Stock"] || body.stock || 0),
      Description: body["Description"] || body.description || null,
      "Image URL1": body["Image URL1"] || body.imageUrl1 || "",
      "Image URL2": body["Image URL2"] || body.imageUrl2 || null,
      "Image URL3": body["Image URL3"] || body.imageUrl3 || null,
      "Image URL4": body["Image URL4"] || body.imageUrl4 || null,
      "Video URL": body["Video URL"] || body.videoUrl || null,
      "⚡ PRODUCT SPECIFICATIONS":
        body["⚡ PRODUCT SPECIFICATIONS"] || body.productSpecifications || null,
      "product type": body["product type"] || body.productType || null,
      "Value 1": body["Value 1"] || body.value1 || null,
      "usable gender": body["usable gender"] || body.usableGender || "Unisex",
      "Value 2": body["Value 2"] || body.value2 || null,
      Material: body["Material"] || body.material || null,
      "Value 3": body["Value 3"] || body.value3 || null,
      Color: body["Color"] || body.color || null,
      "Value 4": body["Value 4"] || body.value4 || null,
      "Single package size":
        body["Single package size"] || body.singlePackageSize || null,
      "Value 5": body["Value 5"] || body.value5 || null,
      "Single gross weight":
        body["Single gross weight"] || body.singleGrossWeight || null,
      "Value 6": body["Value 6"] || body.value6 || null,
    };

    const { data, error } = await supabase
      .from("products")
      .insert([payload])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    console.error("Supabase Products API POST error:", error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// ২. GET: Supabase থেকে সমস্ত প্রোডাক্ট আনা
export async function GET() {
  try {
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      throw error;
    }

    const normalizedData = (data || []).map(normalizeProduct);

    return NextResponse.json(normalizedData);
  } catch (error) {
    console.error("Products API GET error:", error);
    return NextResponse.json(
      { success: false, message: "প্রোডাক্ট লোড করা যায়নি।" },
      { status: 500 },
    );
  }
}
