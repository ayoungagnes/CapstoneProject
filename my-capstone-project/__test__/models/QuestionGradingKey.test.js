import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { QuestionGradingKey } from '@/app/lib/models/QuestionGradingKey';

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

describe('QuestionGradingKey Model', () => {
  test('creates a valid grading key', async () => {
    const gradingKey = await QuestionGradingKey.create({
      questionId: new mongoose.Types.ObjectId(),
      correctAnswer: 'B',
      scoringType: 'true_false',
    });

    expect(gradingKey).toBeDefined();
    expect(gradingKey.correctAnswer).toBe('B');
    expect(gradingKey.scoringType).toBe('true_false');
  });

  test('defaults scoringType to "exact"', async () => {
    const gradingKey = await QuestionGradingKey.create({
      questionId: new mongoose.Types.ObjectId(),
      correctAnswer: 'C',
    });

    expect(gradingKey.scoringType).toBe('exact');
  });

  test('fails without required fields', async () => {
    let error;
    try {
      await QuestionGradingKey.create({ correctAnswer: 'A' }); // missing questionId
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
    expect(error.errors.questionId).toBeDefined();
  });

  test('rejects invalid scoringType', async () => {
    await expect(
      QuestionGradingKey.create({
        questionId: new mongoose.Types.ObjectId(),
        correctAnswer: 'D',
        scoringType: 'essay', // ❌ not allowed
      })
    ).rejects.toThrow(mongoose.Error.ValidationError);
  });
});
