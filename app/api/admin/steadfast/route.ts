import { NextResponse } from "next/server";
import crypto from "crypto";

const STEADFAST_API_URL = "https://portal.packzy.com/api/v1/create_order";
const API_KEY = "nhebmum6ll3aeirxkoa0djqscqckyjn3";
const SECRET_KEY = "9clfsi0vrhrbzwupeojrymau";
const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_URL;

// Meta CAPI Credentials (এনভায়রনমেন্ট ভ্যারিয়েবল থেকে)
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

// Meta CAPI-র জন্য SHA-256 হ্যাশিং ফাংশন
function hashData(value) {
  if (!value) return undefined;
  return crypto
    .createHash("sha256")
    .update(String(value).trim().toLowerCase())
    .digest("hex");
}

export async function POST(request) {
  try {
    const order = await request.json();

    // সঠিক অর্ডার আইডি এবং ফোন নম্বর নিশ্চিত করা
    const targetOrderId = order.orderId || order.invoice || `ORD-${Date.now()}`;
    const targetPhone = order.customerPhone || order.phone || "";
    const customerName = order.customerName || order.name || "Customer";
    const codAmount = Number(order.productPrice || order.amount || 0);

    const payload = {
      invoice: targetOrderId,
      recipient_name: customerName,
      recipient_phone: targetPhone,
      recipient_address: order.customerAddress || order.address || "Dhaka",
      cod_amount: codAmount,
      note: order.note || "Duo Corner Order",
    };

    const response = await fetch(STEADFAST_API_URL, {
      method: "POST",
      headers: {
        "Api-Key": API_KEY,
        "Secret-Key": SECRET_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.status === 200 || result.success) {
      const consignmentId =
        result.consignment?.consignment_id ||
        result.consignment_id ||
        `CN-${Date.now()}`;

      // ১. গুগল শিটে স্ট্যাটাস ও ট্র্যাকিং আইডি আপডেট
      if (GOOGLE_SHEET_URL) {
        try {
          await fetch(GOOGLE_SHEET_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "update_order_status",
              orderId: targetOrderId,
              phone: targetPhone,
              trackingCode: String(consignmentId),
              status: "Booked",
            }),
            cache: "no-store",
          });
        } catch (sheetErr) {
          console.error("Google Sheet Update Error:", sheetErr);
        }
      }

      // ২. Steadfast বুকিং সফল হওয়ার পর Meta CAPI-তে আসল Purchase ইভেন্ট ফায়ার করা
      if (FB_PIXEL_ID && FB_ACCESS_TOKEN) {
        try {
          const clientIp =
            request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            "127.0.0.1";
          const userAgent = request.headers.get("user-agent") || "";

          const metaPayload = {
            data: [
              {
                event_name: "Purchase",
                event_time: Math.floor(Date.now() / 1000),
                event_id: `purchase_${targetOrderId}`, // ইউনিক ইভেন্ট আইডি
                event_source_url: "https://duocornerbd.com/admin/orders",
                action_source: "website",
                user_data: {
                  ph: targetPhone ? [hashData(targetPhone)] : undefined,
                  fn: customerName
                    ? [hashData(customerName.split(" ")[0])]
                    : undefined,
                  client_ip_address: clientIp,
                  client_user_agent: userAgent,
                },
                custom_data: {
                  currency: "BDT",
                  value: codAmount,
                  order_id: String(targetOrderId),
                  consignment_id: String(consignmentId),
                  content_type: "product",
                },
              },
            ],
          };

          // ব্যাকগ্রাউন্ডে মেটা সার্ভারে পাঠানো
          const metaRes = await fetch(
            `https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(metaPayload),
            },
          );

          // ৩. গুগল শিটে Meta CAPI ট্র্যাকিং লগ সংরক্ষণ (নতুন ফিচার)
          if (GOOGLE_SHEET_URL) {
            try {
              await fetch(GOOGLE_SHEET_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "log_tracking_event",
                  eventName: "Purchase",
                  orderId: targetOrderId,
                  status: metaRes.ok ? "Success" : "Failed",
                  amount: codAmount,
                  traceId: String(consignmentId),
                }),
                cache: "no-store",
              });
            } catch (logErr) {
              console.error("Google Sheet Tracking Log Error:", logErr);
            }
          }
        } catch (metaErr) {
          console.error("Meta CAPI Purchase Dispatch Error:", metaErr);
        }
      }

      return NextResponse.json({ success: true, result, consignmentId });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Steadfast এন্ট্রি ব্যর্থ হয়েছে",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
