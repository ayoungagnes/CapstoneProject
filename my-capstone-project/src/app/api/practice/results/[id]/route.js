import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/app/lib/mongoose";
import { PracticeSession } from "@/app/lib/models/PracticeSession";
import {
  calculateSessionResults,
  compareAnswers,
} from "@/app/lib/practice/scoreUtils";
import { Question } from "@/app/lib/models/Question";
import { WritingFeedback } from "@/app/lib/models/WritingFeedback";

/**
 * GET /api/practice/results/[id]
 * Returns the detailed results of a single practice session for the logged-in user.
 */
export async function GET(request, { params }) {
  try {
    // 1. Check if user is logged in
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Connect to the database
    await connectToDatabase();
    const { id } = await params;

    // 3. Load the practice session by ID, and include all related data:
    // - questionGroups and their questions
    // - answers and their optional writing feedback
    const practiceSession = await PracticeSession.findById(id)
      .populate({
        path: "questionGroups",
        populate: {
          path: "questions",
          model: "Question",
        },
      })
      .populate({
        path: "answers",
        populate: {
          path: "detailedFeedback", // writing-specific feedback from AI or tutor
          model: WritingFeedback,
        },
      });

    // 4. Handle cases where the session is not found or belongs to another user
    if (!practiceSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (practiceSession.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access Forbidden" }, { status: 403 });
    }

    // 5. Compute overall band scores and section-level scores
    const scoreResults = await calculateSessionResults(practiceSession);

    // 6. Map answers by question ID for fast lookup when building the results
    const userAnswersMap = new Map(
      practiceSession.answers.map((answer) => [
        answer.question.toString(),
        answer,
      ])
    );

    // 7. Process each question group and prepare data for the frontend
    const processedGroups = [];
    for (const group of practiceSession.questionGroups) {
      const isWritingSection = group.section === "writing";

      // Only reading/listening questions need a gradingKey to check correctness
      if (!isWritingSection && group.questions?.length > 0) {
        await Question.populate(group.questions, { path: "gradingKey" });
      }

      // Process each question in the group
      const processedQuestions = (group.questions || []).map((question) => {
        const userAnswer = userAnswersMap.get(question._id.toString());

        const result = {
          _id: question._id,
          content: question.content,
          userAnswer: userAnswer?.content || "Not Answered",
          isWriting: isWritingSection,
        };

        if (isWritingSection) {
          // Writing answers include score and AI feedback
          result.score = userAnswer?.score || 0;
          result.maxScore = question.maxScore || 9;
          result.detailedFeedback =
            userAnswer?.detailedFeedback?.feedbackDetails || null;
        } else {
          // Reading/listening answers include correctness check
          const correctAnswer = question.gradingKey?.correctAnswer;
          result.correctAnswer = correctAnswer || "N/A";
          result.isCorrect = compareAnswers(
            userAnswer?.content,
            correctAnswer,
            group.questionType
          );
        }

        return result;
      });

      processedGroups.push({
        _id: group._id,
        instruction: group.instruction,
        questionType: group.questionType,
        questions: processedQuestions,
      });
    }

    // 8. Return all final result data back to the client
    const finalResult = {
      id: practiceSession._id,
      submittedAt: practiceSession.ended_at || practiceSession.createdAt,
      score: scoreResults,
      groups: processedGroups,
    };

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error("--- CATCH BLOCK ERROR ---:", error);

    // Handle common error types with appropriate HTTP status
    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid Session ID format." },
        { status: 400 }
      );
    }

    // Fallback for unexpected errors
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/practice/results/[id]
 * Deletes a practice session if it belongs to the logged-in user.
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    // Only delete if the session belongs to the user
    const deletedSession = await PracticeSession.findOneAndDelete({
      _id: id,
      user: session.user.id,
    });

    if (!deletedSession) {
      return NextResponse.json(
        { error: "Session not found or access denied" },
        { status: 404 }
      );
    }

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
