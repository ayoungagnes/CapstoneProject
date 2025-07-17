import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongoose";
import { QuestionGradingKey } from "@/app/lib/models/QuestionGradingKey";

export async function GET() {
  await connectToDatabase();
  const keys = await QuestionGradingKey.find().populate("questionId").lean();
  return NextResponse.json(keys);
}

export async function POST(req) {
  await connectToDatabase();
  const { questionId, correctAnswer, scoringType } = await req.json();

  if (!questionId || !correctAnswer) {
    return NextResponse.json(
      { error: "Missing questionId or correctAnswer" },
      { status: 400 }
    );
  }

  const gradingKey = await QuestionGradingKey.create({
    questionId,
    correctAnswer,
    scoringType: scoringType || "exact",
  });

  return NextResponse.json(
    { message: "Grading key created", gradingKey },
    { status: 201 }
  );
}
