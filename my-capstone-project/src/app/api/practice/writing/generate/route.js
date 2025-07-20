import { NextResponse } from "next/server";
import { openai } from "@/app/lib/openai";
import { connectToDatabase } from "@/app/lib/mongoose";
import { QuestionGroup } from "@/app/lib/models/QuestionGroup";
import { Question } from "@/app/lib/models/Question";
import { getServerSession } from "next-auth/next";

// This prompt tells the AI exactly what kind of IELTS question to generate
// and how to format the result. It ensures we get structured JSON output.
const generationPrompt = `
  You are an expert IELTS test creator. Your task is to generate a new, original IELTS Writing Task 2 question.

  The question should be on a common IELTS topic such as technology, environment, education, or society.

  Please provide the output in a JSON object with two keys:
  1. "instruction": A brief instruction for the user.
  2. "content": The full essay question itself.

  Example:
  {
    "instruction": "You should spend about 40 minutes on this task. Write about the following topic:",
    "content": "Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?"
  }
`;

export async function POST() {
  try {
    // 1. Connect to MongoDB before performing any DB operations
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Use OpenAI to generate a writing task using the structured prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14", // Use a cost-efficient model that supports JSON formatting
      messages: [{ role: "system", content: generationPrompt }],
      response_format: { type: "json_object" }, // Ensures OpenAI responds with strict JSON
    });

    // 3. Extract and parse the AI response
    const aiResponse = response.choices[0].message.content;
    const task = JSON.parse(aiResponse); // `task` will have `instruction` and `content`

    // 4. Save the generated instruction as a new QuestionGroup in DB
    const newQuestionGroup = new QuestionGroup({
      instruction: task.instruction,
      questionType: "essay", // This marks the type of writing task
      section: "writing",
    });
    const savedGroup = await newQuestionGroup.save();

    // 5. Save the question itself under that group
    const newQuestion = new Question({
      questionGroup: savedGroup._id,
      content: task.content,
      maxScore: 9, // IELTS writing is typically scored out of 9
    });
    const savedQuestion = await newQuestion.save();

    // 6. Return the saved result to the client
    return NextResponse.json({
      message: "Writing task generated successfully!",
      questionGroup: savedGroup,
      question: savedQuestion,
    });
  } catch (error) {
    // Catch any errors (e.g. OpenAI failure, DB issues) and return 500
    console.error("Error generating writing task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
