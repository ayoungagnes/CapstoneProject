import { Schema, model, models } from "mongoose";

const WritingFeedbackSchema = new Schema(
  {
    answer: {
      type: Schema.Types.ObjectId,
      ref: "Answer",
      required: true,
      unique: true, // Only one feedback document per answer
      index: true,
    },
    feedbackDetails: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

export const WritingFeedback =
  models.WritingFeedback || model("WritingFeedback", WritingFeedbackSchema);