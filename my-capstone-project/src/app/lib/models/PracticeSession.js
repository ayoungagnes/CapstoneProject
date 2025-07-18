import { Schema, model, models } from "mongoose";

const PracticeSessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    questionGroups: [
      {
        type: Schema.Types.ObjectId,
        ref: "QuestionGroup",
        required: true,
      },
    ],

    started_at: {
      type: Date,
      default: Date.now,
    },
    ended_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

PracticeSessionSchema.virtual("answers", {
  ref: "Answer",
  localField: "_id",
  foreignField: "practiceSession",
});

PracticeSessionSchema.set("toJSON", { virtuals: true });
PracticeSessionSchema.set("toObject", { virtuals: true });

export const PracticeSession =
  models.PracticeSession || model("PracticeSession", PracticeSessionSchema);
