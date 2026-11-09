/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase"; // Supabase ক্লায়েন্ট ইমপোর্ট

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // বডি থেকে প্রয়োজনীয় ফিল্ডগুলো সংগ্রহ করা
    const targetOrderId = String(
      body.orderId || body.order_id || body.id || "",
    );
    const trackingCode = body.trackingCode || body.tracking_id || null;
    const status = body.status || null;
    const courierAction = body.courierAction || body.courier_action || null;

    if (!targetOrderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 },
      );
    }

    // আপডেটের জন্য অবজেক্ট তৈরি
    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (trackingCode) updateData.tracking_id = trackingCode;
    if (courierAction) updateData.courier_action = courierAction;

    // Supabase-এর orders টেবিলে ডেটা আপডেট করা
    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("order_id", targetOrderId)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, result: data });
  } catch (error: any) {
    console.error("Order Update API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || error.toString() },
      { status: 500 },
    );
  }
}
