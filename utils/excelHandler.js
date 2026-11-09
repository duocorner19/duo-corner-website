import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Supabase ক্লায়েন্ট ইমপোর্ট

// ১. GET: Supabase থেকে রিয়েল-টাইম অর্ডার ফেচ করা এবং লেটেস্ট অর্ডারগুলো আগে দেখানো (Advanced Sorting)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const ordersArray = Array.isArray(data) ? data : [];
    return NextResponse.json(ordersArray);
  } catch (error) {
    console.error("Orders API GET error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// ২. POST: ওয়েবসাইট থেকে কাস্টমার অর্ডার সরাসরি Supabase-এ সেভ করার অ্যাডভান্সড রাউট
export async function POST(request) {
  try {
    const body = await request.json();

    const orderId = String(
      body.id ||
        body.orderId ||
        body.order_id ||
        `ORD-${Date.now().toString().slice(-6)}`,
    );
    const name =
      body.name || body.Name || body.customerName || "Unknown Customer";
    const phone = String(
      body.phone ||
        body.Phone ||
        body.customerPhone ||
        body.Number ||
        body.number ||
        "",
    );
    const address = body.address || body.Address || "";
    const collectionAmount = Number(
      body.totalPrice ||
        body.amount ||
        body.Amount ||
        body.productPrice ||
        body.collectionAmount ||
        0,
    );

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          order_id: orderId,
          name: name,
          number: phone,
          address: address,
          collection_amount: collectionAmount,
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
  } catch (error) {
    console.error("Orders API POST error:", error);
    return NextResponse.json(
      { status: "error", message: "Order save failed" },
      { status: 500 },
    );
  }
}

// ৩. PUT: Steadfast কুরিয়ারে অর্ডার পাঠানো এবং Supabase-এ স্ট্যাটাস আপডেট করা
export async function PUT(request) {
  try {
    const body = await request.json();

    const API_KEY = "nhebmum6ll3aeirxkoa0djqscqckyjn3";
    const SECRET_KEY = "9clfsi0vrhrbzwupeojrymau";

    const numericTrackingId = String(body.serialNumber || "1");
    const targetOrderId = String(
      body.id || body.orderId || body.order_id || "DC-1",
    );

    const payload = {
      invoice: targetOrderId,
      recipient_name: body.name,
      recipient_phone: body.phone,
      recipient_address: body.address,
      cod_amount: Number(body.totalPrice || 0),
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
        result.consignment?.consignment_id ||
          result.consignment_id ||
          numericTrackingId,
      );

      // Supabase-এ স্ট্যাটাস ও ট্র্যাকিং আইডি আপডেট
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
  } catch (error) {
    console.error("Steadfast API proxy error:", error);
    return NextResponse.json(
      { success: false, error: error.toString() },
      { status: 500 },
    );
  }
}
