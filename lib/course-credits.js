/**
 * Course code -> credit hours, extracted from the official BOU
 * "Program Handbook — B.Sc in Computer Science and Engineering"
 * (Session 2021-2022 and onwards), section "Year and Semester Wise
 * Course and Credit Hour Distribution".
 *
 * The 'P' in a course code marks a Practical/Laboratory/Sessional
 * course (0.75 or 1.5 credits per the handbook's numbering system).
 */

module.exports = {
  // First Year - First Semester
  ENG1131: 3.0, PHY1132: 3.0, BUS1123: 2.0, MAT1134: 3.0,
  EEE1135: 3.0, EEE11P6: 0.75, CSE1127: 2.0, CSE11P8: 0.75,

  // First Year - Second Semester
  MAT1231: 3.0, HUM1222: 2.0, EEE1233: 3.0, EEE12P4: 1.5,
  CSE1235: 3.0, CSE12P6: 1.5, CSE1237: 3.0, CSE12P8: 1.5,

  // Second Year - First Semester
  MAT2131: 3.0, CHE2122: 2.0, CSE2133: 3.0, CSE2134: 3.0,
  CSE2135: 3.0, CSE21P6: 1.5, CSE2137: 3.0, CSE21P8: 1.5,

  // Second Year - Second Semester
  ECO2221: 2.0, CSE2232: 3.0, CSE22P3: 0.75, CSE2234: 3.0,
  CSE22P5: 0.75, CSE2236: 3.0, CSE22P7: 1.5, CSE2238: 3.0, CSE22P9: 1.5,

  // Third Year - First Semester
  MAT3131: 3.0, CSE3122: 2.0, CSE3133: 3.0, CSE3134: 3.0,
  CSE31P5: 1.5, CSE3136: 3.0, CSE31P7: 1.5, CSE31P8: 1.5, CSE31P9: 1.5,

  // Third Year - Second Semester
  CSE3221: 2.0, CSE3232: 3.0, CSE3233: 3.0, CSE32P4: 1.5,
  CSE3235: 3.0, CSE32P6: 0.75, CSE3237: 3.0, CSE32P8: 1.5, CSE32P9: 1.5,

  // Fourth Year - First Semester
  CSE4121: 2.0, CSE4132: 3.0, CSE4133: 3.0, CSE41P4: 0.75,
  CSE4135: 3.0, CSE41P6: 1.5, CSE4137: 3.0, CSE41P8: 0.75,

  // Fourth Year - Second Semester
  CSE4231: 3.0, CSE4232: 3.0, CSE42P3: 0.75, CSE4234: 3.0,
  CSE42P5: 1.5, CSE4246: 4.0 /* Project */, CSE4227: 2.0 /* Comprehensive Viva Voce */,
};
