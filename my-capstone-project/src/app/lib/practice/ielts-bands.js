const readingBandMap = {
  40: 9.0, 39: 9.0,
  38: 8.5, 37: 8.5,
  36: 8.0, 35: 8.0,
  34: 7.5, 33: 7.5,
  32: 7.0, 31: 7.0, 30: 7.0,
  29: 6.5, 28: 6.5, 27: 6.5, 26: 6.5,
  25: 6.0, 24: 6.0, 23: 6.0,
  22: 5.5, 21: 5.5, 20: 5.5, 19: 5.5,
  18: 5.0, 17: 5.0, 16: 5.0, 15: 5.0,
  14: 4.5, 13: 4.5,
  12: 4.0, 11: 4.0, 10: 4.0,
  9: 3.5, 8: 3.5,
  7: 3.0, 6: 3.0,
  5: 2.5, 4: 2.5,
};

/**
 * Converts a raw score for a 40-question reading test into an IELTS band.
 * @param {number} correctAnswers - The number of correct answers.
 * @returns {number} The corresponding IELTS band score.
 */
export function getReadingBandScore(correctAnswers) {
  if (correctAnswers <= 0) return 0;
  if (correctAnswers >= 40) return 9.0;
  
  // Find the closest score in the map if an exact match isn't found
  let score = correctAnswers;
  while (!readingBandMap[score] && score > 0) {
    score--;
  }
  return readingBandMap[score] || 0;
}