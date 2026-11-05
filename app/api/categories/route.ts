import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// Google Sheets Client Initialization
function getGoogleSheetsClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error(
      "Missing Google Service Account credentials in environment variables.",
    );
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

// ১. GET: সমস্ত ক্যাটাগরি লিস্ট ফেচ করা
export async function GET() {
  try {
    const { sheets, spreadsheetId } = getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "categories!A2:C",
    });

    const rows = response.data.values || [];

    // শুধুমাত্র অ্যাক্টিভ ও ভ্যালিড ক্যাটাগরি নামগুলো ফিল্টার করা
    const categories = rows
      .filter(
        (row) =>
          row[0] && row[0].trim() !== "" && (row[2] || "Active") !== "Deleted",
      )
      .map((row) => row[0].trim());

    return NextResponse.json({
      success: true,
      categories:
        categories.length > 0
          ? categories
          : [
              "ব্রেসলেট (Bracelet)",
              "নেকলেস (Necklace)",
              "স্মার্ট ওয়াচ (Smart Watch)",
              "গিফট বক্স (Gift Box)",
            ],
    });
  } catch (error: any) {
    console.error("GET Categories Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch categories",
      },
      { status: 500 },
    );
  }
}

// ২. POST: নতুন ক্যাটাগরি গুগল শিটে অ্যাপেন্ড করা
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoryName } = body;

    if (
      !categoryName ||
      typeof categoryName !== "string" ||
      !categoryName.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 },
      );
    }

    const trimmedName = categoryName.trim();
    const { sheets, spreadsheetId } = getGoogleSheetsClient();

    // ডুপ্লিকেট ক্যাটাগরি চেক করা
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "categories!A2:A",
    });

    const rows = existing.data.values || [];
    const isDuplicate = rows.some(
      (row) =>
        row[0] && row[0].trim().toLowerCase() === trimmedName.toLowerCase(),
    );

    if (isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          message: "এই নামের ক্যাটাগরি ইতিমধ্যে বিদ্যমান আছে!",
        },
        { status: 409 },
      );
    }

    const timestamp = new Date().toISOString();

    // শিটে নতুন রো যুক্ত করা [category_name, created_at, status]
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "categories!A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[trimmedName, timestamp, "Active"]],
      },
    });

    return NextResponse.json({
      success: true,
      message: "ক্যাটাগরি সফলভাবে গুগল শিটে সেভ হয়েছে!",
      category: trimmedName,
    });
  } catch (error: any) {
    console.error("POST Category Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create category" },
      { status: 500 },
    );
  }
}

// ৩. DELETE: ক্যাটাগরি স্ট্যাটাস 'Deleted' হিসেবে মার্ক করা
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoryName } = body;

    if (!categoryName) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 },
      );
    }

    const { sheets, spreadsheetId } = getGoogleSheetsClient();

    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "categories!A2:A",
    });

    const rows = existing.data.values || [];
    const rowIndex = rows.findIndex(
      (r) =>
        r[0] && r[0].trim().toLowerCase() === categoryName.trim().toLowerCase(),
    );

    if (rowIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Category not found in sheet" },
        { status: 404 },
      );
    }

    const targetRow = rowIndex + 2;

    // C কলামে স্ট্যাটাস "Deleted" আপডেট করা
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `categories!C${targetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["Deleted"]],
      },
    });

    return NextResponse.json({
      success: true,
      message: "ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে!",
    });
  } catch (error: any) {
    console.error("DELETE Category Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete category" },
      { status: 500 },
    );
  }
}
