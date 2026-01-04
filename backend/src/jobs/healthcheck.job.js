const scheduler = require('../utils/scheduler');
const monitoringService = require('../services/monitoring.service');
const { logger } = require('../config');

function start() {
  // Execute every minute
  scheduler.schedule('healthcheck', '* * * * *', async () => {
    try {
      const health = await monitoringService.getSystemHealth();
      
      // Check if the system is healthy
      if (health.status !== 'healthy') {
        logger.warn('System in unhealthy state:', health);
      }

      // Check the health of each probe
      const probeModel = require('../models/probe.model');
      const probes = await probeModel.findAll();
      
      for (const probe of probes) {
        if (probe.status === 'running') {
          await monitoringService.checkProbeHealth(probe.id);
        }
      }
    } catch (error) {
      logger.error('Error in the healthcheck:', error);
    }
  });
}

module.exports = {
  start,
};


