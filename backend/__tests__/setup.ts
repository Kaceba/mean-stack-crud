import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export default async function globalSetup() {
  // Start in-memory MongoDB server for testing
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Store URI in global variable for tests to use
  (global as any).__MONGO_URI__ = uri;
  (global as any).__MONGO_SERVER__ = mongoServer;
}
