import { NextResponse } from "next/server";

const API_KEY = "nhebmum6ll3aeirxkoa0djqscqckyjn3";
const SECRET_KEY = "9clfsi0vrhrbzwupeojrymau";

// ফোন নম্বর থেকে ফ্রড চেক করার কমন ফাংশন
async function handleFraudCheck(phone) {
  if (!phone) {
    return {
      status: 400,
      data: { success: false, error: "Phone number is required" },
    };
  }

  // ১১ ডিজিটের সঠিক বাংলাদেশী ফোন নম্বর ফিল্টার
  let cleanPhone = String(phone).replace(/\D/g, "");
  if (cleanPhone.startsWith("88") && cleanPhone.length === 13) {
    cleanPhone = cleanPhone.substring(2);
  }
  if (cleanPhone.length === 10 && !cleanPhone.startsWith("0")) {
    cleanPhone = "0" + cleanPhone;
  }

  try {
    // Steadfast Live Fraud Check API Call
    const res = await fetch(
      `https://portal.packzy.com/api/v1/fraud_check/${cleanPhone}`,
      {
        method: "GET",
        headers: {
          "Api-Key": API_KEY,
          "Secret-Key": SECRET_KEY,
          "Content-Type": "application/json",
        },
        next: { revalidate: 180 }, // ৩ মিনিট ক্যাশ রাখা যাতে পেজ দ্রুত লোড হয়
      },
    );

    const result = await res.json();

    if (res.ok && (result.status === 200 || result.success)) {
      const deliveredOrders = Number(
        result.total_delivered ??
          result.delivered ??
          result.data?.total_delivered ??
          0,
      );
      const cancelledOrders = Number(
        result.total_cancelled ??
          result.cancelled ??
          result.data?.total_cancelled ??
          0,
      );
      const totalOrders = deliveredOrders + cancelledOrders;

      const successRate =
        totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 100;

      // রিস্ক লেভেল নির্ধারণ
      let riskLevel = "Low Risk (Trusted)";
      let riskColor = "emerald";

      if (totalOrders === 0) {
        riskLevel = "New Buyer (No History)";
        riskColor = "cyan";
      } else if (successRate < 60 || cancelledOrders >= 3) {
        riskLevel = "High Risk (Fraud Alert)";
        riskColor = "rose";
      } else if (successRate < 80 || cancelledOrders >= 1) {
        riskLevel = "Medium Risk";
        riskColor = "amber";
      }

      return {
        status: 200,
        data: {
          success: true,
          phone: cleanPhone,
          totalOrders,
          deliveredOrders,
          cancelledOrders,
          successRate: successRate.toFixed(1),
          riskLevel,
          riskColor,
          raw: result,
        },
      };
    }

    // কোনো ডেটা না থাকলে ডিফল্ট ফ্রেশ কাস্টমার
    return {
      status: 200,
      data: {
        success: true,
        phone: cleanPhone,
        totalOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        successRate: "100.0",
        riskLevel: "New Buyer (No History)",
        riskColor: "cyan",
      },
    };
  } catch (error) {
    console.error("Fraud check fetch error:", error);
    return {
      status: 500,
      data: {
        success: false,
        error: "Steadfast server error",
        message: error.message,
      },
    };
  }
}

// GET মেথড (CustomerRiskBadge কম্পোনেন্টের জন্য)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  const response = await handleFraudCheck(phone);
  return NextResponse.json(response.data, { status: response.status });
}

// POST মেথড (আপনার আগের কোডের সাথে ১০০% সামঞ্জস্যপূর্ণ)
export async function POST(req) {
  try {
    const body = await req.json();
    const phone = body?.phone;
    const response = await handleFraudCheck(phone);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
