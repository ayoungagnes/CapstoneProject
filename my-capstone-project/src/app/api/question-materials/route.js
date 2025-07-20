import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongoose";
import { QuestionMaterial } from "@/app/lib/models/QuestionMaterial";

/**
 * GET handler
 * Fetches a paginated list of question materials.
 * Each material includes only card info (title, section, subtitle).
 */
export async function GET(req) {
  await connectToDatabase(); // Ensure database connection is established

  // Extract pagination parameters from query string, defaulting to page 1 and limit 20
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  // Fetch materials from the database, selecting only specific fields for listing
  const materials = await QuestionMaterial
    .find({}, "title section subtitle") // Only return selected fields
    .skip((page - 1) * limit)           // Skip documents for pagination
    .limit(limit)                       // Limit number of results per page
    .lean();                            // Return plain JS objects instead of Mongoose docs

  return NextResponse.json(materials);  // Send data as JSON response
}

/**
 * POST handler
 * Creates a new QuestionMaterial document in the database.
 */
export async function POST(request) {
  await connectToDatabase(); // Connect to the database

  // Parse the incoming JSON body
  const body = await request.json();
  const { type, section, subtitle, instruction, title, paragraphs } = body;

  // Validate required fields before proceeding
  if (!title || !paragraphs || !Array.isArray(paragraphs)) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  // Create and save the new material document
  const material = await QuestionMaterial.create({
    type,
    section,
    subtitle,
    instruction,
    title,
    paragraphs,
  });

  // Return the newly created material in the response
  return NextResponse.json(
    { message: "Material created.", material },
    { status: 201 } // Created
  );
}
