import dotenv from "dotenv";
dotenv.config();

import { google } from "googleapis";
import fs from "fs";

console.log("🌍 ENV inside sheet-writer → DRIVE_FOLDER =", process.env.DRIVE_FOLDER_ID);
console.log("🌍 ENV inside sheet-writer → SHEET_ID =", process.env.SHEET_ID);

const privateKey = process.env.G_PRIVATE_KEY?.replace(/\\n/g, "\n") || "";

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

async function uploadToDrive(auth, filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return "";

    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.create({
      requestBody: {
        name: filePath.split("/").pop(),
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
    console.log("⚠ Upload failed, but continuing:", err.message);
    return "";
  }
}

export async function writeToSheet({
  moduleName,
  testName,
  status,
  screenshotPath,
  videoPath
}) {
  try {
    const auth = await getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const screenshotURL = await uploadToDrive(auth, screenshotPath);
    const videoURL = await uploadToDrive(auth, videoPath);

    const row = [
      new Date().toISOString(),
      moduleName,
      testName,
      status,
      screenshotURL,
      videoURL
    ];

    console.log("📝 Writing row to sheet:", row);

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      range: "asksam!A:F",   
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] }   // <—— FIXED
    });

    console.log("✔ Sheet update SUCCESS:", row);

  } catch (err) {
    console.log("❌ Sheet Update Failed:", err.message);
  }
}
