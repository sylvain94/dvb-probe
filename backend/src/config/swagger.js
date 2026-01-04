const swaggerJsdoc = require('swagger-jsdoc');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DVB Probe API',
      version: '1.0.0',
      description: 'API for the management and monitoring of DVB probes based on TSDuck',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: 'Local server',
      },
      {
        url: `http://127.0.0.1:${env.port}`,
        description: 'Local server (127.0.0.1)',
      },
      {
        url: `/`,
        description: 'Current server (relative URL)',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for authentication',
        },
        ApiKeyQuery: {
          type: 'apiKey',
          in: 'query',
          name: 'apiKey',
          description: 'API key for authentication (via query parameter)',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        Probe: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier of the probe',
            },
            name: {
              type: 'string',
              description: 'Probe name',
            },
            description: {
              type: 'string',
              description: 'Probe description',
            },
            stream_id: {
              type: 'integer',
              description: 'Stream ID associated with the probe',
            },
            profile: {
              type: 'string',
              enum: ['basic', 'detailed', 'monitoring'],
              description: 'Analysis profile',
            },
            output_format: {
              type: 'string',
              enum: ['text', 'json'],
              description: 'Output format for analysis results',
            },
            options: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Additional TSDuck options',
            },
            status: {
              type: 'string',
              enum: ['stopped', 'running', 'error'],
              description: 'Probe status',
            },
            error: {
              type: 'string',
              nullable: true,
              description: 'Error message if status is error',
            },
            started_at: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Start date',
            },
            stopped_at: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Stop date',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Update date',
            },
          },
        },
        Stream: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier of the stream',
            },
            name: {
              type: 'string',
              description: 'Stream name',
            },
            description: {
              type: 'string',
              description: 'Stream description',
            },
            type: {
              type: 'string',
              enum: ['udp', 'rtp'],
              description: 'Stream type',
            },
            address: {
              type: 'string',
              description: 'IP address or hostname',
            },
            port: {
              type: 'integer',
              description: 'Port number',
            },
            options: {
              type: 'object',
              description: 'Additional stream options',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Update date',
            },
          },
        },
        Analysis: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Unique identifier of the analysis',
            },
            probeId: {
              type: 'integer',
              description: 'Probe identifier',
            },
            streamId: {
              type: 'integer',
              description: 'Stream identifier',
            },
            status: {
              type: 'string',
              enum: ['pending', 'running', 'completed', 'failed'],
              description: 'Analysis status',
            },
            results: {
              type: 'object',
              description: 'Analysis results',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Update date',
            },
          },
        },
        SystemInfo: {
          type: 'object',
          properties: {
            nodeVersion: {
              type: 'string',
              description: 'Node.js version',
            },
            platform: {
              type: 'string',
              description: 'System platform',
            },
            uptime: {
              type: 'number',
              description: 'Uptime in seconds',
            },
            memory: {
              type: 'object',
              description: 'Memory information',
            },
          },
        },
        Health: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['ok', 'degraded', 'down'],
              description: 'System health status',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp of the check',
            },
            services: {
              type: 'object',
              description: 'Services status',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Unauthorized - API key missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Unauthorized',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Not found',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                error: 'Validation failed',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Probes',
        description: 'Management of DVB probes',
      },
      {
        name: 'Streams',
        description: 'Management of streams',
      },
      {
        name: 'Analysis',
        description: 'Management of analyses',
      },
      {
        name: 'System',
        description: 'System information and monitoring',
      },
    ],
    security: [
      {
        ApiKeyAuth: [],
      },
      {
        ApiKeyQuery: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

