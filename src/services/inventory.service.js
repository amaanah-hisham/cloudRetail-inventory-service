const prisma = require('../config/database');
const logger = require('../utils/logger');
const { publishEvent } = require('../utils/eventBridge');

class InventoryService {
  async createInventory(data) {
    try {
      const inventory = await prisma.inventory.create({
        data: {
          ...data,
          availableQty: data.quantity,
        },
      });

      await this.logInventoryChange({
        productId: inventory.productId,
        productSku: inventory.productSku,
        changeType: 'INITIAL',
        quantity: inventory.quantity,
        previousQty: 0,
        newQty: inventory.quantity,
        reason: 'Initial stock',
      });

      logger.info(`Inventory created for product: ${inventory.productId}`);
      return inventory;
    } catch (error) {
      logger.error('Error creating inventory:', error);
      throw error;
    }
  }

  async getInventoryByProductId(productId) {
    try {
      return await prisma.inventory.findUnique({
        where: { productId },
      });
    } catch (error) {
      logger.error('Error fetching inventory:', error);
      throw error;
    }
  }

  async getAllInventory(filters = {}) {
    try {
      const { page = 1, limit = 20, lowStock } = filters;
      const skip = (page - 1) * limit;
      const where = {};

      if (lowStock === 'true') {
        where.availableQty = { lte: prisma.inventory.fields.reorderLevel };
      }

      const [items, total] = await Promise.all([
        prisma.inventory.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.inventory.count({ where }),
      ]);

      return {
        items,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching all inventory:', error);
      throw error;
    }
  }

  async updateStock(productId, quantity, changeType, orderId = null, reason = null) {
    try {
      const inventory = await this.getInventoryByProductId(productId);
      if (!inventory) {
        throw new Error('Inventory not found');
      }

      const previousQty = inventory.quantity;
      let newQty;

      // Normalize changeType to lowercase for comparison
      const normalizedChangeType = changeType?.toLowerCase();

      // For adjustment, set to exact quantity; for restock, add to existing
      if (normalizedChangeType === 'adjustment') {
        newQty = quantity; // Set to exact value
        logger.info(`Adjustment: Setting quantity from ${previousQty} to ${quantity}`);
      } else {
        newQty = inventory.quantity + quantity; // Add to existing
        logger.info(`${changeType}: Adding ${quantity} to ${previousQty} = ${newQty}`);
      }

      if (newQty < 0) {
        throw new Error('Insufficient stock');
      }

      const updated = await prisma.inventory.update({
        where: { productId },
        data: {
          quantity: newQty,
          availableQty: newQty - inventory.reservedQty,
          ...((normalizedChangeType === 'restock') && { lastRestocked: new Date() }),
        },
      });

      await this.logInventoryChange({
        productId,
        productSku: inventory.productSku,
        changeType,
        quantity: Math.abs(quantity),
        previousQty,
        newQty,
        orderId,
        reason,
      });

      // Check if stock is low and publish event
      if (updated.availableQty <= updated.reorderLevel) {
        await publishEvent('inventory.low-stock', {
          productId,
          productSku: inventory.productSku,
          currentStock: updated.availableQty,
          reorderLevel: updated.reorderLevel,
        });
      }

      logger.info(`Stock updated for product ${productId}: ${previousQty} -> ${newQty}`);
      return updated;
    } catch (error) {
      logger.error('Error updating stock:', error);
      throw error;
    }
  }

  async reserveStock(productId, quantity, orderId) {
    try {
      const inventory = await this.getInventoryByProductId(productId);
      if (!inventory) {
        throw new Error('Inventory not found');
      }

      if (inventory.availableQty < quantity) {
        throw new Error('Insufficient available stock');
      }

      const updated = await prisma.inventory.update({
        where: { productId },
        data: {
          reservedQty: inventory.reservedQty + quantity,
          availableQty: inventory.availableQty - quantity,
        },
      });

      await this.logInventoryChange({
        productId,
        productSku: inventory.productSku,
        changeType: 'RESERVE',
        quantity,
        previousQty: inventory.availableQty,
        newQty: updated.availableQty,
        orderId,
        reason: 'Order placed',
      });

      logger.info(`Stock reserved for product ${productId}: ${quantity} units`);
      return updated;
    } catch (error) {
      logger.error('Error reserving stock:', error);
      throw error;
    }
  }

  async releaseReservedStock(productId, quantity, orderId) {
    try {
      const inventory = await this.getInventoryByProductId(productId);
      if (!inventory) {
        throw new Error('Inventory not found');
      }

      const updated = await prisma.inventory.update({
        where: { productId },
        data: {
          reservedQty: Math.max(0, inventory.reservedQty - quantity),
          availableQty: inventory.availableQty + quantity,
        },
      });

      await this.logInventoryChange({
        productId,
        productSku: inventory.productSku,
        changeType: 'RELEASE',
        quantity,
        previousQty: inventory.availableQty - quantity,
        newQty: updated.availableQty,
        orderId,
        reason: 'Order cancelled/failed',
      });

      logger.info(`Stock released for product ${productId}: ${quantity} units`);
      return updated;
    } catch (error) {
      logger.error('Error releasing stock:', error);
      throw error;
    }
  }

  async confirmSale(productId, quantity, orderId) {
    try {
      const inventory = await this.getInventoryByProductId(productId);
      if (!inventory) {
        throw new Error('Inventory not found');
      }

      const updated = await prisma.inventory.update({
        where: { productId },
        data: {
          quantity: inventory.quantity - quantity,
          reservedQty: Math.max(0, inventory.reservedQty - quantity),
        },
      });

      await this.logInventoryChange({
        productId,
        productSku: inventory.productSku,
        changeType: 'SALE',
        quantity,
        previousQty: inventory.quantity,
        newQty: updated.quantity,
        orderId,
        reason: 'Order completed',
      });

      await publishEvent('inventory.stock-updated', {
        productId,
        productSku: inventory.productSku,
        quantity: updated.quantity,
        availableQty: updated.availableQty,
      });

      logger.info(`Sale confirmed for product ${productId}: ${quantity} units`);
      return updated;
    } catch (error) {
      logger.error('Error confirming sale:', error);
      throw error;
    }
  }

  async logInventoryChange(logData) {
    try {
      await prisma.inventoryLog.create({ data: logData });
    } catch (error) {
      logger.error('Error logging inventory change:', error);
    }
  }

  async getInventoryLogs(productId, filters = {}) {
    try {
      const { page = 1, limit = 50 } = filters;
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        prisma.inventoryLog.findMany({
          where: { productId },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.inventoryLog.count({ where: { productId } }),
      ]);

      return { logs, pagination: { total, page: parseInt(page), limit: parseInt(limit) } };
    } catch (error) {
      logger.error('Error fetching inventory logs:', error);
      throw error;
    }
  }
}

module.exports = new InventoryService();
