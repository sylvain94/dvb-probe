const probeModel = require('../models/probe.model');
const streamModel = require('../models/stream.model');
const analysisModel = require('../models/analysis.model');
const tsduckService = require('./tsduck.service');
const processService = require('./process.service');
const { logger } = require('../config');

class ProbeService {
  async getAll() {
    return await probeModel.findAll();
  }

  async getById(id) {
    return await probeModel.findById(id);
  }

  async create(probeData) {
    const probe = await probeModel.create(probeData);
    logger.info(`Probe created: ${probe.id} - ${probe.name}`);
    return probe;
  }

  async update(id, probeData) {
    const probe = await probeModel.update(id, probeData);
    if (probe) {
      logger.info(`Probe updated: ${id}`);
    }
    return probe;
  }

  async delete(id) {
    // Stop the probe if it is running
    const probe = await probeModel.findById(id);
    if (probe && probe.status === 'running') {
      await this.stop(id);
    }
    await probeModel.delete(id);
    logger.info(`Probe deleted: ${id}`);
  }

  async start(id) {
    const probe = await probeModel.findById(id);
    if (!probe) {
      throw new Error('Probe not found');
    }

    if (probe.status === 'running') {
      return { message: 'Probe already running', probe };
    }

    try {
      // Start the TSDuck process
      const processId = await processService.startProbe(probe);
      
      // Update the status - ensure no undefined values
      // Use snake_case for database column names
      // MariaDB expects datetime in format: 'YYYY-MM-DD HH:MM:SS'
      const now = new Date();
      const mysqlDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
      
      const updateData = {
        status: 'running',
        started_at: mysqlDateTime,
        process_id: processId != null ? processId : null, // Explicitly set to null if undefined
      };
      
      logger.info(`Updating probe ${id} with data:`, JSON.stringify(updateData));
      await probeModel.update(id, updateData);

      logger.info(`Probe started: ${id} (PID: ${processId})`);
      return { message: 'Probe started', probe: await probeModel.findById(id) };
    } catch (error) {
      logger.error(`Failed to start probe ${id}:`, error);
      
      // Save error log to database
      try {
        await probeModel.addLog(id, 'error', `Failed to start probe: ${error.message}`, {
          error: error.message,
          stack: error.stack,
        });
      } catch (logError) {
        logger.error('Error saving start error log to database:', logError);
      }
      
      await probeModel.update(id, {
        status: 'error',
        error: error.message || 'Unknown error',
      });
      throw error;
    }
  }

  async stop(id) {
    const probe = await probeModel.findById(id);
    if (!probe) {
      throw new Error('Probe not found');
    }

    if (probe.status !== 'running') {
      return { message: 'Probe not running', probe };
    }

    // Stop the process
    await processService.stopProbe(probe.processId);
    
    // Update the status
    const now = new Date();
    const mysqlDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
    await probeModel.update(id, {
      status: 'stopped',
      stopped_at: mysqlDateTime,
    });

    logger.info(`Probe stopped: ${id}`);
    return { message: 'Probe stopped', probe: await probeModel.findById(id) };
  }

  async getStatus(id) {
    const probe = await probeModel.findById(id);
    if (!probe) {
      throw new Error('Probe not found');
    }

    const isRunning = probe.status === 'running' && 
                     await processService.isProcessRunning(probe.processId);

    return {
      id: probe.id,
      status: isRunning ? 'running' : 'stopped',
      processId: probe.processId,
      startedAt: probe.startedAt,
      stoppedAt: probe.stoppedAt,
    };
  }

  async getLogs(id, options = {}) {
    return await probeModel.getLogs(id, options);
  }

  // Methods for the streams
  async getAllStreams() {
    return await streamModel.findAll();
  }

  async getStreamById(id) {
    return await streamModel.findById(id);
  }

  async createStream(streamData) {
    return await streamModel.create(streamData);
  }

  async updateStream(id, streamData) {
    return await streamModel.update(id, streamData);
  }

  async deleteStream(id) {
    return await streamModel.delete(id);
  }

  async getStreamStats(id) {
    const stream = await streamModel.findById(id);
    if (!stream) {
      throw new Error('Stream not found');
    }
    // TODO: Calculate the real statistics
    return {
      streamId: id,
      totalAnalyses: 0,
      lastAnalysis: null,
    };
  }

  // Methods for the analyses
  async getAllAnalyses(options = {}) {
    return await analysisModel.findAll(options);
  }

  async getAnalysisById(id) {
    return await analysisModel.findById(id);
  }

  async getAnalysesByProbeId(probeId, options = {}) {
    return await analysisModel.findByProbeId(probeId, options);
  }

  async getAnalysesByStreamId(streamId, options = {}) {
    return await analysisModel.findByStreamId(streamId, options);
  }

  async deleteAnalysis(id) {
    return await analysisModel.delete(id);
  }

  async getAnalysisReport(id) {
    const analysis = await analysisModel.findById(id);
    if (!analysis) {
      throw new Error('Analysis not found');
    }
    // TODO: Generate a detailed report
    return analysis;
  }
}

module.exports = new ProbeService();


