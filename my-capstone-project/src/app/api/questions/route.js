import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongoose";
import { Question } from "@/app/lib/models/Question";
import { QuestionGradingKey } from "@/app/lib/models/QuestionGradingKey";

/**
 * GET handler
 * Fetches all questions from the database.
 * Each question includes its associated question group info.
 */
export async function GET() {
  await connectToDatabase(); // Ensure the DB connection is active

  // Fetch all questions and populate the questionGroup reference field
  const questions = await Question.find().populate("questionGroup").lean();

  // Return the list of questions as JSON
  return NextResponse.json(questions);
}

/**
 * POST handler
 * Creates a new question, and optionally creates a grading key for it.
 */
export async function POST(req) {
  await connectToDatabase(); // Connect to the DB

  // Parse request body
  const {
    questionGroup,  // ID of the question group this question belongs to
    content,         // Text/content of the question
    difficulty,      // Optional difficulty level
    correctAnswer,   // Optional correct answer
    scoringType      // Optional grading method (default = "exact")
  } = await req.json();

  // Basic validation: content and group are required
  if (!questionGroup || !content) {
    return NextResponse.json(
      { error: "Missing questionGroup or content" },
      { status: 400 }
    );
  }

  // Create and store the new question
  const question = await Question.create({
    questionGroup,
    content,
    difficulty: difficulty ?? 1, // Default difficulty to 1 if not provided
  });

  // If a correct answer is provided, also create the grading key
  if (correctAnswer) {
    await QuestionGradingKey.create({
      questionId: question._id,     // Link the grading key to this question
      correctAnswer,
      scoringType: scoringType || "exact", // Use 'exact' scoring if not specified
    });
  }

  // Respond with the newly created question
  return NextResponse.json(
    { message: "Question created", question },
    { status: 201 } // Created
  );
}
