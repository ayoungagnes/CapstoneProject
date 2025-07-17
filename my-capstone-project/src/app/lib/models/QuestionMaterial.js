import { Schema, model, models } from 'mongoose';

const ParagraphSchema = new Schema({
  label: { type: String, required: true },       // e.g., "A", "B", "C", etc.
  content: { type: String, required: true },     // markdown or HTML-safe
});

const QuestionMaterialSchema = new Schema({
  type: {
    type: String,
    enum: ['text', 'audio', 'image'],
    required: true,
    default: 'text',
  },
  section: { type: String },                     // e.g., "Part 1"
  subtitle: { type: String },                    // e.g., "Reading Passage 1"
  instruction: { type: String },                 // "You should spend about 20 minutes..."
  title: { type: String, required: true },       // e.g., "Money Transfers by Mobile"
  paragraphs: [ParagraphSchema],                 // Array of labeled sections
}, { timestamps: true });

export const QuestionMaterial = models.QuestionMaterial || model('QuestionMaterial', QuestionMaterialSchema);
