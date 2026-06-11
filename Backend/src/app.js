const express = require("express");
const cors = require("cors");
const env = require("./config/env");
const predictionRoutes = require("./routes/prediction.routes");
const authRoutes = require("./routes/auth.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const caseRoutes = require("./routes/case.routes");
const reportRoutes = require("./routes/report.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const healthRoutes = require("./routes/health.routes");
const systemRoutes = require("./routes/system.routes");
const adminRoutes = require("./routes/admin.routes");
const settingsRoutes = require("./routes/settings.routes");
const { errorHandler } = require("./middleware/error.middleware");
const { rateLimiter } = require("./middleware/rateLimit.middleware");
const logger = require("./utils/logger");

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "sdps-backend" });
});

app.use("/api/health", healthRoutes);
app.use("/api/system", systemRoutes);
app.use("/api", predictionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingsRoutes);

app.use((req, res) => {
  res.status(404).json({ detail: `Route not found: ${req.method} ${req.path}` });
});

app.use(errorHandler);

app.on("error", (err) => {
  logger.error("Application error", { message: err.message });
});

module.exports = app;
