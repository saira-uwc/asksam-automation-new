import dotenv from "dotenv";
dotenv.config();

import { google } from "googleapis";
import fs from "fs";
import path from "path";

const SHEET_TAB = process.env.SHEET_TAB || "Sheet1";

const privateKey = process.env.G_PRIVATE_KEY
  ? process.env.G_PRIVATE_KEY.replace(/\\n/g, "\n")
  : "";

async function getAuth() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.G_CLIENT_EMAIL,
      private_key: privateKey
    },
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive"
    ]
  });
  return auth.getClient();
}

/**
 * Upload only for FAILED / TIMEDOUT
 */
async function uploadToDrive(auth, filePath) {
  try {
    if (!filePath) return "";
    if (!fs.existsSync(filePath)) return "";

    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.create({
      requestBody: {
        name: path.basename(filePath),
        parents: [process.env.DRIVE_FOLDER_ID]
      },
      media: {
        mimeType: "application/octet-stream",
        body: fs.createReadStream(filePath)
      }
    });

    const fileId = response.data.id;

    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" }
    });

    return `https://drive.google.com/uc?id=${fileId}`;
  } catch (err) {
    console.log("⚠ Drive upload failed:", err.message);
    return "";
  }
}

export async function writeToSheet({
  moduleName,
  testName,
  status,
  screenshotPath,
  videoPath,
  htmlReportLink
}) {
  try {
    const authClient = await getAuth();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    const finalStatus = status?.toUpperCase() || "UNKNOWN";

    let screenshotURL = "";
    let videoURL = "";

    // 🔥 IMPORTANT LOGIC
    // Upload evidence ONLY for FAILED / TIMEDOUT
    if (finalStatus === "FAILED" || finalStatus === "TIMEDOUT") {
      screenshotURL = await uploadToDrive(authClient, screenshotPath);
      videoURL = await uploadToDrive(authClient, videoPath);
    }

    const row = [
      new Date().toISOString(),
      moduleName || "Unknown",
      testName || "Unknown",
      finalStatus,
      screenshotURL,
      videoURL,
      htmlReportLink || ""
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      range: `${SHEET_TAB}!A:G`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] }
    });

    console.log("✅ Sheet updated:", testName, finalStatus);
  } catch (err) {
    console.log("❌ Sheet update failed (ignored):", err.message);
  }
}