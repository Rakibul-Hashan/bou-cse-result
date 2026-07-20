const { db } = require("../../lib/firebase");
const { computeAverages } = require("../../lib/grading");

const RATE_LIMIT_MAX = 12; // requests per window, per IP
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

async function checkRateLimit(ip) {
  const bucket = Math.floor(Date.now() / RATE_LIMIT_WINDOW_MS);
  const ref = db.collection("_rate_limits").doc(`${ip}_${bucket}`);

  const result = await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const count = doc.exists ? doc.data().count : 0;
    if (count >= RATE_LIMIT_MAX) {
      return false;
    }
    tx.set(ref, { count: count + 1, expiresAt: Date.now() + RATE_LIMIT_WINDOW_MS }, { merge: true });
    return true;
  });

  return result;
}

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown")
    .toString()
    .split(",")[0]
    .trim();

  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return res.status(429).json({ error: "Too many lookups from this device. Please wait a minute and try again." });
  }

  const rawId = req.query.id || "";
  const id = rawId.toString().replace(/[^0-9]/g, "");

  if (!id) {
    return res.status(400).json({ error: "Enter a valid student ID." });
  }

  try {
    const doc = await db.collection("students").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "No result found for that ID in this dataset." });
    }

    const student = doc.data();
    const { semesters, overall_average_grade_point } = computeAverages(student);

    return res.status(200).json({
      student_id: student.student_id,
      student_name: student.student_name,
      program_name: student.program_name || student.program_short_name,
      study_center_name: student.study_center_name,
      batch: student.batch,
      is_completed: student.is_completed,
      semesters,
      overall_average_grade_point,
    });
  } catch (err) {
    console.error("Lookup error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};
