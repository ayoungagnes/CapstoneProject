import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongoose";
import { QuestionGroup } from "@/app/lib/models/QuestionGroup";
import { Question } from "@/app/lib/models/Question";
import { QuestionGradingKey } from "@/app/lib/models/QuestionGradingKey";

/**
 * GET handler
 * This fetches all question groups, optionally filtered by a material ID.
 * Each group includes its linked material info and questions with grading keys.
 */
export async function GET(req) {
  await connectToDatabase();

  // Extract `material` query param from the URL, if provided
  const { searchParams } = new URL(req.url);
  const materialId = searchParams.get("material");

  // If materialId exists, filter by it. Otherwise, fetch all groups.
  const query = materialId ? { questionMaterial: materialId } : {};

  const groups = await QuestionGroup
    .find(query, "-__v")  // Exclude the `__v` internal version field
    .sort("order")        // Sort by order field (ascending)
    .populate({
      path: "questionMaterial",    // Populate associated material info
      select: "title subtitle",    // Only include title and subtitle
    })
    .populate({
      path: "questions",           // Populate the linked questions
      populate: {
        path: "gradingKey",        // Also populate each question's grading key
        select: "scoringType",     // Only include scoring type
      },
      select: "content questionGroup", // Only include these fields on question
    })
    .lean(); // Convert to plain JavaScript objects (faster and cleaner for API output)

  return NextResponse.json(groups);
}

/**
 * POST handler
 * This creates a new QuestionGroup with its questions and grading keys.
 */
export async function POST(req) {
  await connectToDatabase();

  // Parse JSON body from the request
  const body = await req.json();

  const {
    instruction,
    questionType,
    section,
    order,
    questionMaterial,
    questions,
  } = body;

  // Validate required fields
  if (!instruction || !questionMaterial || !Array.isArray(questions)) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Step 1: Create the QuestionGroup
  const group = await QuestionGroup.create({
    instruction,
    questionType,
    section,
    order,
    questionMaterial,
  });

  const createdQuestions = [];

  // Step 2: For each question in the request, create a Question and (optionally) a grading key
  for (const q of questions) {
    const question = await Question.create({
      questionGroup: group._id,   // Link this question to the newly created group
      content: q.content,         // The question text
      difficulty: q.difficulty ?? 1, // Default difficulty is 1 if not provided
    });

    // If a correct answer is provided, create a grading key for the question
    if (q.correctAnswer) {
      await QuestionGradingKey.create({
        questionId: question._id,
        correctAnswer: q.correctAnswer,
        scoringType: q.scoringType || "exact", // Default to "exact" if not specified
      });
    }

    createdQuestions.push(question);
  }

  // Step 3: Respond with the created group and questions
  return NextResponse.json(
    {
      message: "Created group with questions",
      group,
      questions: createdQuestions,
    },
    { status: 201 } // Created
  );
}
