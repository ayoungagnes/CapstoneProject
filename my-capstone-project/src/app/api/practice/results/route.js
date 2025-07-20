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

    const sessions = await PracticeSession.find({ user: session.user.id })
      .populate({
        path: "questionGroups",
        populate: { path: "questions", model: "Question" },
      })
      .populate("answers")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalCount = await PracticeSession.countDocuments({
      user: session.user.id,
    });

    // Process each session asynchronously to calculate its rich score object
    const processedSessions = await Promise.all(
      sessions.map(async (sessionDoc) => {
        // Use our powerful helper on each session
        const scoreResults = await calculateSessionResults(sessionDoc);

        // Convert Mongoose doc to a plain object for modification
        const sessionObj = sessionDoc.toObject();

        return {
          _id: sessionObj._id,
          started_at: sessionObj.started_at,
          ended_at: sessionObj.ended_at,
          createdAt: sessionObj.createdAt,
          updatedAt: sessionObj.updatedAt,
          totalQuestions: scoreResults.totalQuestions,
          score: scoreResults,
          questionGroups: (sessionObj.questionGroups || []).map((group) => ({
            _id: group._id,
            instruction: group.instruction,
            questionType: group.questionType,
            section: group.section,
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
