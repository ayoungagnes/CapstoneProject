import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/app/lib/mongoose";
import { PracticeSession } from "@/app/lib/models/PracticeSession";
import { calculateSessionResults, compareAnswers } from "@/app/lib/practice/scoreUtils";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    const practiceSession = await PracticeSession.findById(id)
      .populate({
        path: "questionGroups",
        populate: { path: "questions", model: "Question" },
      })
      .populate("answers");

    if (!practiceSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (practiceSession.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access Forbidden" }, { status: 403 });
    }

    // Use the helper to get the score and totals
    const { totalCorrect, totalQuestions, score } = await calculateSessionResults(practiceSession);

    // Prepare detailed results for the response body
    const userAnswersMap = new Map(
      practiceSession.answers.map((answer) => [answer.question.toString(), answer])
    );

    const processedGroups = practiceSession.questionGroups.map((group) => ({
      _id: group._id,
      instruction: group.instruction,
      questionType: group.questionType,
      questions: (group.questions || []).map((question) => {
        const userAnswer = userAnswersMap.get(question._id.toString());
        const userAnswerContent = userAnswer ? userAnswer.content : null;
        const correctAnswer = question.gradingKey?.correctAnswer;
        return {
          _id: question._id,
          content: question.content,
          userAnswer: userAnswerContent || "Not Answered",
          correctAnswer: correctAnswer || "N/A",
          isCorrect: compareAnswers(userAnswerContent, correctAnswer, group.questionType),
        };
      }),
    }));

    const finalResult = {
      id: practiceSession._id,
      submittedAt: practiceSession.ended_at || practiceSession.createdAt,
      totalCorrect,
      totalQuestions,
      score,
      groups: processedGroups,
    };

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error("--- CATCH BLOCK ERROR ---:", error);
    if (error.name === "CastError") {
      return NextResponse.json({ error: "Invalid Session ID format." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    // 2. Find and delete the session
    // Crucially, we match both the session ID and the user ID to ensure
    // a user can only delete their own sessions.
    const deletedSession = await PracticeSession.findOneAndDelete({
      _id: id,
      user: session.user.id,
    });

    // 3. Validation
    if (!deletedSession) {
      // This occurs if the session doesn't exist or doesn't belong to the user
      return NextResponse.json(
        { error: "Session not found or access denied" },
        { status: 404 }
      );
    }

    // 4. Respond with success
    return NextResponse.json(
      { message: "Session deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting practice session:", error);
    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid Session ID format." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}