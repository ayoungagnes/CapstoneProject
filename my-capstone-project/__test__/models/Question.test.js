import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Question } from '@/app/lib/models/Question';

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

describe('Question Model', () => {
  test('creates a valid Question', async () => {
    const questionData = {
      questionGroup: new mongoose.Types.ObjectId(),
      content: 'What is the capital of France?',
    };

    const question = await Question.create(questionData);

    expect(question).toBeDefined();
    expect(question.content).toBe('What is the capital of France?');
    expect(question.difficulty).toBe(1);
  });

  test('fails to create Question without required fields', async () => {
    let error;

    try {
      await Question.create({ content: 'Incomplete question' });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
    expect(error.errors.questionGroup).toBeDefined();
  });

  test('does not allow difficulty < 1 or > 5', async () => {
    const invalidData = {
      questionGroup: new mongoose.Types.ObjectId(),
      content: 'Invalid difficulty',
      difficulty: 6,
    };

    await expect(Question.create(invalidData)).rejects.toThrow(mongoose.Error.ValidationError);
  });
});
