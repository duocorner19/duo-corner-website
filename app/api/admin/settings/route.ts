import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// Google Sheets API ক্লায়েন্ট সেটআপ
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

// ১. GET মেথড: গুগল শিট থেকে বর্তমান সেটিংস লোড করা
export async function GET() {
  try {
    const { sheets, spreadsheetId } = getGoogleSheetsClient();

    // system_settings ট্যাব থেকে সমস্ত রো আনা
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "system_settings!A2:F",
    });

    const rows = response.data.values || [];
    const settings: Record<string, any> = {};

    rows.forEach(([key, val]) => {
      if (key) {
        let parsedVal: any = val;
        if (val === "true") parsedVal = true;
        else if (val === "false") parsedVal = false;
        else if (!isNaN(Number(val)) && val.trim() !== "")
          parsedVal = Number(val);

        settings[key] = parsedVal;
      }
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("GET Settings Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// ২. POST মেথড: UI থেকে আসা সেটিংস গুগল শিটে ব্যাচ আপডেট করা
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { settings, user = "Admin" } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payload: settings object is required",
        },
        { status: 400 },
      );
    }

    const { sheets, spreadsheetId } = getGoogleSheetsClient();

    // বিদ্যমান system_settings রিড করে row index বের করা
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "system_settings!A2:B",
    });

    const existingRows = sheetData.data.values || [];
    const keyToRowIndexMap = new Map<string, number>();

    existingRows.forEach((row, index) => {
      if (row[0]) {
        keyToRowIndexMap.set(row[0].trim(), index + 2); // শিটের বাস্তব রো নম্বর (A2 থেকে শুরু)
      }
    });

    const updatePayloads: any[] = [];
    const auditLogs: any[][] = [];
    const newKeysToAppend: any[][] = [];
    const now = new Date().toISOString();

    // প্রতিটি সেটিং চেক ও আপডেট প্রস্তুত করা
    for (const [key, value] of Object.entries(settings)) {
      const stringValue = String(value);

      if (keyToRowIndexMap.has(key)) {
        const rowNum = keyToRowIndexMap.get(key);
        const oldVal = existingRows[rowNum! - 2][1] || "";

        // ভ্যালু পরিবর্তিত হলে তবেই আপডেট ও অডিট লগে যোগ হবে
        if (oldVal !== stringValue) {
          updatePayloads.push({
            range: `system_settings!B${rowNum}:F${rowNum}`,
            values: [[stringValue, "", "", now, user]],
          });

          // audit_logs: [log_id, setting_key, old_value, new_value, changed_by, timestamp]
          auditLogs.push([
            `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            key,
            oldVal,
            stringValue,
            user,
            now,
          ]);
        }
      } else {
        // নতুন কোনো কি (Key) থাকলে নিচে অ্যাপেন্ড হবে
        newKeysToAppend.push([
          key,
          stringValue,
          "general",
          "Auto-generated",
          now,
          user,
        ]);
      }
    }

    // ১. বিদ্যমান রোগুলো ব্যাচ আপডেট (একটি নেটওয়ার্ক কলেই সব আপডেট হবে)
    if (updatePayloads.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: "USER_ENTERED",
          data: updatePayloads,
        },
      });
    }

    // ২. নতুন কি থাকলে শিটের শেষে অ্যাপেন্ড করা
    if (newKeysToAppend.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "system_settings!A:F",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: newKeysToAppend,
        },
      });
    }

    // ৩. Audit Log টেবিলে পরিবর্তন সংরক্ষণ
    if (auditLogs.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: "audit_logs!A:F",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: auditLogs,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Settings synchronized successfully with Google Sheets",
      updatedCount: updatePayloads.length + newKeysToAppend.length,
    });
  } catch (error: any) {
    console.error("POST Settings Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update settings" },
      { status: 500 },
    );
  }
}
