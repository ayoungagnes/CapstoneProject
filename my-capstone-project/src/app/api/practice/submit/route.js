import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/app/lib/mongoose";
import { PracticeSession } from "@/app/lib/models/PracticeSession";
import { Answer } from "@/app/lib/models/Answer";
import { QuestionGradingKey } from "@/app/lib/models/QuestionGradingKey";

export async function POST(req) {
  await connectToDatabase(); // Connect to MongoDB before doing anything

  try {
    // Step 1: Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Step 2: Extract user ID from session (supporting multiple formats for safety)
    const userId = session.user.id || session.user._id || session.user.sub;
    if (!userId) {
      return NextResponse.json(
        { message: "User ID not found in session" },
        { status: 400 }
      );
    }

    // Step 3: Parse request body
    const { userAnswers, questionGroupIds } = await req.json();

    // Validate that we got question group IDs
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

    // Validate that we received the user's answers
    if (!userAnswers) {
      return NextResponse.json(
        { message: "userAnswers object is missing." },
        { status: 400 }
      );
    }

    // Step 4: Create a new practice session record in the DB
    const practiceSession = await PracticeSession.create({
      user: userId,
      questionGroups: questionGroupIds,
    });

    // Step 5: Go through each answer the user submitted and evaluate it
    const answerProcessingPromises = Object.entries(userAnswers).map(
      async ([questionId, userAnswerContent]) => {
        // Skip empty answers
        if (!userAnswerContent || userAnswerContent.trim() === "") {
          return null;
        }

        // Try to find the grading key for the question
        const gradingKey = await QuestionGradingKey.findOne({
          question: questionId,
        });

        // Set default grading result
        let isCorrect = false;
        let score = 0;
        let feedback = "Answer not found or grading key is missing.";

        // If grading key is found, grade the answer
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

        // Save the graded answer to the DB
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

    // Step 6: Wait for all answer grading and saving to finish
    await Promise.all(answerProcessingPromises.filter((p) => p !== null));

    // Step 7: Mark the session as ended (we assume this is a single attempt)
    practiceSession.ended_at = new Date();
    await practiceSession.save();

    // Step 8: Respond with success
    return NextResponse.json(
      {
        message: "Practice Session submitted successfully!",
        sessionId: practiceSession._id.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    // Catch unexpected errors and respond with a 500
    console.error("Error submitting practice session:", error);
    return NextResponse.json(
      { message: "Failed to submit session." },
      { status: 500 }
    );
  }
}
