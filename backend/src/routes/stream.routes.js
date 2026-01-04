const express = require('express');
const router = express.Router();
const streamController = require('../controllers/stream.controller');
const validation = require('../middlewares/validation.middleware');

/**
 * @swagger
 * /api/streams:
 *   get:
 *     summary: Retrieve all streams
 *     tags: [Streams]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     responses:
 *       200:
 *         description: List of streams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Stream'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', streamController.getAll);

/**
 * @swagger
 * /api/streams/{id}:
 *   get:
 *     summary: Retrieve a stream by its ID
 *     tags: [Streams]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stream ID
 *     responses:
 *       200:
 *         description: Stream details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stream'
 *       404:
 *         description: Stream not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id', streamController.getById);

/**
 * @swagger
 * /api/streams:
 *   post:
 *     summary: Create a new stream
 *     tags: [Streams]
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
 *               - type
 *               - address
 *               - port
 *             properties:
 *               name:
 *                 type: string
 *                 description: Stream name
 *               description:
 *                 type: string
 *                 description: Stream description
 *               type:
 *                 type: string
 *                 enum: [udp, rtp]
 *                 description: Stream type
 *               address:
 *                 type: string
 *                 description: IP address or hostname
 *               port:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 65535
 *                 description: Port number
 *               options:
 *                 type: object
 *                 description: Additional stream options
 *     responses:
 *       201:
 *         description: Stream created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stream'
 *       400:
 *         description: Invalid data
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', validation.validateStream, streamController.create);

/**
 * @swagger
 * /api/streams/{id}:
 *   put:
 *     summary: Update a stream
 *     tags: [Streams]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stream ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Stream name
 *               description:
 *                 type: string
 *                 description: Stream description
 *               type:
 *                 type: string
 *                 enum: [udp, rtp]
 *                 description: Stream type
 *               address:
 *                 type: string
 *                 description: IP address or hostname
 *               port:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 65535
 *                 description: Port number
 *     responses:
 *       200:
 *         description: Stream updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stream'
 *       404:
 *         description: Stream not found
 *       400:
 *         description: Invalid data
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/:id', validation.validateStream, streamController.update);

/**
 * @swagger
 * /api/streams/{id}:
 *   delete:
 *     summary: Delete a stream
 *     tags: [Streams]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stream ID
 *     responses:
 *       200:
 *         description: Stream deleted successfully
 *       404:
 *         description: Stream not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/:id', streamController.delete);

/**
 * @swagger
 * /api/streams/{id}/stats:
 *   get:
 *     summary: Retrieve the statistics of a stream
 *     tags: [Streams]
 *     security:
 *       - ApiKeyAuth: []
 *       - ApiKeyQuery: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stream ID
 *     responses:
 *       200:
 *         description: Stream statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bitrate:
 *                   type: number
 *                   description: Bitrate in bps
 *                 packets:
 *                   type: integer
 *                   description: Number of packets
 *                 errors:
 *                   type: integer
 *                   description: Number of errors
 *       404:
 *         description: Stream not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id/stats', streamController.getStats);

module.exports = router;


