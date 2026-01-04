const healthcheckJob = require('./healthcheck.job');
const cleanupJob = require('./cleanup.job');
const watchdogJob = require('./watchdog.job');
const { env } = require('../config');

function startJobs() {
  // Healthcheck every minute
  healthcheckJob.start();

  // Cleanup every hour
  cleanupJob.start();

  // Watchdog every 30 seconds
  watchdogJob.start();
}

module.exports = {
  startJobs,
};


