const logger = require("../utils/logger");

const errorHandler = (err, req, res, _next) => {
  if (err.statusCode) {
    return res.status(err.statusCode).json({ detail: err.message });
  }

  if (err.response) {
    const { status, data } = err.response;
    logger.error("AI service error", { status, data });
    return res.status(status).json(data);
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ detail: "File exceeds maximum allowed size." });
  }

  logger.error("Unhandled error", { message: err.message });
  return res.status(500).json({
    detail: err.message || "Internal server error",
  });
};

module.exports = { errorHandler };
