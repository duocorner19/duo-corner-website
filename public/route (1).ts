import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Supabase ক্লায়েন্ট ইমপোর্ট

function imageValue(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeProduct(product: any) {
  // Supabase টেবিলের কলাম (image_url_1, image_url_2) এবং আগের ফরম্যাট সাপোর্ট
  const imageColumns = [
    product?.image_url_1,
    product?.image_url_2,
    product?.image_url_3,
    product?.image_url_4,
    product?.["Image URL1"],
    product?.["Image URL2"],
    product?.["Image URL3"],
    product?.["Image URL4"],
    product?.["Image URL 1"],
    product?.["Image URL 2"],
    product?.["Image URL 3"],
    product?.["Image URL 4"],
  ];

  let images = imageColumns.map(imageValue).filter(Boolean);

  // Backward compatibility for the old single-column/comma-separated format
  if (images.length === 0) {
    const oldValue =
      product?.images ??
      product?.image ??
      product?.["Image URL"] ??
      product?.imageUrl ??
      product?.F ??
      "";
    images = (Array.isArray(oldValue) ? oldValue : String(oldValue).split(","))
      .flatMap((item: unknown) => String(item ?? "").split(","))
      .map(imageValue)
      .filter(Boolean);
  }

  // Keep remote image URLs intact; prefix local public filenames with '/'
  images = images.map((image) =>
    /^https?:\/\//i.test(image) ? image : `/${image.replace(/^\/+/, "")}`,
  );

  return {
    ...product,
    // ফ্রন্টএন্ড যাতে আগের নামেই ডেটা পায় তার ব্যাকওয়ার্ড সাপোর্ট
    productName: product.product_name ?? product.productName,
    regularPrice: product.regular_price ?? product.regularPrice,
    offerPrice: product.offer_price ?? product.offerPrice,
    images,
    image: images[0] ?? "",
    imageUrl: images[0] ?? "",
  };
}

// ১. POST: নতুন প্রোডাক্ট সরাসরি Supabase-এর products টেবিলে সেভ করা
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const payload = {
      product_name: body.product_name || body.productName || "",
      regular_price: Number(
        body.regular_price || body.regularPrice || body.price || 0,
      ),
      offer_price:
        body.offer_price || body.offerPrice
          ? Number(body.offer_price || body.offerPrice)
          : null,
      category: body.category || "",
      stock: Number(body.stock || 0),
      description: body.description || null,
      image_url_1:
        body.image_url_1 ||
        body.imageUrl1 ||
        body.imageUrl ||
        body["Image URL1"] ||
        "",
      image_url_2:
        body.image_url_2 || body.imageUrl2 || body["Image URL2"] || null,
      image_url_3:
        body.image_url_3 || body.imageUrl3 || body["Image URL3"] || null,
      image_url_4:
        body.image_url_4 || body.imageUrl4 || body["Image URL4"] || null,
      video_url: body.video_url || body.videoUrl || null,
      product_type: body.product_type || body.productType || null,
      usable_gender: body.usable_gender || body.usableGender || "Unisex",
      material: body.material || null,
      color: body.color || null,
      package_size: body.package_size || body.packageSize || null,
      gross_weight: body.gross_weight || body.grossWeight || null,
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

// ২. GET: Supabase থেকে সুপারফাস্ট স্পিডে প্রোডাক্ট ফেচ করা
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

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
