const { security } = require('../config');
const { logger } = require('../config');

// Simple authentication middleware by API key
// TODO: Implement JWT or OAuth2 for production

function authenticate(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey || apiKey !== security.apiKey) {
    logger.warn(`Unauthorized access attempt from ${req.ip}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

function optionalAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (apiKey && apiKey === security.apiKey) {
    req.authenticated = true;
  } else {
    req.authenticated = false;
  }

  next();
}

module.exports = {
  authenticate,
  optionalAuth,
};


