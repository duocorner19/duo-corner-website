import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// Google Sheets ক্লায়েন্ট ইনিশিয়ালাইজেশন
function getGoogleSheetsClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error("Missing Google Service Account credentials");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  return { sheets, spreadsheetId };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.STEADFAST_API_KEY;
    const secretKey = process.env.STEADFAST_SECRET_KEY;
    const baseUrl =
      process.env.STEADFAST_BASE_URL ||
      "https://portal.steadfast.com.bd/api/v1";

    if (!apiKey || !secretKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Steadfast API keys are missing in .env.local",
        },
        { status: 400 },
      );
    }

    // ১. Steadfast API থেকে পেমেন্ট বা কনসাইনমেন্ট স্টেটমেন্ট ফেচ করা
    const sfResponse = await fetch(`${baseUrl}/get_payments`, {
      method: "GET",
      headers: {
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
        "Content-Type": "application/json",
      },
      // ক্যাশিং বন্ধ রাখতে
      cache: "no-store",
    });

    const sfData = await sfResponse.json();

    if (sfData.status !== 200 && !sfData.payments) {
      // যদি Steadfast সরাসরি get_payments এন্ডপয়েন্টে ডাটা না দেয়, ট্র্যাকিং/কনসাইনমেন্ট চেক
      return NextResponse.json(
        {
          success: false,
          message: sfData.message || "Failed to fetch Steadfast statement",
        },
        { status: 502 },
      );
    }

    const steadfastPayments = sfData.payments || [];

    // ২. গুগল শিটের বিদ্যমান settlements রিড করা
    const { sheets, spreadsheetId } = getGoogleSheetsClient();
    const existingDataRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "settlements!A2:I",
    });

    const existingRows = existingDataRes.data.values || [];
    const existingOrderMap = new Map<string, number>();

    existingRows.forEach((row, idx) => {
      if (row[0]) {
        existingOrderMap.set(row[0].trim(), idx + 2); // শিটের রো ইনডেক্স
      }
    });

    const updateBatch: any[] = [];
    const newRowsToAppend: any[][] = [];
    let syncedCount = 0;

    // ৩. Steadfast পেমেন্ট ডেটার সাথে রিকনসিলিয়েশন ও ম্যাপিং
    for (const item of steadfastPayments) {
      const invoiceId =
        item.invoice || item.order_id || `SF-${item.consignment_id}`;
      const collectionAmount = Number(item.amount || item.cod_amount || 0);
      const deliveryCharge = Number(item.delivery_charge || 0);
      const netReceivable = collectionAmount - deliveryCharge;

      // Steadfast পেমেন্ট স্টেটাস নির্ধারণ
      let status: "Matched" | "Pending" | "Disputed" = "Pending";
      if (item.status === "paid" || item.status === "settled") {
        status = "Matched";
      } else if (item.status === "disputed" || item.status === "cancelled") {
        status = "Disputed";
      }

      const dateStr = item.date || new Date().toISOString().slice(0, 10);
      const customerName = item.recipient_name || "N/A";
      const phone = item.recipient_phone || "N/A";
      const courier = "Steadfast Courier";

      if (existingOrderMap.has(invoiceId)) {
        // অর্ডার আগে থেকেই শিটে থাকলে স্ট্যাটাস ও নেট রিভেবল আপডেট
        const rowNum = existingOrderMap.get(invoiceId);
        updateBatch.push({
          range: `settlements!E${rowNum}:H${rowNum}`,
          values: [[collectionAmount, deliveryCharge, netReceivable, status]],
        });
      } else {
        // নতুন সেটেলমেন্ট রো অ্যাপেন্ড
        newRowsToAppend.push([
          invoiceId,
          dateStr,
          customerName,
          phone,
          collectionAmount,
          deliveryCharge,
          netReceivable,
          status,
          courier,
        ]);
      }
      syncedCount++;
    }

    // ৪. গুগল শিটে ব্যাচ আপডেট এক্সিকিউট করা
    if (updateBatch.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: "USER_ENTERED",
          data: updateBatch,
        },
      });
    }

    if (newRowsToAppend.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "settlements!A:I",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: newRowsToAppend,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${syncedCount} records from Steadfast Courier.`,
      updated: updateBatch.length,
      inserted: newRowsToAppend.length,
    });
  } catch (error: any) {
    console.error("Steadfast Sync API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
