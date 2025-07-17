import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongoose";
import { QuestionMaterial } from "@/app/lib/models/QuestionMaterial";

export async function GET() {
  await connectToDatabase();

  const materials = await QuestionMaterial.find().lean();
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
