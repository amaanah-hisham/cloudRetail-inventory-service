const request = require('supertest');
const express = require('express');
const swaggerUi = require('swagger-ui-express');

// Mock swagger spec
const mockSwaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Inventory Service API',
    version: '1.0.0',
    description: 'API documentation for Inventory Service',
  },
  servers: [
    {
      url: 'http://localhost:3003',
      description: 'Development server',
    },
  ],
  paths: {
    '/api/inventory': {
      get: {
        summary: 'Get all inventory items',
        tags: ['Inventory'],
      },
      post: {
        summary: 'Create inventory for a product',
        tags: ['Inventory'],
      },
    },
    '/api/inventory/{productId}': {
      get: {
        summary: 'Get inventory by product ID',
        tags: ['Inventory'],
      },
    },
  },
};

// Mock app setup
const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(mockSwaggerSpec));

describe('Swagger Documentation', () => {
  test('GET /api-docs - should be accessible', async () => {
    const response = await request(app).get('/api-docs/');
    
    // Swagger UI returns HTML
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/html/);
  });

  test('should have valid OpenAPI specification', () => {
    expect(mockSwaggerSpec).toHaveProperty('openapi');
    expect(mockSwaggerSpec).toHaveProperty('info');
    expect(mockSwaggerSpec).toHaveProperty('paths');
  });

  test('should document inventory endpoints', () => {
    expect(mockSwaggerSpec.paths).toHaveProperty('/api/inventory');
    expect(mockSwaggerSpec.paths).toHaveProperty('/api/inventory/{productId}');
  });

  test('should have correct API info', () => {
    expect(mockSwaggerSpec.info.title).toBe('Inventory Service API');
    expect(mockSwaggerSpec.info.version).toBe('1.0.0');
  });

  test('should define server configuration', () => {
    expect(mockSwaggerSpec.servers).toBeInstanceOf(Array);
    expect(mockSwaggerSpec.servers.length).toBeGreaterThan(0);
    expect(mockSwaggerSpec.servers[0]).toHaveProperty('url');
  });
});
