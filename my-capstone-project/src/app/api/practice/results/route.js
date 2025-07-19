import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/app/lib/mongoose";
import { PracticeSession } from "@/app/lib/models/PracticeSession";
import { calculateSessionResults } from "@/app/lib/practice/scoreUtils";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    // Fetch sessions and populate all data needed for the calculation
    const sessions = await PracticeSession.find({ user: session.user.id })
      .populate({
        path: "questionGroups",
        populate: { path: "questions", model: "Question" },
      })
      .populate("answers") // Ensure answers are populated
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await PracticeSession.countDocuments({ user: session.user.id });

    // Process each session asynchronously to calculate its score
    const processedSessions = await Promise.all(
      sessions.map(async (session) => {
        const { totalCorrect, totalQuestions, score } = await calculateSessionResults(session);
        return {
          _id: session._id,
          started_at: session.started_at,
          ended_at: session.ended_at,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          totalQuestions,
          correctAnswers: totalCorrect,
          score,
          questionGroups: (session.questionGroups || []).map((group) => ({
            _id: group._id,
            instruction: group.instruction,
            questionType: group.questionType,
          })),
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limit);

    const result = {
      sessions: processedSessions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        limit,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching practice sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}