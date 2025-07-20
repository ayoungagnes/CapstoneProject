import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { WritingFeedback } from '@/app/lib/models/WritingFeedback';

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

describe('WritingFeedback Model', () => {
  test('creates a valid feedback entry', async () => {
    const feedback = await WritingFeedback.create({
      answer: new mongoose.Types.ObjectId(),
      feedbackDetails: {
        taskAchievement: {
          score: 7,
          feedback: 'You addressed all parts of the task.',
        },
        coherenceAndCohesion: {
          score: 6.5,
          feedback: 'Good paragraphing.',
        },
      },
    });

    expect(feedback).toBeDefined();
    expect(feedback.feedbackDetails.taskAchievement.score).toBe(7);
    expect(feedback.feedbackDetails.coherenceAndCohesion.feedback).toBe('Good paragraphing.');
  });

  test('fails without required fields', async () => {
    let error;
    try {
      await WritingFeedback.create({});
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
    expect(error.errors.answer).toBeDefined();
    expect(error.errors.feedbackDetails).toBeDefined();
  });

  test('accepts arbitrary nested structure in feedbackDetails', async () => {
    const feedback = await WritingFeedback.create({
      answer: new mongoose.Types.ObjectId(),
      feedbackDetails: {
        grammar: {
          issues: ['tense', 'articles'],
          notes: 'Watch your past tense.',
        },
        lexical: 'Great vocabulary!',
      },
    });

    expect(feedback.feedbackDetails.grammar.issues).toContain('tense');
    expect(feedback.feedbackDetails.lexical).toBe('Great vocabulary!');
  });
});
