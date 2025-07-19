import { Schema, model, models } from "mongoose";

const WritingFeedbackSchema = new Schema(
  {
    // The link back to the specific answer being graded.
    answer: {
      type: Schema.Types.ObjectId,
      ref: "Answer",
      required: true,
      unique: true, // Only one feedback document per answer
      index: true,
    },
    // Using Schema.Types.Mixed allows you to store the raw,
    // flexible JSON object you get back from the AI service.
    // This is much better than a simple string.
    feedbackDetails: {
      type: Schema.Types.Mixed,
      required: true,
    },
    // Example structure of what you might store in feedbackDetails:
    // {
    //   taskAchievement: { score: 7.0, feedback: "You addressed all parts of the task..." },
    //   coherenceAndCohesion: { score: 6.5, feedback: "Your paragraphing was clear..." },
    //   lexicalResource: { score: 7.5, feedback: "You used a good range of vocabulary..." },
    //   grammaticalRangeAndAccuracy: { score: 7.0, feedback: "Your sentence structures were varied..." },
    // }
  },
  { timestamps: true }
);

export const WritingFeedback =
  models.WritingFeedback || model("WritingFeedback", WritingFeedbackSchema);