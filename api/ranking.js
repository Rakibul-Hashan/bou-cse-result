const { db } = require("../lib/firebase");

module.exports = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;

    // Fetch top students ordered by CGPA descending
    const snapshot = await db.collection("students")
      .orderBy("cgpa", "desc")
      .limit(limit)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({ rankings: [] });
    }

    let rank = 1;
    const rankings = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        rank: rank++,
        id: data.student_id || data.studentId || doc.id,
        name: data.name || data.student_name || "N/A",
        batch: data.batch || data.batch_name || "N/A",
        cgpa: typeof data.cgpa === "number" ? data.cgpa : parseFloat(data.cgpa || 0)
      };
    });

    return res.status(200).json({ rankings });
  } catch (error) {
    console.error("Ranking API Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch rankings" });
  }
};