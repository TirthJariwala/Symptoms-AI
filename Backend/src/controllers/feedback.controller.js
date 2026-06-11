const feedbackService = require("../services/feedback.service");
const { sendProxyResult } = require("../utils/proxyResponse");

const submit = async (req, res, next) => {
  try {
    const result = await feedbackService.create(req.body, req.headers.authorization);
    return sendProxyResult(res, result);
  } catch (err) {
    next(err);
  }
};

const getByCaseId = async (_req, res) => {
  return res.status(501).json({
    detail: "Feedback history by case is not available on the AI service.",
  });
};

const escalate = async (req, res, next) => {
  try {
    const result = await feedbackService.create(
      { ...req.body, escalate: true },
      req.headers.authorization
    );
    return sendProxyResult(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { submit, getByCaseId, escalate };
