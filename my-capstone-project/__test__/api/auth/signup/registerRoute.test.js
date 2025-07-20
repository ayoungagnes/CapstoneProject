import {POST} from "@/app/api/auth/signup/route"
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createMocks } from 'node-mocks-http';

jest.mock('@/app/lib/mongoose', () => ({
  connectToDatabase: jest.fn(),
}));

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

test('registers a user and returns 201', async () => {
  const { req } = createMocks({
    method: 'POST',
    body: {
      name: 'John',
      email: 'john@example.com',
      password: 'secret',
      goal_score: 90,
    },
  });

  req.json = async () => req.body;

  const response = await POST(req);
  const json = await response.json();

  expect(response.status).toBe(201);
  expect(json.message).toBe('User created');
});