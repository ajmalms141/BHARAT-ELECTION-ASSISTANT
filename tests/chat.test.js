/**
 * @fileoverview Integration tests for the Chat API.
 * Tests all endpoints of the Bharat Election Assistant backend
 * using Jest and Supertest.
 */

'use strict';

const request = require('supertest');

// Set a mock API key for testing so the app starts without error
process.env.GEMINI_API_KEY = 'test-api-key-for-testing';
process.env.NODE_ENV = 'test';

const app = require('../server');

describe('GET /api/health', () => {
  it('should return 200 with service status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'Bharat Election Assistant');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('POST /api/chat — Input Validation', () => {
  it('should return 400 when message is missing', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({})
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 when message is an empty string', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: '' })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 when message exceeds 2000 characters', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'a'.repeat(2001) })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 when message is a number (not a string)', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 12345 })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 when history role is invalid', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({
        message: 'How do I vote?',
        history: [{ role: 'invalid_role', parts: [{ text: 'Hello' }] }],
      })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/unknown — 404 Handler', () => {
  it('should return 404 for unknown API routes', async () => {
    const res = await request(app).get('/api/unknown-endpoint');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('Security Headers', () => {
  it('should include X-Content-Type-Options header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should include X-Frame-Options header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-frame-options']).toBeDefined();
  });

  it('should not expose X-Powered-By header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
