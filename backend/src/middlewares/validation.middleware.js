const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateProbe = [
  body('name').notEmpty().withMessage('The name is required'),
  body('streamId').isInt().withMessage('The stream ID must be an integer'),
  body('profile').optional().isIn(['basic', 'detailed', 'monitoring']).withMessage('Invalid profile'),
  body('outputFormat').optional().isIn(['text', 'json']).withMessage('Invalid output format'),
  handleValidationErrors,
];

const validateStream = [
  body('name').notEmpty().withMessage('The name is required'),
  body('type').isIn(['udp', 'rtp']).withMessage('The type must be udp or rtp'),
  body('address').notEmpty().isIP().withMessage('The IP address is required and must be valid'),
  body('port').isInt({ min: 1, max: 65535 }).withMessage('The port must be between 1 and 65535'),
  handleValidationErrors,
];

module.exports = {
  validateProbe,
  validateStream,
};


