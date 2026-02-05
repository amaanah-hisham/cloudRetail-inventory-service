const inventoryService = require('../services/inventory.service');

class InventoryController {
  async createInventory(req, res, next) {
    try {
      const inventory = await inventoryService.createInventory(req.body);
      res.status(201).json({ success: true, data: inventory });
    } catch (error) {
      next(error);
    }
  }

  async getInventory(req, res, next) {
    try {
      const inventory = await inventoryService.getInventoryByProductId(req.params.productId);
      if (!inventory) {
        return res.status(404).json({ success: false, message: 'Inventory not found' });
      }
      res.json({ success: true, data: inventory });
    } catch (error) {
      next(error);
    }
  }

  async getAllInventory(req, res, next) {
    try {
      const result = await inventoryService.getAllInventory(req.query);
      res.json({ success: true, data: result.items, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async updateStock(req, res, next) {
    try {
      const { productId } = req.params;
      const { quantity, changeType, orderId, reason } = req.body;
      const inventory = await inventoryService.updateStock(productId, quantity, changeType, orderId, reason);
      res.json({ success: true, message: 'Stock updated successfully', data: inventory });
    } catch (error) {
      next(error);
    }
  }

  async reserveStock(req, res, next) {
    try {
      const { productId } = req.params;
      const { quantity, orderId } = req.body;
      const inventory = await inventoryService.reserveStock(productId, quantity, orderId);
      res.json({ success: true, message: 'Stock reserved successfully', data: inventory });
    } catch (error) {
      next(error);
    }
  }

  async releaseStock(req, res, next) {
    try {
      const { productId } = req.params;
      const { quantity, orderId } = req.body;
      const inventory = await inventoryService.releaseReservedStock(productId, quantity, orderId);
      res.json({ success: true, message: 'Stock released successfully', data: inventory });
    } catch (error) {
      next(error);
    }
  }

  async confirmSale(req, res, next) {
    try {
      const { productId } = req.params;
      const { quantity, orderId } = req.body;
      const inventory = await inventoryService.confirmSale(productId, quantity, orderId);
      res.json({ success: true, message: 'Sale confirmed successfully', data: inventory });
    } catch (error) {
      next(error);
    }
  }

  async getInventoryLogs(req, res, next) {
    try {
      const { productId } = req.params;
      const result = await inventoryService.getInventoryLogs(productId, req.query);
      res.json({ success: true, data: result.logs, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryController();
