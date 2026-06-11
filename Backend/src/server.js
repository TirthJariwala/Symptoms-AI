const app = require("./app");
const env = require("./config/env");
const logger = require("./utils/logger");

const server = app.listen(env.PORT, () => {
  logger.info(`Backend server listening on port ${env.PORT}`, {
    aiServiceUrl: env.AI_SERVICE_URL,
    predictPath: env.AI_PREDICT_PATH,
  });
});

process.on("SIGTERM", () => {
  server.close(() => {
    logger.info("Server shut down");
    process.exit(0);
  });
});
