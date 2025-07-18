// app/api/practice/results/[sessionId]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/app/lib/mongoose";
import { PracticeSession } from "@/app/lib/models/PracticeSession";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { sessionId } = params;

    // Find the practice session and populate all related data
    const practiceSession = await PracticeSession.findById(sessionId)
      .populate({
        path: "material",
        populate: {
          path: "paragraphs",
        },
      })
      .populate({
        path: "groups",
        populate: {
          path: "questions",
        },
      });

    if (!practiceSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Verify the session belongs to the current user
    if (practiceSession.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Process the results to compare user answers with correct answers
    const processedGroups = practiceSession.groups.map((group) => ({
      _id: group._id,
      instruction: group.instruction,
      questionType: group.questionType,
      questions: group.questions.map((question) => {
        const userAnswer = practiceSession.userAnswers.get(
          question._id.toString()
        );
        const correctAnswer = question.correctAnswer;

        // Compare answers (case-insensitive for text answers)
        let isCorrect = false;
        if (userAnswer && correctAnswer) {
          if (group.questionType === "true_false_ng") {
            isCorrect =
              userAnswer.toUpperCase() === correctAnswer.toUpperCase();
          } else {
            // For text answers, do case-insensitive comparison and trim whitespace
            isCorrect =
              userAnswer.trim().toLowerCase() ===
              correctAnswer.trim().toLowerCase();
          }
        }

        return {
          _id: question._id,
          content: question.content,
          correctAnswer: correctAnswer,
          userAnswer: userAnswer || null,
          isCorrect: isCorrect,
        };
      }),
    }));

    const results = {
      _id: practiceSession._id,
      material: {
        title: practiceSession.material.title,
        subtitle: practiceSession.material.subtitle,
        instruction: practiceSession.material.instruction,
        paragraphs: practiceSession.material.paragraphs,
      },
      groups: processedGroups,
      submittedAt: practiceSession.submittedAt,
      userId: practiceSession.userId,
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching practice results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
