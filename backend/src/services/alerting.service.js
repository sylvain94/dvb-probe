const alertModel = require('../models/alert.model');
const { logger } = require('../config');

class AlertingService {
  async createAlert(alertData) {
    const alert = await alertModel.create({
      ...alertData,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    });

    logger.warn(`Alert created: ${alert.type} - ${alert.message}`);
    
    // TODO: Send notifications (email, webhook, etc.)
    
    return alert;
  }

  async getAllAlerts(options = {}) {
    return await alertModel.findAll(options);
  }

  async getUnacknowledgedAlerts() {
    return await alertModel.findUnacknowledged();
  }

  async acknowledgeAlert(id) {
    return await alertModel.update(id, { acknowledged: true });
  }

  async deleteAlert(id) {
    return await alertModel.delete(id);
  }

  async checkThresholds(probeId, metrics) {
    // TODO: Implement the threshold checking
    // For example: low bitrate, CRC errors, etc.
  }
}

module.exports = new AlertingService();


