const probeService = require('../services/probe.service');
const { logger } = require('../config');

class ProbeController {
  async getAll(req, res, next) {
    try {
      const probes = await probeService.getAll();
      res.json(probes);
    } catch (error) {
      logger.error('Error while retrieving probes:', error);
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const probe = await probeService.getById(id);
      if (!probe) {
        return res.status(404).json({ error: 'Probe not found' });
      }
      res.json(probe);
    } catch (error) {
      logger.error('Error while retrieving probe:', error);
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const probeData = req.body;
      const probe = await probeService.create(probeData);
      res.status(201).json(probe);
    } catch (error) {
      logger.error('Error while creating probe:', error);
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const probeData = req.body;
      const probe = await probeService.update(id, probeData);
      if (!probe) {
        return res.status(404).json({ error: 'Probe not found' });
      }
      res.json(probe);
    } catch (error) {
      logger.error('Error while updating probe:', error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await probeService.delete(id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error while deleting probe:', error);
      next(error);
    }
  }

  async start(req, res, next) {
    try {
      const { id } = req.params;
      const result = await probeService.start(id);
      res.json(result);
    } catch (error) {
      logger.error('Error while starting probe:', error);
      next(error);
    }
  }

  async stop(req, res, next) {
    try {
      const { id } = req.params;
      const result = await probeService.stop(id);
      res.json(result);
    } catch (error) {
      logger.error('Error while stopping probe:', error);
      next(error);
    }
  }

  async getStatus(req, res, next) {
    try {
      const { id } = req.params;
      const status = await probeService.getStatus(id);
      res.json(status);
    } catch (error) {
      logger.error('Error while retrieving status:', error);
      next(error);
    }
  }

  async getLogs(req, res, next) {
    try {
      const { id } = req.params;
      const { limit = 100, offset = 0 } = req.query;
      
      // Verify probe exists
      const probe = await probeService.getById(id);
      if (!probe) {
        return res.status(404).json({ error: 'Probe not found' });
      }
      
      const logs = await probeService.getLogs(id, { limit, offset });
      logger.debug(`Retrieved ${logs.length} logs for probe ${id}`);
      
      // Format logs for better readability
      const formattedLogs = logs.map(log => {
        let parsedData = null;
        if (log.data) {
          try {
            parsedData = typeof log.data === 'string' ? JSON.parse(log.data) : log.data;
          } catch (parseError) {
            logger.warn(`Error parsing log data for log ${log.id}:`, parseError);
            parsedData = log.data;
          }
        }
        
        return {
          id: log.id,
          level: log.level,
          message: log.message,
          data: parsedData,
          timestamp: log.timestamp,
        };
      });
      
      res.json({
        probeId: parseInt(id, 10),
        total: logs.length,
        logs: formattedLogs,
      });
    } catch (error) {
      logger.error('Error while retrieving logs:', error);
      next(error);
    }
  }

  async createTestLog(req, res, next) {
    try {
      const { id } = req.params;
      const { message = 'Test log message' } = req.body;
      
      // Verify probe exists
      const probe = await probeService.getById(id);
      if (!probe) {
        return res.status(404).json({ error: 'Probe not found' });
      }
      
      // Create a test log
      const probeModel = require('../models/probe.model');
      const logId = await probeModel.addLog(id, 'info', message, { test: true });
      
      logger.info(`Test log created for probe ${id} with ID: ${logId}`);
      res.json({
        success: true,
        message: 'Test log created',
        logId,
        probeId: parseInt(id, 10),
      });
    } catch (error) {
      logger.error('Error while creating test log:', error);
      next(error);
    }
  }
}

module.exports = new ProbeController();


