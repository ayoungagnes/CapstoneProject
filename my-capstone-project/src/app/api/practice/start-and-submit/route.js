import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/app/lib/mongoose";
import { PracticeSession } from "@/app/lib/models/PracticeSession";
import { Answer } from "@/app/lib/models/Answer";
import { Question } from "@/app/lib/models/Question";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { questionId, answerContent } = await request.json();

    if (!questionId || !answerContent) {
      return NextResponse.json(
        { error: "Question ID and answer content are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Step 1: Create the PracticeSession
    const newPracticeSession = new PracticeSession({
      user: session.user.id,
      // Find the question to get its parent group
      questionGroups: [(await Question.findById(questionId)).questionGroup],
      ended_at: new Date(), // Session ends immediately upon submission
    });
    await newPracticeSession.save();

    // Step 2: Create the Answer document
    const newAnswer = new Answer({
      practiceSession: newPracticeSession._id,
      question: questionId,
      user: session.user.id,
      content: answerContent,
      // Score and feedback will be populated by the grading service
    });
    await newAnswer.save();

    // Step 3: Trigger AI grading asynchronously (fire-and-forget)
    // We don't 'await' this call. The frontend doesn't need to wait for grading to complete.
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/practice/writing/grade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answerId: newAnswer._id }),
    });

    // Return the new session so the user can be redirected to the results page
    return NextResponse.json({
      message: "Session submitted for grading.",
      sessionId: newPracticeSession._id,
    });
  } catch (error) {
    console.error("Error starting and submitting session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}