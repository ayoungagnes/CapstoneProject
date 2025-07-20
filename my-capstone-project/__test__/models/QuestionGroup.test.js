import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { QuestionGroup } from '@/app/lib/models/QuestionGroup';

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

describe('QuestionGroup Model', () => {
  test('creates a valid QuestionGroup', async () => {
    const data = {
      instruction: 'Match the paragraph to the statement.',
      questionType: 'match_paragraphs',
      section: 'reading',
    };

    const group = await QuestionGroup.create(data);

    expect(group).toBeDefined();
    expect(group.instruction).toBe(data.instruction);
    expect(group.order).toBe(0); // default value
    expect(group.section).toBe('reading');
  });

  test('fails when required fields are missing', async () => {
    let error;
    try {
      await QuestionGroup.create({}); // everything missing
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
    expect(error.errors.instruction).toBeDefined();
    expect(error.errors.questionType).toBeDefined();
    expect(error.errors.section).toBeDefined();
  });

  test('rejects invalid enum values', async () => {
    const data = {
      instruction: 'Invalid values test.',
      questionType: 'drag_and_drop', // ❌ not in enum
      section: 'listening', // ❌ not in enum
    };

    await expect(QuestionGroup.create(data)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  test('accepts optional questionMaterial field', async () => {
    const data = {
      instruction: 'Read the passage and answer the questions.',
      questionType: 'fill_in_blank',
      section: 'reading',
      questionMaterial: new mongoose.Types.ObjectId(),
    };

    const group = await QuestionGroup.create(data);

    expect(group.questionMaterial).toBeDefined();
    expect(mongoose.isValidObjectId(group.questionMaterial)).toBe(true);
  });
});
