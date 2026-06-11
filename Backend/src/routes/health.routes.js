const express = require("express");
const { healthCheck } = require("../integrations/aiClient");
const { sendProxyResult } = require("../utils/proxyResponse");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const result = await healthCheck();
    return sendProxyResult(res, result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
