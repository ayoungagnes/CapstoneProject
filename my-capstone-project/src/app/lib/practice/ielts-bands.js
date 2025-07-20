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
 * @param {number} correctAnswers - The number of correct answers.
 * @param {number} totalQuestions - The total number of questions in the test.
 * @returns {number} The corresponding IELTS band score.
 */
export function convertRawScoreToReadingBand(correctAnswers, totalQuestions) {
  // Guard against division by zero
  if (totalQuestions === 0) return 0;

  let scaledScore = correctAnswers;

  // If the test was not a full 40 questions, scale the score proportionally.
  if (totalQuestions !== 40) {
    // Formula: (Correct / Total) * 40
    scaledScore = Math.round((correctAnswers / totalQuestions) * 40);
  }

  // Now, use the scaled score to look up the band.
  if (scaledScore <= 0) return 0;
  if (scaledScore >= 40) return 9.0;
  let scoreToLookup = scaledScore;
  while (!readingBandMap[scoreToLookup] && scoreToLookup > 0) {
    scoreToLookup--;
  }
  return readingBandMap[scoreToLookup] || 0;
}