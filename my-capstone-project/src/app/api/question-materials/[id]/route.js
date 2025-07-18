import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongoose";
import { QuestionMaterial } from "@/app/lib/models/QuestionMaterial";

/* GET /api/question-materials/:id */
export async function GET(_, { params }) {
  await connectToDatabase();
  const mat = await QuestionMaterial.findById(params.id).lean();

  if (!mat) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(mat);
}