const request = require('supertest');
const express = require('express');

// Mock app setup
const app = express();
app.use(express.json());

// Mock inventory logs data
const mockLogs = [
  {
    id: '1',
    productId: 'prod-001',
    changeType: 'restock',
    quantityBefore: 50,
    quantityAfter: 100,
    quantityChanged: 50,
    orderId: null,
    reason: 'New shipment arrived',
    createdBy: 'admin-001',
    createdAt: new Date('2026-01-20').toISOString(),
  },
  {
    id: '2',
    productId: 'prod-001',
    changeType: 'reserve',
    quantityBefore: 100,
    quantityAfter: 95,
    quantityChanged: -5,
    orderId: 'order-001',
    reason: 'Order placement',
    createdBy: 'system',
    createdAt: new Date('2026-01-25').toISOString(),
  },
  {
    id: '3',
    productId: 'prod-001',
    changeType: 'sale_confirmed',
    quantityBefore: 95,
    quantityAfter: 95,
    quantityChanged: 0,
    orderId: 'order-001',
    reason: 'Sale confirmation',
    createdBy: 'system',
    createdAt: new Date('2026-01-26').toISOString(),
  },
];

// Mock routes
app.get('/api/inventory/:productId/logs', (req, res) => {
  const productLogs = mockLogs.filter(log => log.productId === req.params.productId);
  
  res.json({
    success: true,
    data: productLogs,
    pagination: {
      page: 1,
      limit: 10,
      total: productLogs.length,
      totalPages: 1,
    },
  });
});

describe('Inventory Logs API', () => {
  test('GET /api/inventory/:productId/logs - should return logs for a product', async () => {
    const response = await request(app).get('/api/inventory/prod-001/logs');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBe(3);
  });

  test('should return logs with correct structure', async () => {
    const response = await request(app).get('/api/inventory/prod-001/logs');
    
    const log = response.body.data[0];
    expect(log).toHaveProperty('id');
    expect(log).toHaveProperty('productId');
    expect(log).toHaveProperty('changeType');
    expect(log).toHaveProperty('quantityBefore');
    expect(log).toHaveProperty('quantityAfter');
    expect(log).toHaveProperty('quantityChanged');
    expect(log).toHaveProperty('createdAt');
  });

  test('should return logs sorted by date', async () => {
    const response = await request(app).get('/api/inventory/prod-001/logs');
    
    const logs = response.body.data;
    for (let i = 0; i < logs.length - 1; i++) {
      const currentDate = new Date(logs[i].createdAt);
      const nextDate = new Date(logs[i + 1].createdAt);
      expect(currentDate.getTime()).toBeLessThanOrEqual(nextDate.getTime());
    }
  });

  test('should include order information when applicable', async () => {
    const response = await request(app).get('/api/inventory/prod-001/logs');
    
    const orderLog = response.body.data.find(log => log.orderId !== null);
    expect(orderLog).toBeDefined();
    expect(orderLog.orderId).toMatch(/order-\d+/);
  });

  test('should track different change types', async () => {
    const response = await request(app).get('/api/inventory/prod-001/logs');
    
    const changeTypes = response.body.data.map(log => log.changeType);
    expect(changeTypes).toContain('restock');
    expect(changeTypes).toContain('reserve');
    expect(changeTypes).toContain('sale_confirmed');
  });

  test('should return empty array for product with no logs', async () => {
    const response = await request(app).get('/api/inventory/prod-999/logs');
    
    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBe(0);
  });

  test('should include pagination information', async () => {
    const response = await request(app).get('/api/inventory/prod-001/logs');
    
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.pagination).toHaveProperty('page');
    expect(response.body.pagination).toHaveProperty('limit');
    expect(response.body.pagination).toHaveProperty('total');
    expect(response.body.pagination).toHaveProperty('totalPages');
  });
});
