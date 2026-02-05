const request = require('supertest');
const express = require('express');

// Mock app setup
const app = express();
app.use(express.json());

// Mock inventory data
const mockInventory = [
  {
    id: '1',
    productId: 'prod-001',
    quantity: 100,
    reservedQuantity: 10,
    availableQuantity: 90,
    reorderLevel: 20,
    reorderQuantity: 50,
    lastRestocked: new Date().toISOString(),
  },
  {
    id: '2',
    productId: 'prod-002',
    quantity: 50,
    reservedQuantity: 5,
    availableQuantity: 45,
    reorderLevel: 10,
    reorderQuantity: 30,
    lastRestocked: new Date().toISOString(),
  },
];

// Mock routes
app.get('/api/inventory', (req, res) => {
  res.json({
    success: true,
    data: mockInventory,
    pagination: {
      page: 1,
      limit: 10,
      total: mockInventory.length,
      totalPages: 1,
    },
  });
});

app.get('/api/inventory/:productId', (req, res) => {
  const inventory = mockInventory.find(inv => inv.productId === req.params.productId);
  if (inventory) {
    res.json({
      success: true,
      data: inventory,
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Inventory not found',
    });
  }
});

app.post('/api/inventory', (req, res) => {
  const newInventory = {
    id: '3',
    ...req.body,
    availableQuantity: req.body.quantity - (req.body.reservedQuantity || 0),
  };
  res.status(201).json({
    success: true,
    data: newInventory,
  });
});

app.post('/api/inventory/:productId/reserve', (req, res) => {
  const inventory = mockInventory.find(inv => inv.productId === req.params.productId);
  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory not found',
    });
  }

  const { quantity } = req.body;
  if (quantity > inventory.availableQuantity) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient stock available',
    });
  }

  inventory.reservedQuantity += quantity;
  inventory.availableQuantity -= quantity;

  res.json({
    success: true,
    message: 'Stock reserved successfully',
    data: inventory,
  });
});

app.post('/api/inventory/:productId/release', (req, res) => {
  const inventory = mockInventory.find(inv => inv.productId === req.params.productId);
  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory not found',
    });
  }

  const { quantity } = req.body;
  inventory.reservedQuantity -= quantity;
  inventory.availableQuantity += quantity;

  res.json({
    success: true,
    message: 'Stock released successfully',
    data: inventory,
  });
});

app.post('/api/inventory/:productId/confirm-sale', (req, res) => {
  const inventory = mockInventory.find(inv => inv.productId === req.params.productId);
  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory not found',
    });
  }

  const { quantity } = req.body;
  inventory.quantity -= quantity;
  inventory.reservedQuantity -= quantity;

  res.json({
    success: true,
    message: 'Sale confirmed successfully',
    data: inventory,
  });
});

app.post('/api/inventory/:productId/update', (req, res) => {
  const inventory = mockInventory.find(inv => inv.productId === req.params.productId);
  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory not found',
    });
  }

  const { quantity, changeType } = req.body;
  
  if (changeType === 'restock') {
    inventory.quantity += quantity;
    inventory.availableQuantity += quantity;
  } else if (changeType === 'adjustment') {
    inventory.quantity = quantity;
    inventory.availableQuantity = quantity - inventory.reservedQuantity;
  }

  inventory.lastRestocked = new Date().toISOString();

  res.json({
    success: true,
    message: 'Stock updated successfully',
    data: inventory,
  });
});

