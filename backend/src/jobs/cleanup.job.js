const scheduler = require('../utils/scheduler');
const analysisModel = require('../models/analysis.model');
const alertModel = require('../models/alert.model');
const { logger } = require('../config');

function start() {
  // Execute every hour
  scheduler.schedule('cleanup', '0 * * * *', async () => {
    try {
      logger.info('Starting the cleanup...');

      // Delete old analyses (keep the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // TODO: Implement the deletion of old analyses
      // const deleted = await analysisModel.deleteOlderThan(thirtyDaysAgo);
      // logger.info(`Cleanup: ${deleted} analyses deleted`);

      // Delete old acknowledged alerts (keep the last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // TODO: Implement the deletion of old alerts
      // const deletedAlerts = await alertModel.deleteAcknowledgedOlderThan(sevenDaysAgo);
      // logger.info(`Cleanup: ${deletedAlerts} alerts deleted`);

      logger.info('Cleanup completed');
    } catch (error) {
      logger.error('Error in the cleanup:', error);
    }
  });
}

module.exports = {
  start,
};


