import { Schema, model, models } from 'mongoose';

const QuestionSchema = new Schema({
  questionGroup: {
    type: Schema.Types.ObjectId,
    ref: 'QuestionGroup',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  difficulty: {
    type: Number,
    default: 1,
    min: 1,
    max: 5,
  },
}, { timestamps: true });

export const Question = models.Question || model('Question', QuestionSchema);
