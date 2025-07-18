// Step 1: Import NextResponse for sending responses
import { NextResponse } from "next/server";
// Step 2: Import your server-side authentication handler
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path if needed

import { connectToDatabase } from "@/app/lib/mongoose";
import { PracticeSession } from '@/app/lib/models/PracticeSession';
import { Answer } from '@/app/lib/models/Answer';
import { QuestionGradingKey } from '@/app/lib/models/QuestionGradingKey';

// Step 3: Export a named function for the HTTP method (POST, GET, etc.)
export async function POST(req) {
  // Note: There is no 'res' object anymore.

  await connectToDatabase();

  try {
    // --- Step 4: Get User and Payload (App Router way) ---
    // Use getServerSession with your authOptions for server-side auth
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Try different ways to get the user ID
    const userId = session.user.id || session.user._id || session.user.sub;
    
    if (!userId) {
      console.error("No user ID found in session:", session.user);
      return NextResponse.json({ message: 'User ID not found in session' }, { status: 400 });
    }

    // Get the request body using req.json()
    const { userAnswers } = await req.json();

    if (!userAnswers || Object.keys(userAnswers).length === 0) {
      return NextResponse.json({ message: 'No answers provided.' }, { status: 400 });
    }

    // --- Create a Practice Session ---
    const practiceSession = await PracticeSession.create({ user: userId });

    // --- Grade Each Answer Concurrently ---
    const answerProcessingPromises = Object.entries(userAnswers).map(async ([questionId, userAnswerContent]) => {
      const gradingKey = await QuestionGradingKey.findOne({ question: questionId });

      let isCorrect = false;
      let score = 0;
      let feedback = 'Answer not found or grading key is missing.';

      if (gradingKey) {
        if (gradingKey.correct_answer.toLowerCase() === userAnswerContent.toLowerCase()) {
          isCorrect = true;
          score = 1;
          feedback = 'Correct!';
        } else {
            feedback = `The correct answer is: ${gradingKey.correct_answer}`;
        }
      }

      // --- Create the Answer Document ---
      return Answer.create({
        practiceSession: practiceSession._id,
        question: questionId,
        user: userId,
        content: userAnswerContent,
        is_correct: isCorrect,
        score: score,
        feedback: feedback,
      });
    });

    await Promise.all(answerProcessingPromises);

    // --- Finalize the Session ---
    practiceSession.ended_at = new Date();
    await practiceSession.save();

    // --- Step 5: Send Response (App Router way) ---
    return NextResponse.json({
      message: 'Practice Session submitted successfully!',
      sessionId: practiceSession._id.toString()
    }, { status: 201 });

  } catch (error) {
    console.error("Error submitting practice session:", error);
    return NextResponse.json({ message: 'Failed to submit session.' }, { status: 500 });
  }
}