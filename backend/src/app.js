const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { env, logger } = require('./config');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');
const loggingMiddleware = require('./middlewares/logging.middleware');

const app = express();

// Middlewares for security
// Configure Helmet to allow Swagger UI
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Swagger UI
  crossOriginEmbedderPolicy: false, // Allow Swagger UI to load resources
}));
app.use(cors({
  origin: env.cors.origin,
  credentials: true,
}));

// Middlewares for parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));
app.use(loggingMiddleware);

// Swagger documentation
// Create a function to generate Swagger spec dynamically
const getSwaggerSpec = (req) => {
  // Dynamically set server URL based on request
  const protocol = req.protocol;
  const host = req.get('host');
  const baseUrl = `${protocol}://${host}`;
  
  // Clone the spec and update server URLs
  const spec = JSON.parse(JSON.stringify(swaggerSpec));
  spec.servers = [
    {
      url: baseUrl,
      description: 'Current server',
    },
    {
      url: `http://localhost:${env.port}`,
      description: 'Local server',
    },
  ];
  
  return spec;
};

const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'DVB Probe API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
  },
};

// Swagger UI - serve files
app.use('/api-docs', swaggerUi.serve);

// Setup Swagger UI with dynamic spec
app.get('/api-docs', (req, res, next) => {
  const dynamicSpec = getSwaggerSpec(req);
  const swaggerUiHandler = swaggerUi.setup(dynamicSpec, swaggerUiOptions);
  swaggerUiHandler(req, res, next);
});

// Routes
app.use('/api', routes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check the health of the API
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Uptime in seconds
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: Basic API information
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Basic API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: DVB Probe API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 status:
 *                   type: string
 *                   example: running
 */
app.get('/', (req, res) => {
  res.json({
    name: 'DVB Probe API',
    version: '1.0.0',
    status: 'running',
  });
});

// Error handling
app.use(errorMiddleware);

module.exports = app;


