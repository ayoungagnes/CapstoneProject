import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongoose";
import { Question } from "@/app/lib/models/Question";
import { QuestionGradingKey } from "@/app/lib/models/QuestionGradingKey";

export async function GET() {
  await connectToDatabase();
  const questions = await Question.find().populate("questionGroup").lean();
  return NextResponse.json(questions);
}

export async function POST(req) {
  await connectToDatabase();
  const { questionGroup, content, difficulty, correctAnswer, scoringType } =
    await req.json();

  if (!questionGroup || !content) {
    return NextResponse.json(
      { error: "Missing questionGroup or content" },
      { status: 400 }
    );
  }

  const question = await Question.create({
    questionGroup,
    content,
    difficulty: difficulty ?? 1,
  });

  if (correctAnswer) {
    await QuestionGradingKey.create({
      questionId: question._id,
      correctAnswer,
      scoringType: scoringType || "exact",
    });
  }

  return NextResponse.json(
    { message: "Question created", question },
    { status: 201 }
  );
}
