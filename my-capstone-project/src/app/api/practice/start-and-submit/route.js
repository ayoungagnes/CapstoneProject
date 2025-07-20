import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/app/lib/mongoose";
import { PracticeSession } from "@/app/lib/models/PracticeSession";
import { Answer } from "@/app/lib/models/Answer";
import { Question } from "@/app/lib/models/Question";

export async function POST(request) {
  // Step 0: Check if the user is logged in
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Step 1: Extract questionId and user's answer from the request body
    const { questionId, answerContent } = await request.json();

    // Step 2: Make sure both fields are provided
    if (!questionId || !answerContent) {
      return NextResponse.json(
        { error: "Question ID and answer content are required" },
        { status: 400 }
      );
    }

    // Step 3: Connect to the MongoDB database
    await connectToDatabase();

    // Step 4: Create a new PracticeSession document
    // This represents the session for this one question
    const newPracticeSession = new PracticeSession({
      user: session.user.id,
      questionGroups: [
        // Find the question and extract the group it belongs to
        (await Question.findById(questionId)).questionGroup,
      ],
      ended_at: new Date(), // We're ending the session immediately (one-shot session)
    });
    await newPracticeSession.save(); // Save the session to the database

    // Step 5: Create a new Answer document
    // This stores the user's written response
    const newAnswer = new Answer({
      practiceSession: newPracticeSession._id,
      question: questionId,
      user: session.user.id,
      content: answerContent,
      // Note: score and feedback will be added later by the grading API
    });
    await newAnswer.save(); // Save the answer to the database

    // Step 6: Trigger AI grading for the answer
    // We don't wait for it to finish – it happens in the background
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/practice/writing/grade`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answerId: newAnswer._id }),
    });

    // Step 7: Respond with the new session ID so the frontend can redirect the user
    return NextResponse.json({
      message: "Session submitted for grading.",
      sessionId: newPracticeSession._id,
    });
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error starting and submitting session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
