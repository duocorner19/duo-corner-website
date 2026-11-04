import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "reviews.json");

function getReviews() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify([]));
      return [];
    }
    const fileData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileData || "[]");
  } catch (err) {
    console.error("Reviews read error:", err);
    return [];
  }
}

export async function GET() {
  const reviews = getReviews();
  const total = reviews.length;
  const avg =
    total > 0
      ? (
          reviews.reduce(
            (acc: number, r: any) => acc + Number(r.rating || 5),
            0,
          ) / total
        ).toFixed(1)
      : "5.0";

  return NextResponse.json({
    success: true,
    averageRating: avg,
    totalReviews: total,
    reviews: reviews.reverse(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, rating, comment, tags, image } = body;

    if (!name || (!comment && (!tags || tags.length === 0))) {
      return NextResponse.json(
        { success: false, error: "নাম এবং মন্তব্য প্রদান করুন।" },
        { status: 400 },
      );
    }

    const reviews = getReviews();
    const newReview = {
      id: `rev-${Date.now()}`,
      name: String(name).trim(),
      rating: Number(rating) || 5,
      comment: String(comment || "").trim(),
      tags: Array.isArray(tags) ? tags : [],
      image: image || null,
      date: new Date().toISOString().split("T")[0],
      verified: true,
    };

    reviews.push(newReview);
    fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2), "utf-8");

    return NextResponse.json({ success: true, review: newReview });
  } catch (error: any) {
    console.error("Reviews save error:", error);
    return NextResponse.json(
      { success: false, error: "রিভিউ সেভ করতে ব্যর্থ হয়েছে।" },
      { status: 500 },
    );
  }
}
