const env = require("../config/env");

const hits = new Map();

const rateLimiter = (req, res, next) => {
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowStart = now - env.RATE_LIMIT_WINDOW_MS;

  const timestamps = (hits.get(key) || []).filter((t) => t > windowStart);
  timestamps.push(now);
  hits.set(key, timestamps);

  if (timestamps.length > env.RATE_LIMIT_MAX) {
    return res.status(429).json({
      detail: "Too many requests. Please try again later.",
    });
  }

  next();
};

module.exports = { rateLimiter };
