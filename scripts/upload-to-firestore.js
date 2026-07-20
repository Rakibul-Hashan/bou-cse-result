/**
 * Run this locally whenever you have a new results JSON to load
 * (e.g. next semester's export).
 *
 * Usage:
 *   node scripts/upload-to-firestore.js path/to/results-data.json
 *
 * Requires serviceAccountKey.json in the project root.
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const { computeAverages } = require("../lib/grading");

const serviceAccount = require(path.join(__dirname, "..", "serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error("Usage: node scripts/upload-to-firestore.js path/to/results-data.json");
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, "utf-8");
  const students = JSON.parse(raw);

  if (!Array.isArray(students)) {
    console.error("Expected the JSON file to be an array of student records.");
    process.exit(1);
  }

  console.log(`Uploading ${students.length} records...`);

  const batchSize = 400; // Firestore batch write limit is 500
  let uploaded = 0;
  let noCgpa = 0;

  for (let i = 0; i < students.length; i += batchSize) {
    const chunk = students.slice(i, i + batchSize);
    const batch = db.batch();

    chunk.forEach((student) => {
      if (!student) return;

      const studentId = student.student_id || student.studentId || student.id;
      if (!studentId) return;

      // Real BOU formula: CGPA = Sum(GP x credit) / Sum(credit), computed from
      // detail_results using the official course-credit table (lib/course-credits.js).
      const { overall_average_grade_point, total_credits_completed } =
        computeAverages(student);

      const numericCgpa = overall_average_grade_point !== null
        ? Math.round(overall_average_grade_point * 100) / 100
        : 0;

      if (overall_average_grade_point === null) noCgpa++;

      const ref = db.collection("students").doc(String(studentId));

      const formattedData = {
        ...student,
        student_id: String(studentId),
        name: student.student_name || student.name || "N/A", // ranking.js reads `name`
        cgpa: numericCgpa,                    // credit-weighted, guaranteed number
        credits_completed: total_credits_completed,
      };

      batch.set(ref, formattedData, { merge: true });
    });

    await batch.commit();
    uploaded += chunk.length;
    console.log(`   ...${uploaded}/${students.length}`);
  }

  if (noCgpa > 0) {
    console.log(`Note: ${noCgpa} student(s) had no gradable/creditable courses -- cgpa set to 0 for them.`);
  }
  console.log("Done uploading records.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});