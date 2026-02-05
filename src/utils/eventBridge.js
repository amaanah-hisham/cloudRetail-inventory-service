const AWS = require('aws-sdk');
const logger = require('./logger');

const eventBridgeConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
};

if (process.env.AWS_ENDPOINT) {
  eventBridgeConfig.endpoint = process.env.AWS_ENDPOINT;
  eventBridgeConfig.accessKeyId = 'test';
  eventBridgeConfig.secretAccessKey = 'test';
}

const eventBridge = new AWS.EventBridge(eventBridgeConfig);
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || 'ecommerce-events';

const publishEvent = async (detailType, detail) => {
  try {
    const params = {
      Entries: [
        {
          Source: 'inventory-service',
          DetailType: detailType,
          Detail: JSON.stringify(detail),
          EventBusName: EVENT_BUS_NAME,
        },
      ],
    };

    const result = await eventBridge.putEvents(params).promise();
    logger.info(`Event published: ${detailType}`, { result });
    return result;
  } catch (error) {
    logger.error('Error publishing event:', error);
    throw error;
  }
};

module.exports = { publishEvent };
