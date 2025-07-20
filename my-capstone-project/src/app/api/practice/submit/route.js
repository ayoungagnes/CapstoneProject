import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/app/lib/mongoose";
import { PracticeSession } from "@/app/lib/models/PracticeSession";
import { Answer } from "@/app/lib/models/Answer";
import { QuestionGradingKey } from "@/app/lib/models/QuestionGradingKey";

export async function POST(req) {
  await connectToDatabase();

  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }
    const userId = session.user.id || session.user._id || session.user.sub;
    if (!userId) {
      return NextResponse.json(
        { message: "User ID not found in session" },
        { status: 400 }
      );
    }

    const { userAnswers, questionGroupIds } = await req.json();

    if (
      !questionGroupIds ||
      !Array.isArray(questionGroupIds) ||
      questionGroupIds.length === 0
    ) {
      return NextResponse.json(
        { message: "Question Group IDs are missing or invalid." },
        { status: 400 }
      );
    }

    if (!userAnswers) {
      return NextResponse.json(
        { message: "userAnswers object is missing." },
        { status: 400 }
      );
    }

    const practiceSession = await PracticeSession.create({
      user: userId,
      questionGroups: questionGroupIds,
    });

    const answerProcessingPromises = Object.entries(userAnswers).map(
      async ([questionId, userAnswerContent]) => {
        if (!userAnswerContent || userAnswerContent.trim() === "") {
          return null;
        }

        const gradingKey = await QuestionGradingKey.findOne({
          question: questionId,
        });

        let isCorrect = false;
        let score = 0;
        let feedback = "Answer not found or grading key is missing.";

        if (gradingKey) {
          if (
            gradingKey.correct_answer.toLowerCase() ===
            userAnswerContent.toLowerCase()
          ) {
            isCorrect = true;
            score = 1;
            feedback = "Correct!";
          } else {
            feedback = `The correct answer is: ${gradingKey.correct_answer}`;
          }
        }

        return Answer.create({
          practiceSession: practiceSession._id,
          question: questionId,
          user: userId,
          content: userAnswerContent,
          is_correct: isCorrect,
          score: score,
          feedback: feedback,
        });
      }
    );

    await Promise.all(answerProcessingPromises.filter((p) => p !== null));

    practiceSession.ended_at = new Date();
    await practiceSession.save();

    return NextResponse.json(
      {
        message: "Practice Session submitted successfully!",
        sessionId: practiceSession._id.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting practice session:", error);
    return NextResponse.json(
      { message: "Failed to submit session." },
      { status: 500 }
    );
  }
}
