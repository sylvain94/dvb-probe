const express = require('express');
const probeRoutes = require('./probe.routes');
const streamRoutes = require('./stream.routes');
const analysisRoutes = require('./analysis.routes');
const systemRoutes = require('./system.routes');

const router = express.Router();

router.use('/probes', probeRoutes);
router.use('/streams', streamRoutes);
router.use('/analysis', analysisRoutes);
router.use('/system', systemRoutes);

module.exports = router;


