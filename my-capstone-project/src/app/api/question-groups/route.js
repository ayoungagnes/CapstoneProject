import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongoose";
import { QuestionGroup } from "@/app/lib/models/QuestionGroup";
import { Question } from "@/app/lib/models/Question";
import { QuestionGradingKey } from "@/app/lib/models/QuestionGradingKey";

export async function GET() {
  await connectToDatabase();
  const groups = await QuestionGroup.find().populate("questionMaterial").lean();
  return NextResponse.json(groups);
}

export async function POST(req) {
  await connectToDatabase();
  const body = await req.json();

  const {
    instruction,
    questionType,
    section,
    order,
    questionMaterial,
    questions, // array of: { content, correctAnswer, scoringType, difficulty }
  } = body;

  if (!instruction || !questionMaterial || !Array.isArray(questions)) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const group = await QuestionGroup.create({
    instruction,
    questionType,
    section,
    order,
    questionMaterial,
  });

  const createdQuestions = [];

  for (const q of questions) {
    const question = await Question.create({
      questionGroup: group._id,
      content: q.content,
      difficulty: q.difficulty ?? 1,
    });

    if (q.correctAnswer) {
      await QuestionGradingKey.create({
        questionId: question._id,
        correctAnswer: q.correctAnswer,
        scoringType: q.scoringType || "exact", // or 'keyword', 'boolean', etc.
      });
    }

    createdQuestions.push(question);
  }

  return NextResponse.json(
    {
      message: "Created group with questions",
      group,
      questions: createdQuestions,
    },
    { status: 201 }
  );
}
