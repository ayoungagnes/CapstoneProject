import { Question } from "@/app/lib/models/Question";
import { QuestionGradingKey } from "@/app/lib/models/QuestionGradingKey";
import { getReadingBandScore } from "./ielts-bands";

/**
 * Compares a user's answer with the correct answer based on question type.
 * @param {string | null} userAnswer The user's submitted answer.
 * @param {string | null} correctAnswer The correct answer.
 * @param {string} questionType The type of the question.
 * @returns {boolean} True if the answer is correct, otherwise false.
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
      return userStr.toUpperCase() === correctStr.toUpperCase();
    case "fill_in_blank":
    case "short_answer":
      const userLower = userStr.toLowerCase();
      const correctLower = correctStr.toLowerCase();
      if (correctLower.includes("|")) {
        const acceptableAnswers = correctLower
          .split("|")
          .map((ans) => ans.trim());
        return acceptableAnswers.includes(userLower);
      }
      return userLower === correctLower;
    default:
      return userStr.toLowerCase() === correctStr.toLowerCase();
  }
}

/**
 * Calculates the score and statistics for a given practice session.
 * This function assumes that the practiceSession object has its related
 * data (questionGroups, questions, and answers) populated.
 * @param {object} practiceSession The Mongoose document for the practice session.
 * @returns {Promise<{totalCorrect: number, totalQuestions: number, score: number}>}
 */
export async function calculateSessionResults(practiceSession) {
  // Populate necessary data
  if (!practiceSession.answers) await practiceSession.populate('answers');
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

  // --- START OF NEW LOGIC ---
  for (const group of practiceSession.questionGroups) {
    totalQuestions += group.questions.length;
    const section = group.section; // 'reading' or 'writing'

    if (section === 'reading') {
      // For reading, we must compare answers to find the number of correct ones
      await Question.populate(group.questions, { path: "gradingKey" });
      sectionScores.reading.total += group.questions.length;
      for (const question of group.questions) {
        const userAnswer = practiceSession.answers.find(
          (a) => a.question.toString() === question._id.toString()
        );
        if (compareAnswers(userAnswer?.content, question.gradingKey?.correctAnswer, group.questionType)) {
          sectionScores.reading.achieved++;
        }
      }
    } else if (section === 'writing') {
      // For writing, the score is already on the answer document
      const writingAnswer = practiceSession.answers.find(
        (a) => a.question.toString() === group.questions[0]._id.toString()
      );
      sectionScores.writing.band = writingAnswer?.score || 0;
      sectionScores.writing.achieved = writingAnswer?.score || 0;
      sectionScores.writing.total = group.questions[0].maxScore || 9;
    }
  }

  // Convert reading's raw score to a band score
  if (sectionScores.reading.total > 0) {
    sectionScores.reading.band = getReadingBandScore(sectionScores.reading.achieved);
  }

  // Calculate overall band score (average of the sections that were practiced)
  const bandScores = Object.values(sectionScores).filter(s => s.total > 0).map(s => s.band);
  const overallBandScore = bandScores.length > 0
    ? (bandScores.reduce((a, b) => a + b, 0) / bandScores.length).toFixed(1)
    : 0;

  return {
    overallBandScore: parseFloat(overallBandScore),
    readingBandScore: sectionScores.reading.band,
    writingBandScore: sectionScores.writing.band,
    readingCorrect: sectionScores.reading.achieved,
    readingTotal: sectionScores.reading.total,
    totalQuestions,
  };
}
