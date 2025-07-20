import { Schema, model, models } from "mongoose";

const AnswerSchema = new Schema(
  {
    practiceSession: {
      type: Schema.Types.ObjectId,
      ref: "PracticeSession",
      required: true,
      index: true,
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // Repurposed for objective questions only
    is_correct: {
      type: Boolean,
    },
    // Repurposed for the single, overall score (e.g., 1/0 for reading, 7.5 for writing)
    score: {
      type: Number,
    },
    // Repurposed for a brief, top-level feedback string
    feedback: {
      type: String,
    },
    submitted_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// THE KEY ADDITION: Link to the detailed feedback document
AnswerSchema.virtual("detailedFeedback", {
  ref: "WritingFeedback", // The new model we will create
  localField: "_id",
  foreignField: "answer",
  justOne: true, // Ensures it's a one-to-one link
});

AnswerSchema.set("toJSON", { virtuals: true });
AnswerSchema.set("toObject", { virtuals: true });

export const Answer = models.Answer || model("Answer", AnswerSchema);
