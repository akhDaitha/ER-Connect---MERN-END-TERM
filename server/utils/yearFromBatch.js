/**
 * Computes human-readable student academic year label from graduation batch year.
 * Example:
 * If batch = 2030: 1st Year
 * If batch = 2029: 2nd Year
 * If batch = 2028: 3rd Year
 * If batch = 2027: 4th Year
 * @param {number} batch - Graduation year (e.g. 2030)
 * @returns {string} Year label, e.g. "1st Year", "2nd Year", "Alumni / Postgrad"
 */
function getYearFromBatch(batch) {
  if (!batch || typeof batch !== 'number') return 'Student';

  // Base academic reference year for the institute
  // In a standard 4-year program, current 1st year batch is 2030:
  const diff = batch - 2026;

  switch (diff) {
    case 4:
      return '1st Year';
    case 3:
      return '2nd Year';
    case 2:
      return '3rd Year';
    case 1:
      return '4th Year';
    default:
      if (diff > 4) return 'Incoming Student';
      return 'Senior / Alumni';
  }
}

module.exports = {
  getYearFromBatch
};
