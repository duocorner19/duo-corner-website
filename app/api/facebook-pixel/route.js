import { NextResponse } from "next/server";
import crypto from "crypto";

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

// ফেসবুকে ইউজার ডেটা পাঠানোর জন্য আবশ্যক SHA-256 হ্যাশিং ফাংশন
function hashData(value) {
  if (!value) return undefined;
  return crypto
    .createHash("sha256")
    .update(String(value).trim().toLowerCase())
    .digest("hex");
}

// GET রিকোয়েস্ট টেস্ট করার জন্য
export async function GET() {
  return NextResponse.json({
    status: "Facebook Conversion API endpoint is active!",
    pixelId: PIXEL_ID ? "Configured" : "Missing",
  });
}

// POST রিকোয়েস্ট হ্যান্ডেল করার জন্য
export async function POST(request) {
  try {
    const body = await request.json();
    const { eventName, eventId, eventSourceUrl, userData, customData } = body;

    if (!PIXEL_ID || !ACCESS_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Pixel ID or Access Token is missing in environment variables.",
        },
        { status: 400 },
      );
    }

    const url = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

    // ক্লায়েন্ট আইপি বের করা
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";

    // ফেসবুক CAPI পেলোড
    const payload = {
      data: [
        {
          event_name: eventName || "ViewContent",
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId || undefined, // ব্রাউজার পিক্সেলের সাথে ডি-ডুপ্লিকেশনের জন্য জরুরি
          event_source_url: eventSourceUrl || "https://duo-corner.vercel.app",
          action_source: "website",
          user_data: {
            em: userData?.email ? [hashData(userData.email)] : undefined,
            ph: userData?.phone ? [hashData(userData.phone)] : undefined,
            fn: userData?.firstName
              ? [hashData(userData.firstName)]
              : undefined,
            client_ip_address: clientIp,
            client_user_agent: userAgent,
          },
          custom_data: customData || {},
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
