const analysisService = require('../services/probe.service');
const { logger } = require('../config');

class AnalysisController {
  async getAll(req, res, next) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const analyses = await analysisService.getAllAnalyses({ limit, offset });
      res.json(analyses);
    } catch (error) {
      logger.error('Error while retrieving analysis:', error);
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const analysis = await analysisService.getAnalysisById(id);
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }
      res.json(analysis);
    } catch (error) {
      logger.error('Error while retrieving analysis:', error);
      next(error);
    }
  }

  async getByProbeId(req, res, next) {
    try {
      const { probeId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const analyses = await analysisService.getAnalysesByProbeId(probeId, { limit, offset });
      res.json(analyses);
    } catch (error) {
      logger.error('Error while retrieving analyses:', error);
      next(error);
    }
  }

  async getByStreamId(req, res, next) {
    try {
      const { streamId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const analyses = await analysisService.getAnalysesByStreamId(streamId, { limit, offset });
      res.json(analyses);
    } catch (error) {
      logger.error('Error while retrieving analyses:', error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await analysisService.deleteAnalysis(id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error while deleting analysis:', error);
      next(error);
    }
  }

  async getReport(req, res, next) {
    try {
      const { id } = req.params;
      const report = await analysisService.getAnalysisReport(id);
      if (!report) {
        return res.status(404).json({ error: 'Analysis not found' });
      }
      res.json(report);
    } catch (error) {
      logger.error('Error while retrieving report:', error);
      next(error);
    }
  }
}

module.exports = new AnalysisController();


