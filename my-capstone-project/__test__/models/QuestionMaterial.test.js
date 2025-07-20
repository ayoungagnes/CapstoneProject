import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { QuestionMaterial } from '@/app/lib/models/QuestionMaterial';

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

describe('QuestionMaterial Model', () => {
  test('creates a valid QuestionMaterial with paragraphs', async () => {
    const material = await QuestionMaterial.create({
      title: 'Technology and Innovation',
      section: 'Part 2',
      subtitle: 'Reading Passage 2',
      instruction: 'Read the passage and answer the questions.',
      paragraphs: [
        { label: 'A', content: 'This is paragraph A.' },
        { label: 'B', content: 'This is paragraph B.' },
      ],
    });

    expect(material).toBeDefined();
    expect(material.title).toBe('Technology and Innovation');
    expect(material.type).toBe('text'); // default
    expect(material.paragraphs.length).toBe(2);
    expect(material.paragraphs[0].label).toBe('A');
  });

  test('fails when required title is missing', async () => {
    let error;

    try {
      await QuestionMaterial.create({
        section: 'Part 1',
        paragraphs: [{ label: 'A', content: 'No title here' }],
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
    expect(error.errors.title).toBeDefined();
  });

  test('rejects invalid type enum', async () => {
    const data = {
      title: 'Invalid Type Example',
      type: 'video',
    };

    await expect(QuestionMaterial.create(data)).rejects.toThrow(mongoose.Error.ValidationError);
  });

  test('allows empty paragraphs array', async () => {
    const material = await QuestionMaterial.create({
      title: 'Empty Paragraphs Test',
    });

    expect(material).toBeDefined();
    expect(material.paragraphs).toEqual([]);
  });
});
