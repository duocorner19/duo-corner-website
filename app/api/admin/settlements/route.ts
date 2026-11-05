import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

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

// ১. GET: শিট থেকে সেটেলমেন্ট লেজার ফেচ করা
export async function GET() {
  try {
    const { sheets, spreadsheetId } = getGoogleSheetsClient();

    // settlements ট্যাব থেকে ডাটা আনা (Order ID, Date, Name, Phone, Collection, Delivery Charge, Net, Status, Courier)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "settlements!A2:I",
    });

    const rows = res.data.values || [];
    const settlements = rows.map((r) => ({
      orderId: r[0] || "",
      date: r[1] || "",
      customerName: r[2] || "",
      phone: r[3] || "",
      collectionAmount: Number(r[4]) || 0,
      deliveryCharge: Number(r[5]) || 0,
      netReceivable: Number(r[6]) || 0,
      status: (r[7] as any) || "Pending",
      courierName: r[8] || "Steadfast Courier",
    }));

    return NextResponse.json({ success: true, settlements });
  } catch (err: any) {
    console.error("Settlement GET Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}

// ২. POST: কুরিয়ার ব্যালেন্স স্টেটমেন্ট সিঙ্ক ও স্ট্যাটাস আপডেট
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, newStatus } = body;

    const { sheets, spreadsheetId } = getGoogleSheetsClient();

    // শিটের সমস্ত রো পড়া
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "settlements!A2:A",
    });

    const rows = sheetData.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === orderId);

    if (rowIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Order ID not found" },
        { status: 404 },
      );
    }

    const targetRow = rowIndex + 2; // হেডার বাদে

    // স্ট্যাটাস কলাম (H কলাম) আপডেট
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `settlements!H${targetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[newStatus]],
      },
    });

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (err: any) {
    console.error("Settlement POST Error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 },
    );
  }
}