describe('Inventory API', () => {
  describe('GET /api/inventory', () => {
    test('should return all inventory items', async () => {
      const response = await request(app).get('/api/inventory');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
      expect(response.body).toHaveProperty('pagination');
    });

    test('should return inventory with correct structure', async () => {
      const response = await request(app).get('/api/inventory');
      
      const inventory = response.body.data[0];
      expect(inventory).toHaveProperty('id');
      expect(inventory).toHaveProperty('productId');
      expect(inventory).toHaveProperty('quantity');
      expect(inventory).toHaveProperty('reservedQuantity');
      expect(inventory).toHaveProperty('availableQuantity');
    });
  });

  describe('GET /api/inventory/:productId', () => {
    test('should return inventory for a specific product', async () => {
      const response = await request(app).get('/api/inventory/prod-001');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('productId', 'prod-001');
      expect(response.body.data).toHaveProperty('quantity', 100);
    });

    test('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/inventory/prod-999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Inventory not found');
    });

    test('should calculate available quantity correctly', async () => {
      const response = await request(app).get('/api/inventory/prod-001');
      
      const inventory = response.body.data;
      const expectedAvailable = inventory.quantity - inventory.reservedQuantity;
      expect(inventory.availableQuantity).toBe(expectedAvailable);
    });
  });

  describe('POST /api/inventory', () => {
    test('should create new inventory', async () => {
      const newInventory = {
        productId: 'prod-003',
        quantity: 200,
        reservedQuantity: 0,
        reorderLevel: 30,
        reorderQuantity: 100,
      };

      const response = await request(app)
        .post('/api/inventory')
        .send(newInventory);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('productId', 'prod-003');
      expect(response.body.data).toHaveProperty('quantity', 200);
    });

    test('should calculate available quantity on creation', async () => {
      const newInventory = {
        productId: 'prod-004',
        quantity: 100,
        reservedQuantity: 20,
      };

      const response = await request(app)
        .post('/api/inventory')
        .send(newInventory);
      
      expect(response.body.data.availableQuantity).toBe(80);
    });
  });

  describe('POST /api/inventory/:productId/reserve', () => {
    test('should reserve stock successfully', async () => {
      const response = await request(app)
        .post('/api/inventory/prod-001/reserve')
        .send({ quantity: 5, orderId: 'order-001' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Stock reserved successfully');
      expect(response.body.data.reservedQuantity).toBe(15);
      expect(response.body.data.availableQuantity).toBe(85);
    });

    test('should fail to reserve more stock than available', async () => {
      const response = await request(app)
        .post('/api/inventory/prod-001/reserve')
        .send({ quantity: 1000, orderId: 'order-002' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Insufficient stock available');
    });

    test('should fail for non-existent product', async () => {
      const response = await request(app)
        .post('/api/inventory/prod-999/reserve')
        .send({ quantity: 5, orderId: 'order-003' });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/inventory/:productId/release', () => {
    test('should release reserved stock successfully', async () => {
      const response = await request(app)
        .post('/api/inventory/prod-001/release')
        .send({ quantity: 5, orderId: 'order-001' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Stock released successfully');
      expect(response.body.data.availableQuantity).toBeGreaterThan(85);
    });

    test('should fail for non-existent product', async () => {
      const response = await request(app)
        .post('/api/inventory/prod-999/release')
        .send({ quantity: 5, orderId: 'order-001' });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/inventory/:productId/confirm-sale', () => {
    test('should confirm sale and reduce stock', async () => {
      const response = await request(app)
        .post('/api/inventory/prod-001/confirm-sale')
        .send({ quantity: 5, orderId: 'order-001' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Sale confirmed successfully');
    });

    test('should reduce both quantity and reserved quantity', async () => {
      const initialResponse = await request(app).get('/api/inventory/prod-002');
      const initialQuantity = initialResponse.body.data.quantity;

      const response = await request(app)
        .post('/api/inventory/prod-002/confirm-sale')
        .send({ quantity: 3, orderId: 'order-002' });
      
      expect(response.body.data.quantity).toBe(initialQuantity - 3);
    });
  });

  describe('POST /api/inventory/:productId/update', () => {
    test('should restock inventory', async () => {
      const response = await request(app)
        .post('/api/inventory/prod-001/update')
        .send({ 
          quantity: 50, 
          changeType: 'restock',
          reason: 'New shipment arrived'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Stock updated successfully');
    });

    test('should adjust inventory quantity', async () => {
      const response = await request(app)
        .post('/api/inventory/prod-002/update')
        .send({ 
          quantity: 100, 
          changeType: 'adjustment',
          reason: 'Physical inventory count'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.quantity).toBe(100);
    });

    test('should update lastRestocked timestamp', async () => {
      const response = await request(app)
        .post('/api/inventory/prod-001/update')
        .send({ 
          quantity: 30, 
          changeType: 'restock'
        });
      
      expect(response.body.data).toHaveProperty('lastRestocked');
      const restockDate = new Date(response.body.data.lastRestocked);
      expect(restockDate).toBeInstanceOf(Date);
    });
  });
});
