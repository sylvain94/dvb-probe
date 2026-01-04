const mysql = require('mysql2/promise');
const { env } = require('../config');
const { logger } = require('../config');

// Create connection pool without database first (to create it if needed)
const adminPool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

// Create database if it doesn't exist
async function createDatabaseIfNotExists() {
  let retries = 5;
  let delay = 2000;
  
  while (retries > 0) {
    try {
      const connection = await adminPool.getConnection();
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${env.db.database}\``);
      connection.release();
      logger.info(`Database '${env.db.database}' verified/created`);
      return;
    } catch (error) {
      retries--;
      if (retries === 0) {
        logger.error('Error creating database after retries:', error);
        throw error;
      }
      logger.warn(`Failed to create database, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5; // Exponential backoff
    }
  }
}

// Create connection pool with database
const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test connection
async function testConnection() {
  let retries = 5;
  let delay = 2000;
  
  while (retries > 0) {
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      logger.info('MariaDB connection established');
      return true;
    } catch (error) {
      retries--;
      if (retries === 0) {
        logger.error('Error connecting to MariaDB after retries:', error);
        throw error;
      }
      logger.warn(`Failed to connect to MariaDB, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5; // Exponential backoff
    }
  }
}

// Create tables if they don't exist
async function createTables() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Table for the streams
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS streams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('udp', 'rtp') NOT NULL,
        address VARCHAR(255) NOT NULL,
        port INT NOT NULL,
        options TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Table for the probes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS probes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        stream_id INT NOT NULL,
        profile ENUM('basic', 'detailed', 'monitoring') DEFAULT 'basic',
        options TEXT,
        output_format ENUM('text', 'json') DEFAULT 'text',
        status ENUM('stopped', 'running', 'error', 'paused') DEFAULT 'stopped',
        process_id INT,
        started_at TIMESTAMP NULL,
        stopped_at TIMESTAMP NULL,
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Table for the analyses
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS analyses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        probe_id INT NOT NULL,
        stream_id INT NOT NULL,
        data LONGTEXT NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (probe_id) REFERENCES probes(id) ON DELETE CASCADE,
        FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Table for the alerts
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(100) NOT NULL,
        probe_id INT,
        severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        message TEXT NOT NULL,
        data TEXT,
        timestamp TIMESTAMP NOT NULL,
        acknowledged TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (probe_id) REFERENCES probes(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Table for the probe logs
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS probe_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        probe_id INT NOT NULL,
        level VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        data TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (probe_id) REFERENCES probes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Indexes to improve performance
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_analyses_probe_id ON analyses(probe_id)
    `);
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_analyses_stream_id ON analyses(stream_id)
    `);
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_analyses_timestamp ON analyses(timestamp)
    `);
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_alerts_probe_id ON alerts(probe_id)
    `);
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged)
    `);
    await connection.execute(`
      CREATE INDEX IF NOT EXISTS idx_probe_logs_probe_id ON probe_logs(probe_id)
    `);

    await connection.commit();
    logger.info('Database tables created/verified');
  } catch (error) {
    await connection.rollback();
    logger.error('Error creating tables:', error);
    throw error;
  } finally {
    connection.release();
  }
}

async function initializeStorage() {
  try {
    await createDatabaseIfNotExists();
    await testConnection();
    await createTables();
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}

// Export pool for use in models
module.exports = pool;
module.exports.initializeStorage = initializeStorage;
