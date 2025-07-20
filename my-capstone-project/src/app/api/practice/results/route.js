import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/app/lib/mongoose";
import { PracticeSession } from "@/app/lib/models/PracticeSession";
import { calculateSessionResults } from "@/app/lib/practice/scoreUtils";
import { Answer } from "@/app/lib/models/Answer";
import { QuestionGradingKey } from "@/app/lib/models/QuestionGradingKey";

export async function GET(request) {
  try {
    // 1. Authenticate the user using NextAuth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Connect to MongoDB
    await connectToDatabase();

    // 3. Parse query parameters from the request URL for pagination and sorting
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1; // current page (default: 1)
    const limit = parseInt(searchParams.get("limit")) || 10; // number of sessions per page
    const sortBy = searchParams.get("sortBy") || "createdAt"; // field to sort by
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1; // asc or desc order
    const skip = (page - 1) * limit; // how many to skip based on page

    // 4. Fetch paginated practice sessions for the logged-in user
    const sessions = await PracticeSession.find({ user: session.user.id })
      .populate({
        path: "questionGroups",
        populate: { path: "questions", model: "Question" },
      })
      .populate("answers")
      .sort({ [sortBy]: sortOrder }) // e.g., sort by createdAt descending
      .skip(skip) // skip to correct page
      .limit(limit); // limit number of sessions returned

    // 5. Count the total number of sessions for pagination metadata
    const totalCount = await PracticeSession.countDocuments({
      user: session.user.id,
    });

    // 6. For each session, calculate the score results and return simplified info
    const processedSessions = await Promise.all(
      sessions.map(async (sessionDoc) => {
        // Calculate band scores, correct answers, etc.
        const scoreResults = await calculateSessionResults(sessionDoc);

        // Convert from Mongoose document to plain JS object
        const sessionObj = sessionDoc.toObject();

        return {
          _id: sessionObj._id,
          started_at: sessionObj.started_at,
          ended_at: sessionObj.ended_at,
          createdAt: sessionObj.createdAt,
          updatedAt: sessionObj.updatedAt,
          totalQuestions: scoreResults.totalQuestions,
          score: scoreResults, // includes section scores, band scores, accuracy, etc.
          questionGroups: (sessionObj.questionGroups || []).map((group) => ({
            _id: group._id,
            instruction: group.instruction,
            questionType: group.questionType,
            section: group.section, // e.g., "reading", "writing"
          })),
        };
      })
    );

    // 7. Calculate pagination details
    const totalPages = Math.ceil(totalCount / limit);

    // 8. Return paginated result set and pagination metadata
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
    // 9. Handle unexpected errors
    console.error("Error fetching practice sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
