const request = require('supertest');
const express = require('express');

// Mock the app setup similar to index.js
const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'inventory-service',
    timestamp: new Date().toISOString(),
  });
});

describe('Health Check API', () => {
  test('GET /health - should return healthy status', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('service', 'inventory-service');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /health - should return status as string', async () => {
    const response = await request(app).get('/health');
    
    expect(typeof response.body.status).toBe('string');
    expect(response.body.status).toBe('healthy');
  });

  test('GET /health - should return ISO timestamp', async () => {
    const response = await request(app).get('/health');
    
    const timestamp = new Date(response.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.toString()).not.toBe('Invalid Date');
  });
});
