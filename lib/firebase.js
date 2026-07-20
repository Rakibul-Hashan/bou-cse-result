const admin = require("firebase-admin");

// Credentials come from Vercel environment variables — never from a committed file.
// Set these in Vercel dashboard → Project → Settings → Environment Variables:
//   FIREBASE_PROJECT_ID
//   FIREBASE_CLIENT_EMAIL
//   FIREBASE_PRIVATE_KEY   (paste the private_key value from serviceAccountKey.json,
//                            keeping the \n line breaks as literal \n characters)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

module.exports = { db };
