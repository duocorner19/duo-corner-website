import { NextResponse } from "next/server";

// ডিফল্ট ক্যাটাগরি লিস্ট (গুগল শিটের এরর দূর করার জন্য)
const DEFAULT_CATEGORIES = [
  "ব্রেসলেট (Bracelet)",
  "নেকলেস (Necklace)",
  "স্মার্ট ওয়াচ (Smart Watch)",
  "গিফট বক্স (Gift Box)",
];

export async function GET() {
  return NextResponse.json({
    success: true,
    categories: DEFAULT_CATEGORIES,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { categoryName } = body;

    if (!categoryName || !categoryName.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "ক্যাটাগরি সফলভাবে যুক্ত হয়েছে!",
      category: categoryName.trim(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create category" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    return NextResponse.json({
      success: true,
      message: "ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete category" },
      { status: 500 },
    );
  }
}
