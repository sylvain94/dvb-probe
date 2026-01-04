const systemService = require('../services/monitoring.service');
const tsduckService = require('../services/tsduck.service');
const { logger } = require('../config');
const os = require('os');

class SystemController {
  async getInfo(req, res, next) {
    try {
      const info = {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
        },
        cpu: os.cpus().length,
        hostname: os.hostname(),
      };
      res.json(info);
    } catch (error) {
      logger.error('Error while retrieving system information:', error);
      next(error);
    }
  }

  async getHealth(req, res, next) {
    try {
      const health = await systemService.getSystemHealth();
      res.json(health);
    } catch (error) {
      logger.error('Error while checking health:', error);
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await systemService.getSystemStats();
      res.json(stats);
    } catch (error) {
      logger.error('Error while retrieving stats:', error);
      next(error);
    }
  }

  async checkTsduck(req, res, next) {
    try {
      const available = await tsduckService.checkAvailability();
      let version = null;
      if (available) {
        try {
          version = await tsduckService.getVersion();
        } catch (error) {
          logger.warn('Could not get TSDuck version:', error.message);
        }
      }
      res.json({
        available,
        version,
        path: tsduckService.getPath(),
        container: process.env.TSDUCK_CONTAINER || 'dvb-probe-tsduck',
      });
    } catch (error) {
      logger.error('Error while checking TSDuck:', error);
      next(error);
    }
  }
}

module.exports = new SystemController();


