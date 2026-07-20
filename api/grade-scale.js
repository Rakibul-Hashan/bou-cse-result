const { GRADE_SCALE } = require("../lib/grading");

module.exports = (req, res) => {
  res.status(200).json(GRADE_SCALE);
};
