const express = require('express');
const router = express.Router();
const probeController = require('../controllers/probe.controller');
const validation = require('../middlewares/validation.middleware');

/**
 * @swagger
 * /api/probes:
 *   get:
 *     summary: Retrieve all probes
 *     tags: [Probes]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     responses:
 *       200:
 *         description: List of probes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Probe'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', probeController.getAll);

/**
 * @swagger
 * /api/probes/{id}:
 *   get:
 *     summary: Retrieve a probe by its ID
 *     tags: [Probes]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Probe ID
 *     responses:
 *       200:
 *         description: Probe details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Probe'
 *       404:
 *         description: Probe not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id', probeController.getById);

/**
 * @swagger
 * /api/probes:
 *   post:
 *     summary: Create a new probe
 *     tags: [Probes]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - streamId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Probe name
 *               description:
 *                 type: string
 *                 description: Probe description
 *               streamId:
 *                 type: integer
 *                 description: Stream ID associated with the probe
 *               profile:
 *                 type: string
 *                 enum: [basic, detailed, monitoring]
 *                 default: basic
 *                 description: Analysis profile
 *               outputFormat:
 *                 type: string
 *                 enum: [text, json]
 *                 default: text
 *                 description: Output format for analysis results
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Additional TSDuck options
 *     responses:
 *       201:
 *         description: Probe created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Probe'
 *       400:
 *         description: Invalid data
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', validation.validateProbe, probeController.create);

/**
 * @swagger
 * /api/probes/{id}:
 *   put:
 *     summary: Update a probe
 *     tags: [Probes]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Probe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Probe name
 *               description:
 *                 type: string
 *                 description: Probe description
 *               streamId:
 *                 type: integer
 *                 description: Stream ID associated with the probe
 *               profile:
 *                 type: string
 *                 enum: [basic, detailed, monitoring]
 *                 description: Analysis profile
 *               outputFormat:
 *                 type: string
 *                 enum: [text, json]
 *                 description: Output format for analysis results
 *     responses:
 *       200:
 *         description: Probe updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Probe'
 *       404:
 *         description: Probe not found
 *       400:
 *         description: Invalid data
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/:id', validation.validateProbe, probeController.update);

/**
 * @swagger
 * /api/probes/{id}:
 *   delete:
 *     summary: Delete a probe
 *     tags: [Probes]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Probe ID
 *     responses:
 *       200:
 *         description: Probe deleted successfully
 *       404:
 *         description: Probe not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/:id', probeController.delete);

/**
 * @swagger
 * /api/probes/{id}/start:
 *   post:
 *     summary: Start a probe
 *     tags: [Probes]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Probe ID
 *     responses:
 *       200:
 *         description: Probe started successfully
 *       404:
 *         description: Probe not found
 *       400:
 *         description: Probe is already running
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/start', probeController.start);

/**
 * @swagger
 * /api/probes/{id}/stop:
 *   post:
 *     summary: Stop a probe
 *     tags: [Probes]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Probe ID
 *     responses:
 *       200:
 *         description: Probe stopped successfully
 *       404:
 *         description: Probe not found
 *       400:
 *         description: Probe is not running
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/stop', probeController.stop);

/**
 * @swagger
 * /api/probes/{id}/status:
 *   get:
 *     summary: Retrieve the status of a probe
 *     tags: [Probes]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Probe ID
 *     responses:
 *       200:
 *         description: Probe status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [stopped, running, error]
 *                 uptime:
 *                   type: number
 *                   description: Uptime in seconds
 *       404:
 *         description: Sonde non trouvée
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id/status', probeController.getStatus);

/**
 * @swagger
 * /api/probes/{id}/logs/test:
 *   post:
 *     summary: Create a test log entry for a probe (for debugging)
 *     tags: [Probes]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Probe ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 default: "Test log message"
 *     responses:
 *       200:
 *         description: Test log created successfully
 *       404:
 *         description: Probe not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/logs/test', probeController.createTestLog);

/**
 * @swagger
 * /api/probes/{id}/logs:
 *   get:
 *     summary: Retrieve the logs of a probe
 *     tags: [Probes]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Probe ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of log lines to return
 *     responses:
 *       200:
 *         description: Probe logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 probeId:
 *                   type: integer
 *                   description: Probe ID
 *                 total:
 *                   type: integer
 *                   description: Number of logs returned
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Log entry ID
 *                       level:
 *                         type: string
 *                         enum: [info, warn, error]
 *                         description: Log level
 *                       message:
 *                         type: string
 *                         description: Log message
 *                       data:
 *                         type: object
 *                         nullable: true
 *                         description: Additional log data
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         description: Log timestamp
 *       404:
 *         description: Probe not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id/logs', probeController.getLogs);

module.exports = router;


