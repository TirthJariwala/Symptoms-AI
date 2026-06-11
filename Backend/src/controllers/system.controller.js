const { healthCheck } = require("../integrations/aiClient");

const status = async (_req, res, next) => {
  try {
    const ai = await healthCheck();
    return res.status(200).json({
      backend: { status: "ok", service: "sdps-backend" },
      ai: ai.data,
    });
  } catch (err) {
    return res.status(200).json({
      backend: { status: "ok", service: "sdps-backend" },
      ai: { status: "unreachable", detail: err.message },
    });
  }
};

module.exports = { status };
