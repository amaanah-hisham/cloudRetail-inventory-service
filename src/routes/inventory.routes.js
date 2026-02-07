const express = require('express');
const inventoryController = require('../controllers/inventory.controller');

const router = express.Router();

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Create inventory for a product
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               reorderLevel:
 *                 type: integer
 *               reorderQuantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Inventory created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/', inventoryController.createInventory);

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     responses:
 *       200:
 *         description: List of all inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Server error
 */
router.get('/', inventoryController.getAllInventory);

/**
 * @swagger
 * /api/inventory/{productId}:
 *   get:
 *     summary: Get inventory by product ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Inventory details
 *       404:
 *         description: Inventory not found
 *       500:
 *         description: Server error
 */
router.get('/:productId', inventoryController.getInventory);

/**
 * @swagger
 * /api/inventory/{productId}/update:
 *   post:
 *     summary: Update stock (restock or adjust)
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - type
 *             properties:
 *               quantity:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [restock, adjust]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Inventory not found
 *       500:
 *         description: Server error
 */
router.post('/:productId/update', inventoryController.updateStock);

/**
 * @swagger
 * /api/inventory/{productId}/reserve:
 *   post:
 *     summary: Reserve stock for an order
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - orderId
 *             properties:
 *               quantity:
 *                 type: integer
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock reserved successfully
 *       400:
 *         description: Insufficient stock
 *       404:
 *         description: Inventory not found
 *       500:
 *         description: Server error
 */
router.post('/:productId/reserve', inventoryController.reserveStock);

/**
 * @swagger
 * /api/inventory/{productId}/release:
 *   post:
 *     summary: Release reserved stock
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - orderId
 *             properties:
 *               quantity:
 *                 type: integer
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock released successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Inventory not found
 *       500:
 *         description: Server error
 */
router.post('/:productId/release', inventoryController.releaseStock);

/**
 * @swagger
 * /api/inventory/{productId}/confirm-sale:
 *   post:
 *     summary: Confirm sale and reduce stock
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - orderId
 *             properties:
 *               quantity:
 *                 type: integer
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sale confirmed and stock reduced
 *       400:
 *         description: Bad request
 *       404:
 *         description: Inventory not found
 *       500:
 *         description: Server error
 */
router.post('/:productId/confirm-sale', inventoryController.confirmSale);

/**
 * @swagger
 * /api/inventory/{productId}/logs:
 *   get:
 *     summary: Get inventory change logs
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of logs to retrieve
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset for pagination
 *     responses:
 *       200:
 *         description: List of inventory logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: Inventory not found
 *       500:
 *         description: Server error
 */
router.get('/:productId/logs', inventoryController.getInventoryLogs);

module.exports = router;
