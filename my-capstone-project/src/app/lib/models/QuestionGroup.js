import { Schema, model, models } from 'mongoose';

const QuestionGroupSchema = new Schema({
  instruction: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    enum: ['fill_in_blank', 'match_paragraphs', 'mcq', 'short_answer', 'essay', 'true_false_ng'],
    required: true,
  },
  section: {
    type: String,
    enum: ['reading', 'writing'],
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  questionMaterial: {
    type: Schema.Types.ObjectId,
    ref: 'QuestionMaterial',
  },
}, { timestamps: true });

export const QuestionGroup = models.QuestionGroup || model('QuestionGroup', QuestionGroupSchema);
