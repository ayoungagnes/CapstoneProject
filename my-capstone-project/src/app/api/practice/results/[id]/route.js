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
import { QuestionGradingKey } from "@/app/lib/models/QuestionGradingKey";
import { WritingFeedback } from "@/app/lib/models/WritingFeedback";
import { Answer } from "@/app/lib/models/Answer";
import { getReadingBandScore } from "@/app/lib/practice/ielts-bands";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    // Fetch the session and all its related data for display
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
          path: "detailedFeedback", // This is the virtual field on the Answer model
          model: WritingFeedback,
        },
      });

    if (!practiceSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (practiceSession.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Access Forbidden" }, { status: 403 });
    }

    // Call the fixed helper function to get a rich score object
    const scoreResults = await calculateSessionResults(practiceSession);

    // This logic is still needed to prepare the detailed question-by-question view
    const userAnswersMap = new Map(
      practiceSession.answers.map((answer) => [
        answer.question.toString(),
        answer,
      ])
    );

    const processedGroups = [];
    for (const group of practiceSession.questionGroups) {
      const isWritingSection = group.section === "writing";

      // Conditionally populate grading keys only for non-writing sections
      if (!isWritingSection && group.questions?.length > 0) {
        await Question.populate(group.questions, { path: "gradingKey" });
      }

      const processedQuestions = (group.questions || []).map((question) => {
        const userAnswer = userAnswersMap.get(question._id.toString());
        const result = {
          _id: question._id,
          content: question.content,
          userAnswer: userAnswer?.content || "Not Answered",
          isWriting: isWritingSection,
        };

        if (isWritingSection) {
          result.score = userAnswer?.score || 0;
          result.maxScore = question.maxScore || 9;
          result.detailedFeedback =
            userAnswer?.detailedFeedback?.feedbackDetails || null;
        } else {
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

    // The final result now contains the rich score object and the processed groups
    const finalResult = {
      id: practiceSession._id,
      submittedAt: practiceSession.ended_at || practiceSession.createdAt,
      score: scoreResults, // Pass the entire new results object
      groups: processedGroups, // Pass the detailed groups for the body
    };

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error("--- CATCH BLOCK ERROR ---:", error);
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
