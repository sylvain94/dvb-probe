const probeModel = require('../models/probe.model');
const analysisModel = require('../models/analysis.model');
const alertModel = require('../models/alert.model');
const alertingService = require('./alerting.service');
const { logger } = require('../config');
const os = require('os');

class MonitoringService {
  async getSystemHealth() {
    const probes = await probeModel.findAll();
    const runningProbes = probes.filter(p => p.status === 'running').length;
    const totalProbes = probes.length;

    const memoryUsage = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
      percentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
    };

    const loadAvg = os.loadavg();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      probes: {
        total: totalProbes,
        running: runningProbes,
        stopped: totalProbes - runningProbes,
      },
      system: {
        memory: memoryUsage,
        loadAverage: loadAvg,
        uptime: os.uptime(),
      },
    };
  }

  async getSystemStats() {
    const probes = await probeModel.findAll();
    const analyses = await analysisModel.findAll({ limit: 1000 });
    
    const stats = {
      probes: {
        total: probes.length,
        byStatus: {},
      },
      analyses: {
        total: analyses.length,
        last24h: 0,
        last7d: 0,
      },
      system: {
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
        },
        cpu: {
          cores: os.cpus().length,
          loadAverage: os.loadavg(),
        },
        uptime: os.uptime(),
      },
    };

    // Statistics by status
    probes.forEach(probe => {
      stats.probes.byStatus[probe.status] = (stats.probes.byStatus[probe.status] || 0) + 1;
    });

    // Analyses of the last 24h and 7 days
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    analyses.forEach(analysis => {
      const timestamp = new Date(analysis.timestamp);
      if (timestamp >= last24h) {
        stats.analyses.last24h++;
      }
      if (timestamp >= last7d) {
        stats.analyses.last7d++;
      }
    });

    return stats;
  }

  async checkProbeHealth(probeId) {
    const probe = await probeModel.findById(probeId);
    if (!probe) {
      return { healthy: false, reason: 'Probe not found' };
    }

    if (probe.status === 'running') {
      // Check if the process is still active
      const processService = require('./process.service');
      const isRunning = await processService.isProcessRunning(probe.processId);
      
      if (!isRunning) {
        // The process has stopped unexpectedly
        await probeModel.update(probeId, {
          status: 'error',
          error: 'Process stopped unexpectedly',
        });
        
        await alertingService.createAlert({
          type: 'probe_crashed',
          probeId,
          severity: 'high',
          message: `The probe ${probe.name} stopped unexpectedly`,
        });

        return { healthy: false, reason: 'Process stopped' };
      }
    }

    return { healthy: true };
  }
}

module.exports = new MonitoringService();


