/**
 * Placeholder JWT middleware for future auth enforcement at backend layer.
 * AI service auth is forwarded via Authorization header from the client.
 */
const authMiddleware = (_req, _res, next) => {
  next();
};

module.exports = { authMiddleware };
