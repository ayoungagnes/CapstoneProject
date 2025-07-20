import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { registerUser } from '@/app/lib/services/userService';

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

test('registers a new user', async () => {
  const user = await registerUser({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'securepass',
  });

  expect(user.email).toBe('jane@example.com');
});