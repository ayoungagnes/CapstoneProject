import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongoose";
import { QuestionGradingKey } from "@/app/lib/models/QuestionGradingKey";

/**
 * GET handler
 * This fetches all grading keys from the database and returns them in JSON format.
 * Each grading key is populated with its related `questionId` so we can see which question it belongs to.
 */
export async function GET() {
  // Step 1: Ensure we are connected to MongoDB
  await connectToDatabase();

  // Step 2: Fetch all grading keys and populate the linked question details
  const keys = await QuestionGradingKey.find().populate("questionId").lean();

  // Step 3: Send the grading keys back as JSON
  return NextResponse.json(keys);
}

/**
 * POST handler
 * This creates a new grading key for a question, which defines the correct answer.
 */
export async function POST(req) {
  // Step 1: Connect to the database before creating anything
  await connectToDatabase();

  // Step 2: Parse JSON body from the request
  const { questionId, correctAnswer, scoringType } = await req.json();

  // Step 3: Basic validation — make sure we have the required fields
  if (!questionId || !correctAnswer) {
    return NextResponse.json(
      { error: "Missing questionId or correctAnswer" },
      { status: 400 } // Bad Request
    );
  }

  // Step 4: Create and save the grading key to the DB
  const gradingKey = await QuestionGradingKey.create({
    questionId,                      // The question this key belongs to
    correctAnswer,                   // The correct answer we want to store
    scoringType: scoringType || "exact", // Defaults to "exact" if not provided
  });

  // Step 5: Return the created key to the client
  return NextResponse.json(
    { message: "Grading key created", gradingKey },
    { status: 201 } // Created
  );
}
