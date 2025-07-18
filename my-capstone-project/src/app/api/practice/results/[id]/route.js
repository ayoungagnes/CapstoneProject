import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/app/lib/mongoose";
import { PracticeSession } from "@/app/lib/models/PracticeSession";
import { QuestionGroup } from "@/app/lib/models/QuestionGroup";
import { Question } from "@/app/lib/models/Question";
import { Answer } from "@/app/lib/models/Answer";
import { QuestionGradingKey } from "@/app/lib/models/QuestionGradingKey";

/**
 * A robust helper function to compare a user's answer with the correct answer.
 * @param {string | null} userAnswer - The answer submitted by the user.
 * @param {string | null} correctAnswer - The correct answer from the grading key.
 * @param {string} questionType - The type of question to guide the comparison logic.
 * @returns {boolean} - True if the answer is correct, false otherwise.
 */
function compareAnswers(userAnswer, correctAnswer, questionType) {
  // If either answer is missing, it's incorrect.
  if (
    userAnswer === null ||
    correctAnswer === null ||
    userAnswer === undefined ||
    correctAnswer === undefined
  ) {
    return false;
  }

  // Normalize answers for comparison.
  const userStr = userAnswer.toString().trim();
  const correctStr = correctAnswer.toString().trim();

  switch (questionType) {
    case "true_false_ng":
    case "multiple_choice":
      return userStr.toUpperCase() === correctStr.toUpperCase();

    // For fill-in-the-blank, we might have multiple acceptable answers.
    case "fill_in_blank":
    case "short_answer":
      const userLower = userStr.toLowerCase();
      const correctLower = correctStr.toLowerCase();

      // Check for multiple answers separated by '|'
      if (correctLower.includes("|")) {
        const acceptableAnswers = correctLower
          .split("|")
          .map((ans) => ans.trim());
        return acceptableAnswers.includes(userLower);
      }
      return userLower === correctLower;

    default:
      // Default to a simple case-insensitive comparison.
      return userStr.toLowerCase() === correctStr.toLowerCase();
  }
}

export async function GET(request, { params }) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    // 2. Fetch Data (Two-Step Population for Reliability)
    // First, populate the "real" document paths.
    const practiceSession = await PracticeSession.findById(id)
      .populate({
        path: "questionGroups",
        populate: {
          path: "questions",
          model: "Question",
        },
      })
      .populate("answers");

    // Second, explicitly populate the nested VIRTUAL field. This is the most reliable method.
    if (practiceSession && practiceSession.questionGroups) {
      for (const group of practiceSession.questionGroups) {
        await Question.populate(group.questions, {
          path: "gradingKey",
        });
      }
    }
    // 3. Validation and Authorization
    if (!practiceSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (practiceSession.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access Forbidden" }, { status: 403 });
    }

    // 4. Process the Results
    const userAnswersMap = new Map(
      practiceSession.answers.map((answer) => [
        answer.question.toString(),
        answer,
      ])
    );

    let totalCorrect = 0;
    let totalQuestions = 0;

    const processedGroups = practiceSession.questionGroups.map((group) => {
      const processedQuestions = (group.questions || []).map((question) => {
        totalQuestions++;
        const userAnswer = userAnswersMap.get(question._id.toString());
        const correctAnswer = question.gradingKey?.correctAnswer;
        const userAnswerContent = userAnswer ? userAnswer.content : null;

        const isCorrect = compareAnswers(
          userAnswerContent,
          correctAnswer,
          group.questionType
        );

        if (isCorrect) {
          totalCorrect++;
        }

        return {
          _id: question._id,
          content: question.content,
          userAnswer: userAnswerContent || "Not Answered",
          correctAnswer: correctAnswer || "N/A",
          isCorrect: isCorrect,
        };
      });

      return {
        _id: group._id,
        instruction: group.instruction,
        questionType: group.questionType,
        questions: processedQuestions,
      };
    });

    // 5. Build the Final Response
    const score =
      totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0;
    const finalResult = {
      id: practiceSession._id,
      submittedAt: practiceSession.ended_at || practiceSession.createdAt,
      totalCorrect,
      totalQuestions,
      score,
      groups: processedGroups,
    };

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error("--- CATCH BLOCK ERROR ---:", error);
    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid Session ID format." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
