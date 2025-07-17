import { Schema, model, models } from "mongoose";

const QuestionGradingKeySchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    scoringType: {
      type: String,
      enum: ["exact", "keyword", "true_false", "multiple_match", "manual"],
      default: "exact",
    },
  },
  { timestamps: true }
);

export const QuestionGradingKey =
  models.QuestionGradingKey ||
  model("QuestionGradingKey", QuestionGradingKeySchema);
