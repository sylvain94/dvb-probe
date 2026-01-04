const express = require('express');
const router = express.Router();
const systemController = require('../controllers/system.controller');

/**
 * @swagger
 * /api/system/info:
 *   get:
 *     summary: Retrieve system information
 *     tags: [System]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     responses:
 *       200:
 *         description: System information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SystemInfo'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/info', systemController.getInfo);

/**
 * @swagger
 * /api/system/health:
 *   get:
 *     summary: Check the health of the system
 *     tags: [System]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     responses:
 *       200:
 *         description: System health status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Health'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/health', systemController.getHealth);

/**
 * @swagger
 * /api/system/stats:
 *   get:
 *     summary: Retrieve system statistics
 *     tags: [System]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     responses:
 *       200:
 *         description: System statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 probes:
 *                   type: integer
 *                   description: Number of probes
 *                 streams:
 *                   type: integer
 *                   description: Number of streams
 *                 analyses:
 *                   type: integer
 *                   description: Number of analyses
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', systemController.getStats);

/**
 * @swagger
 * /api/system/tsduck/check:
 *   get:
 *     summary: Check the availability of TSDuck
 *     tags: [System]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     responses:
 *       200:
 *         description: TSDuck availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                   description: Check if TSDuck is available
 *                 version:
 *                   type: string
 *                   description: TSDuck version if available
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/tsduck/check', systemController.checkTsduck);

module.exports = router;


