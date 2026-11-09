/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function imageValue(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeProduct(product: any) {
  const imageColumns = [
    product?.["Image URL1"],
    product?.["Image URL2"],
    product?.["Image URL3"],
    product?.["Image URL4"],
    product?.image_url_1,
    product?.image_url_2,
    product?.image_url_3,
    product?.image_url_4,
  ];

  let images = imageColumns.map(imageValue).filter(Boolean);

  if (images.length === 0) {
    const oldValue =
      product?.images ??
      product?.image ??
      product?.["Image URL"] ??
      product?.imageUrl ??
      "";
    images = (Array.isArray(oldValue) ? oldValue : String(oldValue).split(","))
      .flatMap((item: unknown) => String(item ?? "").split(","))
      .map(imageValue)
      .filter(Boolean);
  }

  images = images.map((image) =>
    /^https?:\/\//i.test(image) ? image : `/${image.replace(/^\/+/, "")}`,
  );

  return {
    ...product,
    id: product.id ?? product.product_id,
    productName:
      product["Product Name"] ?? product.product_name ?? product.productName,
    regularPrice: Number(
      product["Regular Price"] ?? product.regular_price ?? 0,
    ),
    offerPrice: Number(product["Offer Price"] ?? product.offer_price ?? 0),
    category: product["Category"] ?? product.category ?? "Couple Item",
    description: product["Description"] ?? product.description ?? "",
    stock: product["Stock"] ?? product.stock ?? 10,
    images,
    image: images[0] ?? "/parl.jpg",
    imageUrl: images[0] ?? "/parl.jpg",
  };
}

// ১. POST: নতুন প্রোডাক্ট সরাসরি Supabase-এর products টেবিলে সেভ করা
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const payload = {
      "Product Name":
        body["Product Name"] || body.product_name || body.productName || "",
      "Regular Price": Number(
        body["Regular Price"] ||
          body.regular_price ||
          body.regularPrice ||
          body.price ||
          0,
      ),
      "Offer Price":
        body["Offer Price"] || body.offer_price || body.offerPrice
          ? Number(body["Offer Price"] || body.offer_price || body.offerPrice)
          : null,
      Category: body["Category"] || body.category || "",
      Stock: Number(body["Stock"] || body.stock || 0),
      Description: body["Description"] || body.description || null,
      "Image URL1":
        body["Image URL1"] || body.image_url_1 || body.imageUrl1 || "",
      "Image URL2":
        body["Image URL2"] || body.image_url_2 || body.imageUrl2 || null,
      "Image URL3":
        body["Image URL3"] || body.image_url_3 || body.imageUrl3 || null,
      "Image URL4":
        body["Image URL4"] || body.image_url_4 || body.imageUrl4 || null,
      "Video URL": body["Video URL"] || body.video_url || body.videoUrl || null,
      "⚡ PRODUCT SPECIFICATIONS": body["⚡ PRODUCT SPECIFICATIONS"] || null,
      "product type": body["product type"] || body.product_type || null,
      "Value 1": body["Value 1"] || null,
      "usable gender": body["usable gender"] || body.usable_gender || "Unisex",
      "Value 2": body["Value 2"] || null,
      Material: body["Material"] || body.material || null,
      "Value 3": body["Value 3"] || null,
      Color: body["Color"] || body.color || null,
      "Value 4": body["Value 4"] || null,
      "Single package size":
        body["Single package size"] || body.package_size || null,
      "Value 5": body["Value 5"] || null,
      "Single gross weight":
        body["Single gross weight"] || body.gross_weight || null,
      "Value 6": body["Value 6"] || null,
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
