const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const inventoryRoutes = require('./routes/inventory.routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'inventory-service',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/inventory', inventoryRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Inventory Service running on port ${PORT}`);
  logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
