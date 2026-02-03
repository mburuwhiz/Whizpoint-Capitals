const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

// Mock connectDB to avoid real connection attempts
jest.mock('../utils/db', () => jest.fn());

describe('Public Routes', () => {
  it('GET / should return 200', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Future of');
  });

  it('GET /about should return 200', async () => {
    const res = await request(app).get('/about');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('About Us');
  });
});
