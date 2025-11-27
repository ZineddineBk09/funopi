## Bored Button Clone

A recreation of BoredButton.com built with Next.js (App Router), Tailwind CSS v4, and TypeScript. Visitors hit the red button to load a random distraction inside an iframe while ratings are logged to Google Sheets for later analysis.

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to use the app. The homepage replicates the original Bored Button copy; `/play` hosts the iframe shell, sticky header, mini button, and star ratings.

## Google Sheets Configuration

Follow `GOOGLE_SHEETS_QUICK_REFERENCE.md` to provision a service account and share your sheet. Three environment variables are required in `.env.local`:

```
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_sheet_id
ADMIN_USERNAME=choose_an_email_or_name
ADMIN_PASSWORD=choose_a_strong_password
# Optional but recommended:
ADMIN_SESSION_SECRET=random_long_string
```

### `Games` Sheet (manages iframe list)

Create a tab named **Games** with the columns:

| Column | Description                 |
| ------ | --------------------------- |
| A      | Title (shown in header)     |
| B      | URL (must allow iframes)    |
| C      | Description (1-2 sentences) |

When this sheet contains at least one valid URL, `/play` will pull exclusively from it. If the tab is empty or the request fails, the app falls back to the hard-coded list in `src/data/sites.ts`.

### `UsersRatings` Sheet (stores votes)

Create a tab named **UsersRatings** with columns:

| Column | Description                        |
| ------ | ---------------------------------- |
| A      | Site title                         |
| B      | Rating (1-5)                       |
| C      | Visitor ID (auto via localStorage) |
| D      | User agent (optional)              |
| E      | ISO timestamp                      |

The API appends a new row per vote and recomputes averages/counts on the fly.

## Admin Console

- Navigate manually to `/admin` (there are no public links).
- Sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD`. Successful logins issue a short-lived, httpOnly session cookie.
- Dashboard features:
  - Overview cards for games, ratings, and unique visitors (based on the stored visitor IDs).
  - Top-rated list (top 5 experiences by average rating).
  - Games manager to add, edit, or delete entries without touching the sheet directly.
- Dedicated `/admin/ratings` visualization that charts every vote’s distribution per site (accessible only after signing in).
- All admin APIs (`/api/admin/*`) are protected by the same session cookie, so credentials are required before any CRUD or stats calls execute.

## Seeding the Google Sheet & Admin Credentials

Use the helper script to copy the fallback list (`src/data/sites.ts`) into the `Games` tab and ensure `.env.local` has admin credentials:

```bash
GOOGLE_CLIENT_EMAIL=... GOOGLE_PRIVATE_KEY="..." GOOGLE_SHEET_ID=... npm run seed
```

- Provide `ADMIN_USERNAME`, `ADMIN_PASSWORD`, or `ADMIN_SESSION_SECRET` env vars to override the generated defaults.
- The script appends any missing values to `.env.local` so the admin UI can be accessed immediately after seeding.

## Commands

| Script             | Purpose                           |
| ------------------ | --------------------------------- |
| `npm run dev`      | Start local dev server            |
| `npm run lint`     | Run ESLint via `next lint`        |
| `npx tsc --noEmit` | Type-check without emitting files |

## Deployment

Deploy to any Next.js-compatible platform (e.g., Vercel). Remember to set the three Google Sheets environment variables in your hosting dashboard so the live site can pull games and store ratings. If they are missing, the UI will silently fall back to the built-in sites and disable rating persistence.
