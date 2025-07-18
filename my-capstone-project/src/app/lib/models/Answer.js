import { Schema, model, models } from 'mongoose';

const AnswerSchema = new Schema({
  // The practice session this answer is a part of.
  // This is the field used by the PracticeSession's virtual 'answers' property.
  practiceSession: {
    type: Schema.Types.ObjectId,
    ref: 'PracticeSession',
    required: true,
    index: true, // Good for quickly finding all answers for a session.
  },
  // The specific question being answered.
  question: {
    type: Schema.Types.ObjectId,
    ref: 'Question', // Assumes your Question model is named 'Question'
    required: true,
  },
  // The user who submitted the answer.
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // The actual content submitted by the user.
  content: {
    type: String,
    required: true,
  },
  // Fields to store grading results.
  is_correct: {
    type: Boolean,
  },
  score: {
    type: Number,
  },
  feedback: {
    type: String,
  },
  // Explicitly storing the submission time as per the ERD.
  submitted_at: {
    type: Date,
    default: Date.now,
  },
}, {
  // Adds createdAt and updatedAt timestamps. `updatedAt` is useful if
  // feedback is added or a score is adjusted later.
  timestamps: true,
});

export const Answer = models.Answer || model('Answer', AnswerSchema);