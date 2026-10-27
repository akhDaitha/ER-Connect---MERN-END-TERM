const crisisKeywords = require('../config/crisisKeywords');

/**
 * Scans text for self-harm or crisis keywords.
 * Returns true if a potential crisis keyword is identified.
 * @param {string} text
 * @returns {boolean}
 */
function scanForCrisis(text) {
  if (!text || typeof text !== 'string') return false;

  const normalized = text.toLowerCase();
  for (const keyword of crisisKeywords) {
    if (normalized.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  return false;
}

module.exports = {
  scanForCrisis
};
