const streamService = require('../services/probe.service');
const { logger } = require('../config');

class StreamController {
  async getAll(req, res, next) {
    try {
      const streams = await streamService.getAllStreams();
      res.json(streams);
    } catch (error) {
      logger.error('Error while retrieving streams:', error);
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const stream = await streamService.getStreamById(id);
      if (!stream) {
        return res.status(404).json({ error: 'Stream not found' });
      }
      res.json(stream);
    } catch (error) {
      logger.error('Error while retrieving stream:', error);
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const streamData = req.body;
      const stream = await streamService.createStream(streamData);
      res.status(201).json(stream);
    } catch (error) {
      logger.error('Error while creating stream:', error);
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const streamData = req.body;
      const stream = await streamService.updateStream(id, streamData);
      if (!stream) {
        return res.status(404).json({ error: 'Stream not found' });
      }
      res.json(stream);
    } catch (error) {
      logger.error('Error while updating stream:', error);
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await streamService.deleteStream(id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error while deleting stream:', error);
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const { id } = req.params;
      const stats = await streamService.getStreamStats(id);
      res.json(stats);
    } catch (error) {
      logger.error('Error while retrieving stats:', error);
      next(error);
    }
  }
}

module.exports = new StreamController();


