// All imports remain the same
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
    // --- Authentication (No changes needed) ---
    const session = await getServerSession(authOptions);
    console.log("--- SESSION OBJECT ---:", session);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }
    const userId = session.user.id || session.user._id || session.user.sub;
     console.log("--- IDENTIFIED USER ID ---:", userId);
    if (!userId) {
      return NextResponse.json(
        { message: "User ID not found in session" },
        { status: 400 }
      );
    }

    // --- CHANGE 1: Update the expected request body ---
    // We now expect both the answers AND the structure of the test.
    const { userAnswers, questionGroupIds } = await req.json();

    // --- CHANGE 2: Add validation for the new required data ---
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

    // User can submit a blank test, so we don't need to validate userAnswers as strictly.
    if (!userAnswers) {
      return NextResponse.json(
        { message: "userAnswers object is missing." },
        { status: 400 }
      );
    }

    // --- CHANGE 3: Create the Practice Session with the new required field ---
    const practiceSession = await PracticeSession.create({
      user: userId,
      questionGroups: questionGroupIds, // <-- This is the new, crucial piece of data
    });

    // --- The rest of the logic remains the same! ---
    // It correctly handles the case where a user submits an empty set of answers.

    // --- Grade Each Answer Concurrently ---
    const answerProcessingPromises = Object.entries(userAnswers).map(
      async ([questionId, userAnswerContent]) => {
        // Don't create an answer for empty submissions
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

        // Create the Answer Document
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

    // We filter out any null promises from skipped questions
    await Promise.all(answerProcessingPromises.filter((p) => p !== null));

    // --- Finalize the Session ---
    practiceSession.ended_at = new Date();
    await practiceSession.save();

    // --- Send Response (No changes needed) ---
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
