const app = require('./app');
const { env, logger } = require('./config');
const { initializeStorage } = require('./storage');
const { startJobs } = require('./jobs');

async function startServer() {
  try {
    // Start the HTTP server first (so healthcheck can work)
    const server = app.listen(env.port, env.host, () => {
      logger.info(`HTTP server started on http://${env.host}:${env.port}`);
      logger.info(`Environment: ${env.nodeEnv}`);
    });

    // Initialize the database (with retries) - non-blocking
    initializeStorage().then(() => {
      logger.info('Database initialized');
      // Start the background jobs after DB is ready
      logger.info('Starting background jobs...');
      startJobs();
      logger.info('Background jobs started');
    }).catch((error) => {
      logger.error('Error initializing services (server will continue):', error);
      // Server continues to run even if DB initialization fails
      // This allows healthcheck to work and diagnose the issue
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, graceful shutdown...');
      server.close(() => {
        logger.info('HTTP server stopped');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, graceful shutdown...');
      server.close(() => {
        logger.info('HTTP server stopped');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Error starting the server:', error);
    process.exit(1);
  }
}

startServer();
