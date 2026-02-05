const express = require('express');
const inventoryController = require('../controllers/inventory.controller');

const router = express.Router();

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Create inventory for a product
 *     tags: [Inventory]
 */
router.post('/', inventoryController.createInventory);

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 */
router.get('/', inventoryController.getAllInventory);

/**
 * @swagger
 * /api/inventory/{productId}:
 *   get:
 *     summary: Get inventory by product ID
 *     tags: [Inventory]
 */
router.get('/:productId', inventoryController.getInventory);

/**
 * @swagger
 * /api/inventory/{productId}/update:
 *   post:
 *     summary: Update stock (restock or adjust)
 *     tags: [Inventory]
 */
router.post('/:productId/update', inventoryController.updateStock);

/**
 * @swagger
 * /api/inventory/{productId}/reserve:
 *   post:
 *     summary: Reserve stock for an order
 *     tags: [Inventory]
 */
router.post('/:productId/reserve', inventoryController.reserveStock);

/**
 * @swagger
 * /api/inventory/{productId}/release:
 *   post:
 *     summary: Release reserved stock
 *     tags: [Inventory]
 */
router.post('/:productId/release', inventoryController.releaseStock);

/**
 * @swagger
 * /api/inventory/{productId}/confirm-sale:
 *   post:
 *     summary: Confirm sale and reduce stock
 *     tags: [Inventory]
 */
router.post('/:productId/confirm-sale', inventoryController.confirmSale);

/**
 * @swagger
 * /api/inventory/{productId}/logs:
 *   get:
 *     summary: Get inventory change logs
 *     tags: [Inventory]
 */
router.get('/:productId/logs', inventoryController.getInventoryLogs);


/**
 * @swagger
 * /api/inventory/test:
 *   post:
 *     summary: Test payload
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               test:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/test', (req, res) => {
  console.log('Received test payload:', req.body);
  res.status(200).json({ message: 'Test payload received', data: req.body });
});

module.exports = router;
