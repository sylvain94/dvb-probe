require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || '0.0.0.0',
  db: {
    type: process.env.DB_TYPE || 'mariadb',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dvb_probe',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  },
  logs: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || './logs',
  },
  monitoring: {
    healthcheckInterval: parseInt(process.env.HEALTHCHECK_INTERVAL, 10) || 60000,
    cleanupInterval: parseInt(process.env.CLEANUP_INTERVAL, 10) || 3600000,
    watchdogInterval: parseInt(process.env.WATCHDOG_INTERVAL, 10) || 30000,
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
    apiKey: process.env.API_KEY || 'change-me-in-production',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
};


