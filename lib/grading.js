const COURSE_CREDITS = require("./course-credits");

const GRADE_SCALE = [
  { min: 80, letter: "A+", gp: 4.00 },
  { min: 75, letter: "A", gp: 3.75 },
  { min: 70, letter: "A-", gp: 3.50 },
  { min: 65, letter: "B+", gp: 3.25 },
  { min: 60, letter: "B", gp: 3.00 },
  { min: 55, letter: "B-", gp: 2.75 },
  { min: 50, letter: "C+", gp: 2.50 },
  { min: 45, letter: "C", gp: 2.25 },
  { min: 40, letter: "D", gp: 2.00 },
  { min: 0, letter: "F", gp: 0.00 },
];
const LETTER_TO_GP = Object.fromEntries(GRADE_SCALE.map((g) => [g.letter, g.gp]));

function gradePointFor(course) {
  if (course.marks !== null && course.marks !== undefined && course.marks !== "") {
    const m = parseFloat(course.marks);
    if (!isNaN(m)) {
      const band = GRADE_SCALE.find((g) => m >= g.min);
      return band ? band.gp : null;
    }
  }
  if (course.result && LETTER_TO_GP.hasOwnProperty(course.result)) {
    return LETTER_TO_GP[course.result];
  }
  return null; // covers null results and non-gradable letters like "AB" (absent)
}

// Credit hours for a course code, from the official Program Handbook.
// Returns null for unknown codes so callers can decide how to handle them
// (e.g. exclude from the weighted average rather than silently using 0).
function creditsFor(courseCode) {
  return COURSE_CREDITS.hasOwnProperty(courseCode) ? COURSE_CREDITS[courseCode] : null;
}

// Credit-weighted average: GPA = Σ(GP × credit) / Σ(credit)
// per the BOU Program Handbook's "Calculation of Cumulative Grade Point Average" section.
function weightedAverage(coursesWithGp) {
  let totalPoints = 0;
  let totalCredits = 0;
  let unweighable = 0; // courses we could grade but have no known credit value for

  coursesWithGp.forEach((c) => {
    if (c.grade_point === null) return; // no grade at all (e.g. absent/incomplete)
    const credit = creditsFor(c.course_code);
    if (credit === null) {
      unweighable++;
      return;
    }
    totalPoints += c.grade_point * credit;
    totalCredits += credit;
  });

  return {
    average: totalCredits > 0 ? totalPoints / totalCredits : null,
    totalCredits,
    unweighable,
  };
}

function computeAverages(student) {
  const detail = student.detail_results || {};
  const semesters = [];
  let allCoursesWithGp = [];

  Object.entries(detail).forEach(([semName, courses]) => {
    const withGp = courses.map((c) => ({ ...c, grade_point: gradePointFor(c) }));
    const semResult = weightedAverage(withGp);
    allCoursesWithGp = allCoursesWithGp.concat(withGp);
    semesters.push({
      name: semName,
      courses: withGp,
      average_grade_point: semResult.average, // now credit-weighted SGPA
      credits_completed: semResult.totalCredits,
    });
  });

  const overallResult = weightedAverage(allCoursesWithGp);

  return {
    semesters,
    overall_average_grade_point: overallResult.average, // credit-weighted CGPA
    total_credits_completed: overallResult.totalCredits,
  };
}

module.exports = { GRADE_SCALE, gradePointFor, creditsFor, computeAverages };