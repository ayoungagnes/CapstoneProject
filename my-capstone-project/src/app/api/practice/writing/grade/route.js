import { NextResponse } from "next/server";
import { openai } from "@/app/lib/openai";
import { connectToDatabase } from "@/app/lib/mongoose";
import { Answer } from "@/app/lib/models/Answer";
import { Question } from "@/app/lib/models/Question";
import { WritingFeedback } from "@/app/lib/models/WritingFeedback";

// This is an even more critical prompt. It defines the rubric for the AI.
const gradingSystemPrompt = `
  You are a highly experienced IELTS examiner. Your task is to grade a student's Writing Task 2 essay.

  You will be given the original essay question and the student's essay.

  You MUST evaluate the essay based on the four official IELTS criteria. For each criterion, provide a score from 1.0 to 9.0 (in 0.5 increments) and detailed, constructive feedback explaining why you gave that score.

  After evaluating the four criteria, provide an overall band score.

  Your final output MUST be a valid JSON object with the following structure:
  {
    "overallScore": 8.0,
    "summaryFeedback": "A very well-structured essay with strong arguments and a wide range of vocabulary. To improve, focus on using more complex grammatical structures.",
    "feedbackDetails": {
      "taskAchievement": { "score": 8.0, "feedback": "The response fully addresses all parts of the task. The position is clear and well-supported throughout." },
      "coherenceAndCohesion": { "score": 8.5, "feedback": "Information and ideas are logically organized. Paragraphing is effective and cohesive devices are used well." },
      "lexicalResource": { "score": 8.0, "feedback": "A wide range of vocabulary is used skillfully, with only very occasional, minor errors." },
      "grammaticalRangeAndAccuracy": { "score": 7.5, "feedback": "A variety of complex structures are used. While most sentences are error-free, there are some minor grammatical mistakes that do not impede communication." }
    }
  }
`;

export async function POST(request) {
  // Authentication is vital here
  // const session = await getServerSession(authOptions); ...

  try {
    const { answerId } = await request.json();
    if (!answerId) {
      return NextResponse.json({ error: "Answer ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Fetch the necessary data
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }
    const question = await Question.findById(answer.question);

    // 2. Construct the prompt for the AI
    const userPrompt = `
      Original Question: "${question.content}"
      ---
      Student's Essay: "${answer.content}"
    `;

    // 3. Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Use the latest, most capable model for best results
      messages: [
        { role: "system", content: gradingSystemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const aiResponse = response.choices[0].message.content;
    const grade = JSON.parse(aiResponse);

    // 4. Save the results to your database
    // A. Update the original Answer document with the summary
    answer.score = grade.overallScore;
    answer.feedback = grade.summaryFeedback;
    await answer.save();

    // B. Create the new, detailed WritingFeedback document
    await WritingFeedback.create({
      answer: answerId,
      feedbackDetails: grade.feedbackDetails,
    });

    return NextResponse.json({
      message: "Grading complete!",
      grade,
    });

  } catch (error) {
    console.error("Error grading writing task:", error);
    return NextResponse.json(
      { error: "Internal server error during grading" },
      { status: 500 }
    );
  }
}