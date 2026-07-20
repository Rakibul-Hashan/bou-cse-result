# BOU Result Companion — Firebase + Vercel setup

## 1. Firebase (free Spark plan — no card required)

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. **Build → Firestore Database → Create database** → production mode → pick a nearby region (e.g. `asia-south1`).
3. **Firestore → Rules tab** → paste in the contents of `firestore.rules` from this project → **Publish**.
   This blocks ALL direct client access — only server-side code (Admin SDK) can read the data.
4. **Project settings (gear icon) → Service accounts → Generate new private key** → downloads `serviceAccountKey.json`.
   Save it in this project's root folder. **It's already in `.gitignore` — do not commit it.**

## 2. Seed your data

```bash
npm install
node scripts/upload-to-firestore.js path/to/your-results.json
```

Re-run this same command anytime you have a new semester's export — it overwrites matching student IDs cleanly and adds any new ones.

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Double check `serviceAccountKey.json` is NOT in the commit (`git status` should not show it — `.gitignore` handles this, but worth a glance).

## 4. Deploy on Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → import your GitHub repo.
2. Before deploying, open **Environment Variables** and add three, taken from your `serviceAccountKey.json`:

   | Key | Value (from serviceAccountKey.json) |
   |---|---|
   | `FIREBASE_PROJECT_ID` | `project_id` |
   | `FIREBASE_CLIENT_EMAIL` | `client_email` |
   | `FIREBASE_PRIVATE_KEY` | `private_key` — paste the whole thing, including `-----BEGIN PRIVATE KEY-----` and the `\n` sequences exactly as they appear in the file |

3. Click **Deploy**.

That's it — Vercel auto-detects the `/api` folder as serverless functions and everything else as static files.

## 5. Updating each semester

Locally:
```bash
node scripts/upload-to-firestore.js path/to/new-results.json
```

No redeploy needed — the site reads live from Firestore on every request, so this takes effect immediately.

## 6. Optional: clean up old rate-limit records

The lookup function writes small tracking documents to a `_rate_limits` collection to throttle abuse. They're tiny, but if you want automatic cleanup: **Firestore → your database → TTL tab (under Indexes)** → create a TTL policy on the `_rate_limits` collection, field `expiresAt`. Firestore will auto-delete expired ones for you.

## What NOT to do

- Don't add a Firestore index or query route that lists/scans the whole `students` collection from the client — the entire privacy design depends on lookups being single-document-by-exact-ID only, via the Admin SDK server-side.
- Don't loosen the Firestore rules to `allow read: if true` — that would expose every student's full record to anyone with browser dev tools, same issue we specifically built this architecture to avoid.
