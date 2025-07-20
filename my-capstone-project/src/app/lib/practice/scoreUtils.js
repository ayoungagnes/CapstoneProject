import { Question } from "@/app/lib/models/Question";
import { convertRawScoreToReadingBand } from "./ielts-bands";

/**
 * Compares a user's answer with the correct answer based on question type.
 * @param {string | null} userAnswer - The user's submitted answer.
 * @param {string | null} correctAnswer - The correct answer from gradingKey.
 * @param {string} questionType - The question type (e.g., 'true_false_ng', 'fill_in_blank').
 * @returns {boolean} True if the answer is considered correct, otherwise false.
 */
export function compareAnswers(userAnswer, correctAnswer, questionType) {
  if (
    userAnswer === null ||
    correctAnswer === null ||
    userAnswer === undefined ||
    correctAnswer === undefined
  ) {
    return false;
  }

  const userStr = userAnswer.toString().trim();
  const correctStr = correctAnswer.toString().trim();

  switch (questionType) {
    case "true_false_ng":
    case "multiple_choice":
      // Normalize case for comparison (e.g., "TRUE" vs "true")
      return userStr.toUpperCase() === correctStr.toUpperCase();

    case "fill_in_blank":
    case "short_answer":
      const userLower = userStr.toLowerCase();
      const correctLower = correctStr.toLowerCase();

      // Allow multiple acceptable answers separated by "|"
      if (correctLower.includes("|")) {
        const acceptableAnswers = correctLower
          .split("|")
          .map((ans) => ans.trim());
        return acceptableAnswers.includes(userLower);
      }

      return userLower === correctLower;

    default:
      // Fallback to simple lowercase equality check
      return userStr.toLowerCase() === correctStr.toLowerCase();
  }
}

/**
 * Calculates a unified 9-band score for a completed practice session.
 * Assumes the session's answers and questionGroups (with questions) are populated.
 * @param {object} practiceSession - A Mongoose document of the practice session.
 * @returns {Promise<object>} - Scoring summary including reading/writing bands and overall.
 */
export async function calculateSessionResults(practiceSession) {
  // Ensure answers are populated
  if (!practiceSession.answers) {
    await practiceSession.populate("answers");
  }

  // Ensure each questionGroup has its questions populated
  if (!practiceSession.questionGroups[0].questions) {
    await practiceSession.populate({
      path: "questionGroups",
      populate: { path: "questions", model: "Question" },
    });
  }

  const sectionScores = {
    reading: { achieved: 0, total: 0, band: 0 },
    writing: { achieved: 0, total: 0, band: 0 },
  };

  let totalQuestions = 0;

  for (const group of practiceSession.questionGroups) {
    totalQuestions += group.questions.length;
    const section = group.section;

    if (section === "reading") {
      // Populate gradingKey for each reading question
      await Question.populate(group.questions, { path: "gradingKey" });

      sectionScores.reading.total += group.questions.length;

      for (const question of group.questions) {
        // Find the user's answer for this specific question
        const userAnswer = practiceSession.answers.find(
          (a) => a.question.toString() === question._id.toString()
        );

        // Use comparison logic based on question type
        if (
          compareAnswers(
            userAnswer?.content,
            question.gradingKey?.correctAnswer,
            group.questionType
          )
        ) {
          sectionScores.reading.achieved++;
        }
      }
    }

    if (section === "writing") {
      // Assume only one question per writing group
      const writingAnswer = practiceSession.answers.find(
        (a) => a.question.toString() === group.questions[0]._id.toString()
      );

      // Use score field from writing answer directly (e.g., 7.5)
      sectionScores.writing.band = writingAnswer?.score || 0;
      sectionScores.writing.achieved = writingAnswer?.score || 0;
      sectionScores.writing.total = group.questions[0].maxScore || 9;
    }
  }

  // Convert reading raw score to IELTS band
  if (sectionScores.reading.total > 0) {
    sectionScores.reading.band = convertRawScoreToReadingBand(
      sectionScores.reading.achieved,
      sectionScores.reading.total
    );
  }

  // Average all available section bands (e.g., reading + writing)
  const bandScores = Object.values(sectionScores)
    .filter((s) => s.total > 0)
    .map((s) => s.band);

  const overallBandScore =
    bandScores.length > 0
      ? bandScores.reduce((a, b) => a + b, 0) / bandScores.length
      : 0;

  // Round to nearest 0.5 (e.g., 6.75 → 7.0, 6.25 → 6.5)
  const roundedOverallBand = (Math.round(overallBandScore * 2) / 2).toFixed(1);

  return {
    overallBandScore: parseFloat(roundedOverallBand),
    readingBandScore: sectionScores.reading.band,
    writingBandScore: sectionScores.writing.band,
    readingCorrect: sectionScores.reading.achieved,
    readingTotal: sectionScores.reading.total,
    writingTotal: sectionScores.writing.total,
    totalQuestions,
  };
}
