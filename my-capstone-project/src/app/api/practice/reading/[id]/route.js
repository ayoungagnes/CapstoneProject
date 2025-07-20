import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/app/lib/mongoose";
import { QuestionMaterial } from "@/app/lib/models/QuestionMaterial";
import { QuestionGroup } from "@/app/lib/models/QuestionGroup";
import { Question } from "@/app/lib/models/Question";

export async function GET(request, { params }) {
  try {
    // Validate user session before continuing
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    // Fetch the question material by its ID
    const material = await QuestionMaterial.findById(id).lean();
    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Fetch all question groups linked to this material, ordered by the "order" field
    const groups = await QuestionGroup.find({ questionMaterial: id })
      .sort("order")
      .lean();

    // Get all questions that belong to these groups in a single query
    const groupIds = groups.map((g) => g._id);
    const questions = await Question.find({
      questionGroup: { $in: groupIds },
    }).lean();

    // Attach questions to their respective group (manual join)
    const grouped = groups.map((group) => ({
      ...group,
      questions: questions.filter(
        (q) => q.questionGroup.toString() === group._id.toString()
      ),
    }));

    // Serialize data to remove any non-JSON-safe values like ObjectId
    const serializedMaterial = JSON.parse(JSON.stringify(material));
    const serializedGroups = JSON.parse(JSON.stringify(grouped));

    // Return structured JSON response
    return NextResponse.json({
      material: serializedMaterial,
      groups: serializedGroups,
    });
  } catch (error) {
    console.error("Failed to fetch reading material:", error);

    // Handle invalid ObjectId error from Mongoose
    if (error.name === "CastError") {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
