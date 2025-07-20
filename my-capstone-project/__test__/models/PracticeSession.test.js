import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PracticeSession } from '@/app/lib/models/PracticeSession';

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

test('creates a valid PracticeSession', async () => {
  const practiceSessionData = {
    user: new mongoose.Types.ObjectId(),
    questionGroups: [
      new mongoose.Types.ObjectId(),
      new mongoose.Types.ObjectId(),
    ],
    ended_at: new Date(),
  };

  const session = await PracticeSession.create(practiceSessionData);

  expect(session).toBeDefined();
  expect(session.user).toBeDefined();
  expect(session.questionGroups.length).toBe(2);
});

test('fails to create PracticeSession without required fields', async () => {
  const invalidData = {
    questionGroups: [new mongoose.Types.ObjectId()],
  };

  let error;
  try {
    await PracticeSession.create(invalidData);
  } catch (err) {
    error = err;
  }

  expect(error).toBeDefined();
  expect(error.name).toBe('ValidationError');
  expect(error.errors.user).toBeDefined();
});
