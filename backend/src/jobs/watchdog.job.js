const scheduler = require('../utils/scheduler');
const processService = require('../services/process.service');
const probeModel = require('../models/probe.model');
const { logger } = require('../config');

function start() {
  // Execute every 30 seconds
  scheduler.schedule('watchdog', '*/30 * * * * *', async () => {
    try {
      const probes = await probeModel.findAll();
      
      for (const probe of probes) {
        if (probe.status === 'running') {
          // Check if the process is still active
          const isRunning = await processService.isProcessRunning(probe.processId);
          
          if (!isRunning) {
            logger.warn(`The process of the probe ${probe.id} is no longer active, updating the status`);
            await probeModel.update(probe.id, {
              status: 'error',
              error: 'Process stopped unexpectedly',
              stoppedAt: new Date().toISOString(),
            });

            // Create an alert
            const alertingService = require('../services/alerting.service');
            await alertingService.createAlert({
              type: 'probe_crashed',
              probeId: probe.id,
              severity: 'high',
              message: `The probe ${probe.name} stopped unexpectedly`,
            });
          }
        }
      }
    } catch (error) {
      logger.error('Error in the watchdog:', error);
    }
  });
}

module.exports = {
  start,
};


