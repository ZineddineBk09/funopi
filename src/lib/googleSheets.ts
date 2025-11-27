import { google } from "googleapis";

const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
export const SHEET_ID = process.env.GOOGLE_SHEET_ID;

if (!clientEmail || !privateKey || !SHEET_ID) {
  console.warn(
    "Google Sheets credentials are not fully configured. Check your environment variables.",
  );
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: clientEmail,
    private_key: privateKey,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export const sheets = google.sheets({ version: "v4", auth });
