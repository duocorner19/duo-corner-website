import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase"; // Supabase ক্লায়েন্ট ইমপোর্ট করা হলো

// ১. GET: Supabase থেকে রিয়েল-টাইম অর্ডার ফেচ করা (গুগল শিটের বদলে)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Orders API GET error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// ২. POST: ওয়েবসাইট থেকে কাস্টমার অর্ডার সরাসরি Supabase-এ সেভ করা
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const targetOrderId =
      body.order_id || body.orderId || `ORD-${Date.now().toString().slice(-6)}`;
    const customerName =
      body.name || body.customer_name || body.fullName || "Valued Customer";
    const customerPhone = String(body.number || body.phone || "");
    const customerAddress = body.address || "";
    const totalAmount = Number(
      body.collection_amount || body.total || body.collectionAmount || 0,
    );

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          order_id: targetOrderId,
          name: customerName,
          number: customerPhone,
          address: customerAddress,
          collection_amount: totalAmount,
          tracking_id: body.tracking_id || "",
          status: body.status || "pending",
          courier_action: body.courier_action || "",
          utm_source: body.utm_source || "",
          utm_campaign: body.utm_campaign || "",
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ status: "success", data });
  } catch (error: unknown) {
    console.error("Orders API POST error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Order save failed",
      },
      { status: 500 },
    );
  }
}

// ৩. PUT: Steadfast কুরিয়ারে অর্ডার পাঠানো এবং সফল বুকিং হওয়ার পরেই মেটা CAPI Purchase ইভেন্ট ফায়ার করা
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const API_KEY = "nhebmum6ll3aeirxkoa0djqscqckyjn3";
    const SECRET_KEY = "9clfsi0vrhrbzwupeojrymau";

    const targetOrderId = String(
      body.id || body.orderId || body.order_id || "DC-1",
    );
    const targetPhone = String(
      body.phone || body.customerPhone || body.number || "",
    );
    const customerName = body.name || body.customerName || "Valued Customer";
    const totalAmount = Number(
      body.totalPrice ||
        body.collectionAmount ||
        body.amount ||
        body.collection_amount ||
        0,
    );

    const payload = {
      invoice: targetOrderId,
      recipient_name: customerName,
      recipient_phone: targetPhone,
      recipient_address: body.address || body.customerAddress || "Dhaka",
      cod_amount: totalAmount,
    };

    const steadfastRes = await fetch(
      "https://portal.packzy.com/api/v1/create_order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": API_KEY,
          "Secret-Key": SECRET_KEY,
        },
        body: JSON.stringify(payload),
      },
    );

    const result = await steadfastRes.json();

    if (
      steadfastRes.ok &&
      (result.status === 200 ||
        result.status === 201 ||
        result.success === true)
    ) {
      const consignmentId = String(
        result.consignment?.consignment_id || result.consignment_id || "1",
      );

      // ক. কুরিয়ারে বুকিং সফল হওয়ার পর Supabase-এ স্ট্যাটাস ও ট্র্যাকিং আইডি আপডেট
      try {
        await supabase
          .from("orders")
          .update({
            status: "Booked",
            tracking_id: consignmentId,
            courier_action: "Steadfast Booked",
          })
          .eq("order_id", targetOrderId);
      } catch (dbErr) {
        console.error("Supabase status update error:", dbErr);
      }

      // খ. শুধুমাত্র কনফার্মড বুকিং হওয়ার পরেই ফেসবুক Conversion API (CAPI) এর মাধ্যমে Purchase ইভেন্ট পাঠানো
      const clientIp =
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        "127.0.0.1";
      const userAgent = request.headers.get("user-agent") || "";

      await sendMetaCAPI({
        eventName: "Purchase",
        phone: targetPhone,
        name: customerName,
        value: totalAmount,
        orderId: targetOrderId,
        consignmentId: consignmentId,
        clientIp,
        userAgent,
      });

      return NextResponse.json({
        success: true,
        consignmentId: consignmentId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message || JSON.stringify(result),
        },
        { status: 400 },
      );
    }
  } catch (error: unknown) {
    console.error("Steadfast API proxy error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// ----------------------------------------------------
// ফেসবুক Conversion API (CAPI) হেল্পার ফাংশন (SHA-256 এনক্রিপশন সহ)
// ----------------------------------------------------
function hashData(value: string | number | undefined | null) {
  if (!value) return undefined;
  return crypto
    .createHash("sha256")
    .update(String(value).trim().toLowerCase())
    .digest("hex");
}

async function sendMetaCAPI({
  eventName,
  phone,
  name,
  value,
  orderId,
  consignmentId,
  clientIp,
  userAgent,
}: any) {
  const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  const ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.log("Meta CAPI skipped: Pixel ID or Access Token is missing.");
    return;
  }

  try {
    await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: eventName,
              event_time: Math.floor(Date.now() / 1000),
              action_source: "website",
              event_id: `purchase_${orderId}`,
              event_source_url: "https://duocornerbd.com/admin/orders",
              user_data: {
                ph: phone ? [hashData(phone)] : undefined,
                fn: name ? [hashData(name.split(" ")[0])] : undefined,
                client_ip_address: clientIp,
                client_user_agent: userAgent,
              },
              custom_data: {
                currency: "BDT",
                value: Number(value) || 0,
                order_id: String(orderId),
                consignment_id: String(consignmentId),
              },
            },
          ],
        }),
      },
    );
  } catch (err) {
    console.error("Meta CAPI execution error:", err);
  }
}
