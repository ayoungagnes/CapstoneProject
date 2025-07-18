import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongoose";
import { QuestionMaterial } from "@/app/lib/models/QuestionMaterial";

export async function GET(req) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const page  = parseInt(searchParams.get("page")  || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const materials = await QuestionMaterial
    .find({}, "title section subtitle")  // just card fields
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json(materials);
}

export async function POST(request) {
  await connectToDatabase();
  const body = await request.json();

  const { type, section, subtitle, instruction, title, paragraphs } = body;

  if (!title || !paragraphs || !Array.isArray(paragraphs)) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const material = await QuestionMaterial.create({
    type,
    section,
    subtitle,
    instruction,
    title,
    paragraphs,
  });

  return NextResponse.json(
    { message: "Material created.", material },
    { status: 201 }
  );
}
