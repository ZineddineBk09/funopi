# Google Sheets Database - Quick Reference

## 🚀 Quick Setup (5 Minutes)

### 1. Google Cloud Setup

```bash
1. Go to: https://console.cloud.google.com/
2. Create new project
3. Enable "Google Sheets API"
4. Create Service Account > Download JSON key
5. Copy client_email and private_key from JSON
```

### 2. Google Sheet Setup

```bash
1. Create new Google Sheet
2. Add headers in Row 1: First Name | Last Name | Email | Phone | etc.
3. Share sheet with service account email (Editor permission)
4. Copy Sheet ID from URL
```

### 3. Environment Variables

```env
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_sheet_id_from_url
```

### 4. Install Package

```bash
npm install googleapis
```

---

## 📦 Essential Code

### Basic Setup (`src/lib/google-sheets.ts`)

```typescript
import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export const sheets = google.sheets({ version: "v4", auth });
export const SHEET_ID = process.env.GOOGLE_SHEET_ID;
```

### Read Data

```typescript
const response = await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID,
  range: "Sheet1!A:J",
});
const rows = response.data.values || [];
```

### Write Data (Append)

```typescript
await sheets.spreadsheets.values.append({
  spreadsheetId: SHEET_ID,
  range: "Sheet1!A:J",
  valueInputOption: "USER_ENTERED",
  requestBody: {
    values: [[value1, value2, value3, ...]],
  },
});
```

### Update Data

```typescript
await sheets.spreadsheets.values.update({
  spreadsheetId: SHEET_ID,
  range: "Sheet1!A2:J2",
  valueInputOption: "USER_ENTERED",
  requestBody: {
    values: [[newValue1, newValue2, ...]],
  },
});
```

---

## 🔍 Common Ranges

| Range            | Description                  |
| ---------------- | ---------------------------- |
| `Sheet1!A:A`     | Entire column A              |
| `Sheet1!A:J`     | Columns A through J          |
| `Sheet1!A2:J`    | Column A-J, starting row 2   |
| `Sheet1!A2:J100` | Specific range               |
| `Sheet1!C:C`     | Single column (e.g., emails) |

---

## 🐛 Common Issues & Fixes

### "Caller does not have permission"

→ Share sheet with service account email

### "Private key is invalid"

→ Check newlines: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`

### "Entity was not found"

→ Verify GOOGLE_SHEET_ID is correct

### Environment vars not loading

→ Restart dev server after changing .env

---

## 📊 Sheet Organization

### Recommended Structure

```
Row 1 (Headers): Field1 | Field2 | Field3 | ... | Timestamp
Row 2+: Data rows
```

### Column Mapping

```typescript
const COLUMNS = {
  FIRST_NAME: "A",
  LAST_NAME: "B",
  EMAIL: "C",
  PHONE: "D",
  // ... etc
  TIMESTAMP: "J",
};
```

---

## ⚡ Performance Tips

1. Use specific ranges instead of entire columns
2. Batch operations when possible
3. Cache frequently accessed data
4. Implement retry logic for API errors
5. Rate limit: 100 requests/100 seconds

---

## 🔒 Security Checklist

- ✅ Add `.env.local` to `.gitignore`
- ✅ Never commit credentials
- ✅ Use minimal permissions (Editor role only)
- ✅ Share sheet only with service account
- ✅ Validate all input data
- ✅ Use environment-specific sheets

---

## 🧪 Test Connection

```typescript
// test-sheets.ts
import { sheets, SHEET_ID } from "./src/lib/google-sheets";

async function test() {
  const response = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });
  console.log("Connected to:", response.data.properties?.title);
}
test();
```

```bash
npx ts-node test-sheets.ts
```

---

## 📈 When to Migrate

Consider moving to a real database when:

- Dataset > 10,000 rows
- Traffic > 100 requests/minute
- Need complex queries
- Need real-time features
- Handling sensitive data

---

## 🔗 Quick Links

- [Full Documentation](./GOOGLE_SHEETS_DATABASE_GUIDE.md)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [googleapis npm](https://www.npmjs.com/package/googleapis)
