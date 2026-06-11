const caseService = require("../services/case.service");
const { healthCheck } = require("../integrations/aiClient");

const overview = async (_req, res, next) => {
  try {
    const cases = caseService.list(null);
    let ai = { status: "unknown" };
    try {
      const result = await healthCheck();
      ai = result.data;
    } catch {
      ai = { status: "unreachable" };
    }

    const flagged = cases.filter((c) => c.prediction.low_confidence_flag).length;

    return res.status(200).json({
      total_cases: cases.length,
      flagged_cases: flagged,
      ai_service: ai,
      backend: { status: "ok" },
      recent_cases: cases.slice(0, 10),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { overview };
