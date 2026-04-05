import { beforeAll, afterAll, describe, it, expect } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { connectDb, disconnectDb } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { ROLES, USER_STATUS } from '../src/constants/roles.js';

let mongoServer;
let app;
let adminToken;
let viewerToken;
let analystToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test-secret';
  process.env.NODE_ENV = 'test';
  process.env.ALLOW_PUBLIC_REGISTER = 'true';

  await connectDb(process.env.MONGODB_URI);

  const passwordHash = await User.hashPassword('Test1234!');
  await User.create({
    email: 'admin@test.com',
    passwordHash,
    name: 'Admin',
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
  });
  await User.create({
    email: 'viewer@test.com',
    passwordHash,
    name: 'Viewer',
    role: ROLES.VIEWER,
    status: USER_STATUS.ACTIVE,
  });
  await User.create({
    email: 'analyst@test.com',
    passwordHash,
    name: 'Analyst',
    role: ROLES.ANALYST,
    status: USER_STATUS.ACTIVE,
  });
  app = createApp();

  const login = async (email) => {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'Test1234!' });
    return res.body.token;
  };
  adminToken = await login('admin@test.com');
  viewerToken = await login('viewer@test.com');
  analystToken = await login('analyst@test.com');
}, 120000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await disconnectDb();
  if (mongoServer) await mongoServer.stop();
}, 60000);

describe('Auth', () => {
  it('rejects bad login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('registers when allowed', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'newuser@test.com',
      password: 'Test1234!',
      name: 'New',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('viewer');
  });
});

describe('RBAC', () => {
  it('viewer cannot list records', async () => {
    const res = await request(app).get('/api/records').set('Authorization', `Bearer ${viewerToken}`);
    expect(res.status).toBe(403);
  });

  it('viewer can read dashboard summary', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('netBalance');
  });

  it('analyst can list records but not create', async () => {
    const list = await request(app)
      .get('/api/records')
      .set('Authorization', `Bearer ${analystToken}`);
    expect(list.status).toBe(200);

    const create = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${analystToken}`)
      .send({
        amount: 10,
        type: 'expense',
        category: 'Test',
        date: new Date().toISOString(),
      });
    expect(create.status).toBe(403);
  });

  it('admin can create record', async () => {
    const res = await request(app)
      .post('/api/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        amount: 99.5,
        type: 'income',
        category: 'Bonus',
        date: new Date().toISOString(),
        notes: 'integration test',
      });
    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(99.5);
  });
});

describe('Validation', () => {
  it('returns 422 for invalid body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: '' });
    expect(res.status).toBe(422);
  });
});
