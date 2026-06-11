require("dotenv").config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || "http://localhost:8000",
  AI_PREDICT_PATH: process.env.AI_PREDICT_PATH || "/api/v1/predict",
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
};

module.exports = env;
