import { Schema, model, models } from 'mongoose';

const PracticeSessionSchema = new Schema({
  // Corresponds to the 'starts' relationship.
  // We name it 'user' for clarity when populating.
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assumes your User model is named 'User'
    required: true,
    index: true, // Indexing is good for performance when querying by user.
  },
  // The ERD's `started_at` and `ended_at` fields.
  started_at: {
    type: Date,
    default: Date.now,
  },
  ended_at: {
    type: Date, // This is set when the user completes the session.
  },
}, {
  // Adds createdAt and updatedAt timestamps automatically.
  timestamps: true,
});

// Defines the one-to-many 'includes' relationship virtually.
// This allows you to populate all answers for a session without storing them here.
// The 'Answer' schema below will contain the actual reference to the PracticeSession.
PracticeSessionSchema.virtual("answers", {
  ref: "Answer", // The model to use for population
  localField: "_id", // Find documents in the 'Answer' collection...
  foreignField: "practiceSession", // ...where the 'practiceSession' field matches this session's '_id'.
});

// Ensure virtual fields are included when converting to JSON or a plain object.
PracticeSessionSchema.set("toJSON", { virtuals: true });
PracticeSessionSchema.set("toObject", { virtuals: true });

export const PracticeSession = models.PracticeSession || model('PracticeSession', PracticeSessionSchema);