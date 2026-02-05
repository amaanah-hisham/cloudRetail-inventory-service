# Inventory Service - Test Suite

## Overview
This directory contains comprehensive Jest test cases for the Inventory Service, covering all major endpoints and functionality.

## Test Files

### 1. **health.test.js**
Tests the health check endpoint to ensure the service is running properly.

**Test Cases:**
- ✅ Returns healthy status with correct service name
- ✅ Validates response structure and data types
- ✅ Verifies ISO timestamp format

### 2. **inventory.test.js** (Main Test Suite)
Tests all inventory management endpoints and operations.

**Test Cases (32 total):**

#### GET /api/inventory
- ✅ Returns all inventory items with pagination
- ✅ Validates inventory data structure

#### GET /api/inventory/:productId
- ✅ Returns inventory for a specific product
- ✅ Returns 404 for non-existent products
- ✅ Calculates available quantity correctly (quantity - reserved)

#### POST /api/inventory
- ✅ Creates new inventory successfully
- ✅ Automatically calculates available quantity

#### POST /api/inventory/:productId/reserve
- ✅ Reserves stock successfully
- ✅ Fails when insufficient stock available
- ✅ Returns 404 for non-existent products
- ✅ Updates reserved and available quantities correctly

#### POST /api/inventory/:productId/release
- ✅ Releases reserved stock back to available
- ✅ Returns 404 for non-existent products

#### POST /api/inventory/:productId/confirm-sale
- ✅ Confirms sale and reduces stock
- ✅ Reduces both total quantity and reserved quantity

#### POST /api/inventory/:productId/update
- ✅ Restocks inventory (adds to existing quantity)
- ✅ Adjusts inventory (sets to specific quantity)
- ✅ Updates lastRestocked timestamp

### 3. **inventory-logs.test.js**
Tests the inventory change log tracking system.

**Test Cases:**
- ✅ Returns logs for a specific product
- ✅ Validates log structure (changeType, quantities, timestamps)
- ✅ Verifies logs are sorted by date
- ✅ Includes order information when applicable
- ✅ Tracks different change types (restock, reserve, sale_confirmed)
- ✅ Returns empty array for products with no logs
- ✅ Includes pagination information

### 4. **swagger.test.js**
Tests API documentation availability and structure.

**Test Cases:**
- ✅ Swagger UI is accessible at /api-docs
- ✅ Valid OpenAPI specification
- ✅ Documents all inventory endpoints
- ✅ Contains correct API metadata
- ✅ Defines server configuration

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test -- health.test.js
npm test -- inventory.test.js
npm test -- inventory-logs.test.js
npm test -- swagger.test.js
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

## Test Coverage Summary

The test suite includes:
- **32 passing tests** across 4 test files
- Coverage for all major API endpoints
- Edge case testing (404s, insufficient stock, etc.)
- Data validation and structure verification
- Business logic validation (stock calculations)

## Key Testing Patterns

### Mock Data
Tests use mock data to simulate realistic inventory scenarios:
- Products with varying stock levels
- Reserved vs. available quantities
- Change logs with different types

### Response Validation
All tests verify:
- HTTP status codes
- Response structure (`success`, `data`, `message`)
- Data types and required fields
- Business logic correctness

### Error Handling
Tests cover error scenarios:
- Non-existent resources (404)
- Insufficient stock (400)
- Invalid operations

## Future Test Enhancements

Consider adding:
- Integration tests with real database
- Performance tests for bulk operations
- Concurrent reservation tests (race conditions)
- Low stock alert tests
- Event publishing tests (EventBridge)

## Dependencies

- **jest**: Test framework
- **supertest**: HTTP assertions
- **express**: Mock server setup

## Notes

- Tests use mocked Express apps, not the actual service
- No database connection required for unit tests
- Tests are fast and can run in CI/CD pipelines
- Coverage reports generated in `coverage/` directory
