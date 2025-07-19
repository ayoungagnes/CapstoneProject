import { Question } from "@/app/lib/models/Question";

/**
 * Compares a user's answer with the correct answer based on question type.
 * @param {string | null} userAnswer The user's submitted answer.
 * @param {string | null} correctAnswer The correct answer.
 * @param {string} questionType The type of the question.
 * @returns {boolean} True if the answer is correct, otherwise false.
 */
export function compareAnswers(userAnswer, correctAnswer, questionType) {
  if (userAnswer === null || correctAnswer === null || userAnswer === undefined || correctAnswer === undefined) {
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
        const acceptableAnswers = correctLower.split("|").map((ans) => ans.trim());
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
  // Ensure the nested 'gradingKey' is populated for accurate scoring.
  if (practiceSession?.questionGroups) {
    for (const group of practiceSession.questionGroups) {
      if (group.questions?.length > 0 && !group.questions[0].gradingKey) {
        await Question.populate(group.questions, { path: "gradingKey" });
      }
    }
  }

  const userAnswersMap = new Map(
    practiceSession.answers.map((answer) => [answer.question.toString(), answer])
  );

  let totalCorrect = 0;
  let totalQuestions = 0;

  (practiceSession.questionGroups || []).forEach((group) => {
    (group.questions || []).forEach((question) => {
      totalQuestions++;
      const userAnswer = userAnswersMap.get(question._id.toString());
      const correctAnswer = question.gradingKey?.correctAnswer;
      const userAnswerContent = userAnswer ? userAnswer.content : null;

      if (compareAnswers(userAnswerContent, correctAnswer, group.questionType)) {
        totalCorrect++;
      }
    });
  });

  const score = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  return { totalCorrect, totalQuestions, score };
}