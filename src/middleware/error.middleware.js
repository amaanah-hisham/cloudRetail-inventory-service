const logger = require('../utils/logger');
const errorHandler = (err, req, res, next) => {
  logger.error(err.message);
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Server error' });
};
module.exports = { errorHandler };
