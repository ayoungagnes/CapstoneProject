import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Answer } from '@/app/lib/models/Answer';

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

test('creates a valid Answer document', async () => {
  const answerData = {
    practiceSession: new mongoose.Types.ObjectId(),
    question: new mongoose.Types.ObjectId(),
    user: new mongoose.Types.ObjectId(),
    content: 'This is my answer to the question.',
    is_correct: true,
    score: 8.0,
    feedback: 'Well written!',
  };

  const answer = await Answer.create(answerData);

  expect(answer).toBeDefined();
  expect(answer.content).toBe('This is my answer to the question.');
  expect(answer.is_correct).toBe(true);
  expect(answer.score).toBe(8.0);
  expect(answer.feedback).toBe('Well written!');
});

test('fails to create Answer without required fields', async () => {
  const incompleteData = {
    question: new mongoose.Types.ObjectId(),
    content: 'Missing user and session',
  };

  let error;
  try {
    await Answer.create(incompleteData);
  } catch (err) {
    error = err;
  }

  expect(error).toBeDefined();
  expect(error.name).toBe('ValidationError');
  expect(error.errors.user).toBeDefined();
  expect(error.errors.practiceSession).toBeDefined();
});
