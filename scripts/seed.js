#!/usr/bin/env node
/**
 * Seeds the Google Sheet Games tab using the local fallback list in src/data/sites.ts
 * and ensures admin credentials are present in .env.local.
 *
 * Usage:
 *   GOOGLE_CLIENT_EMAIL=... GOOGLE_PRIVATE_KEY="..." GOOGLE_SHEET_ID=... node scripts/seed.js
 *
 * Optional:
 *   ADMIN_USERNAME=... ADMIN_PASSWORD=... will be used; otherwise defaults are generated.
 */

const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { google } = require("googleapis");
const dotenvPath = path.resolve(__dirname, "../.env.local");
require("dotenv").config({ path: dotenvPath });

const SITES_FILE = path.join(ROOT, "src/data/sites.ts");
const ENV_FILE = dotenvPath;

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

function assertSheetsConfig() {
  if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    throw new Error(
      "Missing Google Sheets credentials. Please set GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID.",
    );
  }
}

function parseSitesFile() {
  const source = fs.readFileSync(SITES_FILE, "utf8");
  const match = source.match(
    /export const sites\s*(?::\s*[^=]+)?=\s*(\[[\s\S]*?\]);/,
  );
  if (!match) {
    throw new Error("Unable to locate sites array in src/data/sites.ts");
  }

  try {
    // eslint-disable-next-line no-new-func
    const sites = new Function(`return ${match[1]};`)();
    if (!Array.isArray(sites)) {
      throw new Error("Parsed data is not an array.");
    }
    return sites.map((site) => ({
      title: String(site.title ?? "").trim(),
      url: String(site.url ?? "").trim(),
      description: String(site.description ?? "").trim(),
    }));
  } catch (error) {
    throw new Error(`Failed to parse sites array: ${error.message}`);
  }
}

async function seedGames(sites) {
  assertSheetsConfig();

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  console.log(`Clearing existing rows in Games tab for sheet ${SHEET_ID}...`);
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: "Games!A:C",
  });

  console.log("Writing header row...");
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: "Games!A1:C1",
    valueInputOption: "RAW",
    requestBody: {
      values: [["Title", "URL", "Description"]],
    },
  });

  console.log(`Seeding ${sites.length} games from src/data/sites.ts...`);
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Games!A:C",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: sites.map((site) => [site.title, site.url, site.description]),
    },
  });
}

function randomString(length = 10) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

function seedAdminEnv() {
  const envExists = fs.existsSync(ENV_FILE);
  const envContent = envExists ? fs.readFileSync(ENV_FILE, "utf8") : "";
  const updates = [];

  const ensureVar = (key, fallback) => {
    if (new RegExp(`^${key}=`, "m").test(envContent)) {
      return;
    }
    const value = process.env[key] ?? fallback;
    updates.push(`${key}=${value}`);
  };

  ensureVar("ADMIN_USERNAME", `admin_${randomString()}@example.com`);
  ensureVar("ADMIN_PASSWORD", randomString(16));
  ensureVar("ADMIN_SESSION_SECRET", randomString(32));

  if (!updates.length) {
    console.log(".env.local already has admin credentials.");
    return;
  }

  const needsNewline =
    envExists && envContent.length && !envContent.endsWith("\n");
  const prefix = envExists && needsNewline ? "\n" : envExists ? "" : "";
  fs.appendFileSync(ENV_FILE, `${prefix}${updates.join("\n")}\n`);
  console.log("Updated .env.local with admin credentials:");
  updates.forEach((line) => console.log(`  - ${line}`));
}

async function main() {
  try {
    const sites = parseSitesFile();
    await seedGames(sites);
    seedAdminEnv();
    console.log("Seeding complete ✅");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  }
}

main();
