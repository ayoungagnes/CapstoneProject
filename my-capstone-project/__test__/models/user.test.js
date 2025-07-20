import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '@/app/lib/models/User';

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

test('creates a user and finds it by email', async () => {
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'secret123',
  };

  await User.create(userData);
  const found = await User.findOne({ email: 'test@example.com' });

  expect(found).not.toBeNull();
  expect(found.name).toBe('Test User');
});
