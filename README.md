# Inventory Service

Stock management microservice with real-time inventory tracking, reservations, and event-driven updates.

## Features
- Real-time stock tracking
- Stock reservation system
- Inventory change logs
- Low stock alerts via EventBridge
- Reorder level management

## API Endpoints
- `POST /api/inventory` - Create inventory
- `GET /api/inventory` - Get all inventory
- `GET /api/inventory/:productId` - Get inventory by product
- `POST /api/inventory/:productId/reserve` - Reserve stock
- `POST /api/inventory/:productId/release` - Release reserved stock
- `POST /api/inventory/:productId/confirm-sale` - Confirm sale
- `GET /api/inventory/:productId/logs` - Get inventory logs

## Setup
```bash
npm install
npm run prisma:generate
npm run migrate
npm run dev
```
