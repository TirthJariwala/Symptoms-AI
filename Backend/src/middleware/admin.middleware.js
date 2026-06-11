const { decodeJwtPayload } = require("../utils/jwt");

const requireAdmin = (req, res, next) => {
  const payload = decodeJwtPayload(req.headers.authorization);
  if (!payload) {
    return res.status(401).json({ detail: "Authentication required." });
  }
  if (payload.role !== "admin") {
    return res.status(403).json({ detail: "Admin access only." });
  }
  next();
};

module.exports = { requireAdmin };
