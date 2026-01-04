const cron = require('node-cron');
const { logger } = require('../config');

class Scheduler {
  constructor() {
    this.jobs = new Map();
  }

  /**
   * Schedule a cron task
   */
  schedule(name, pattern, task) {
    if (this.jobs.has(name)) {
      this.cancel(name);
    }

    const job = cron.schedule(pattern, async () => {
      try {
        logger.info(`Execution of the scheduled task: ${name}`);
        await task();
      } catch (error) {
        logger.error(`Error in the scheduled task ${name}:`, error);
      }
    });

    this.jobs.set(name, job);
    logger.info(`Scheduled task: ${name} with the pattern ${pattern}`);
  }

  /**
   * Cancel a scheduled task
   */
  cancel(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      logger.info(`Task cancelled: ${name}`);
    }
  }

  /**
   * Cancel all tasks
   */
  cancelAll() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Task cancelled: ${name}`);
    });
    this.jobs.clear();
  }
}

module.exports = new Scheduler();


