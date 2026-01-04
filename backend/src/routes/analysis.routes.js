const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysis.controller');

/**
 * @swagger
 * /api/analysis:
 *   get:
 *     summary: Retrieve all analyses
 *     tags: [Analysis]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     responses:
 *       200:
 *         description: List of analyses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Analysis'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', analysisController.getAll);

/**
 * @swagger
 * /api/analysis/{id}:
 *   get:
 *     summary: Retrieve an analysis by its ID
 *     tags: [Analysis]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Analysis ID
 *     responses:
 *       200:
 *         description: Analysis details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Analysis'
 *       404:
 *         description: Analysis not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id', analysisController.getById);

/**
 * @swagger
 * /api/analysis/probe/{probeId}:
 *   get:
 *     summary: Retrieve the analyses of a probe
 *     tags: [Analysis]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: probeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Probe ID
 *     responses:
 *       200:
 *         description: List of analyses of the probe
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Analysis'
 *       404:
 *         description: Probe not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/probe/:probeId', analysisController.getByProbeId);

/**
 * @swagger
 * /api/analysis/stream/{streamId}:
 *   get:
 *     summary: Retrieve the analyses of a stream
 *     tags: [Analysis]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: streamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stream ID
 *     responses:
 *       200:
 *         description: List of analyses of the stream
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Analysis'
 *       404:
 *         description: Stream not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stream/:streamId', analysisController.getByStreamId);

/**
 * @swagger
 * /api/analysis/{id}:
 *   delete:
 *     summary: Delete an analysis
 *     tags: [Analysis]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Analysis ID
 *     responses:
 *       200:
 *         description: Analysis deleted successfully
 *       404:
 *         description: Analysis not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/:id', analysisController.delete);

/**
 * @swagger
 * /api/analysis/{id}/report:
 *   get:
 *     summary: Retrieve the report of an analysis
 *     tags: [Analysis]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Analysis ID
 *     responses:
 *       200:
 *         description: Analysis report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Detailed analysis report
 *       404:
 *         description: Analysis not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id/report', analysisController.getReport);

module.exports = router;


