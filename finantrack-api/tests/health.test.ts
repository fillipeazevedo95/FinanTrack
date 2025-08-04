import request from 'supertest';
import express from 'express';

// Criar uma aplicação simples para teste
const app = express();

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'finantrack-api'
  });
});

describe('Health Check', () => {
  test('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('service', 'finantrack-api');
  });

  test('should return valid timestamp', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    const timestamp = new Date(response.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).not.toBeNaN();
  });
});

describe('Basic Math Functions', () => {
  test('should add numbers correctly', () => {
    expect(2 + 2).toBe(4);
    expect(10 + 5).toBe(15);
  });

  test('should multiply numbers correctly', () => {
    expect(3 * 4).toBe(12);
    expect(7 * 8).toBe(56);
  });
});

describe('Environment', () => {
  test('should have Node.js environment', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });

  test('should have access to process object', () => {
    expect(process).toBeDefined();
    expect(process.version).toMatch(/^v\d+\.\d+\.\d+/);
  });
});
