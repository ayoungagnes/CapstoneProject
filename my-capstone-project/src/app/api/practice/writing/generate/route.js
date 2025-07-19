import { NextResponse } from "next/server";
import { openai } from "@/app/lib/openai";
import { connectToDatabase } from "@/app/lib/mongoose";
import { QuestionGroup } from "@/app/lib/models/QuestionGroup";
import { Question } from "@/app/lib/models/Question";

// This is the "brain" of the generation. It's a carefully crafted prompt
// that tells the AI exactly what to do and what format to return.
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
  // Add authentication here if you want to restrict who can generate questions (recommended)
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.isAdmin) { // Example: only allow admins
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  try {
    await connectToDatabase();

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14", // Or another suitable model
      messages: [{ role: "system", content: generationPrompt }],
      // This is crucial for getting reliable JSON output
      response_format: { type: "json_object" },
    });

    const aiResponse = response.choices[0].message.content;
    const task = JSON.parse(aiResponse);

    // Now, save this generated task to your database
    const newQuestionGroup = new QuestionGroup({
      instruction: task.instruction,
      questionType: 'essay', // This is a writing task
      section: 'writing',
    });

    const savedGroup = await newQuestionGroup.save();

    const newQuestion = new Question({
      questionGroup: savedGroup._id,
      content: task.content,
      maxScore: 9, // Set the max score for IELTS writing
    });
    const savedQuestion = await newQuestion.save();

    return NextResponse.json({
      message: "Writing task generated successfully!",
      questionGroup: savedGroup,
      question: savedQuestion,
    });
  } catch (error) {
    console.error("Error generating writing task:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}