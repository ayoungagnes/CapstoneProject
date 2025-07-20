import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/app/lib/mongoose";
import { QuestionMaterial } from "@/app/lib/models/QuestionMaterial";
import { QuestionGroup } from "@/app/lib/models/QuestionGroup";
import { Question } from "@/app/lib/models/Question";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;

    const material = await QuestionMaterial.findById(id).lean();
    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    const groups = await QuestionGroup.find({ questionMaterial: id }).sort("order").lean();
    const groupIds = groups.map((g) => g._id);
    const questions = await Question.find({ questionGroup: { $in: groupIds } }).lean();

    const grouped = groups.map((group) => ({
      ...group,
      questions: questions.filter(
        (q) => q.questionGroup.toString() === group._id.toString()
      ),
    }));

    const serializedMaterial = JSON.parse(JSON.stringify(material));
    const serializedGroups = JSON.parse(JSON.stringify(grouped));
    
    return NextResponse.json({
      material: serializedMaterial,
      groups: serializedGroups,
    });

  } catch (error) {
    console.error("Failed to fetch reading material:", error);
    if (error.name === "CastError") {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}