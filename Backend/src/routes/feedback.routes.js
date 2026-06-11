const express = require("express");
const feedbackController = require("../controllers/feedback.controller");

const router = express.Router();

router.post("/", feedbackController.submit);
router.get("/case/:caseId", feedbackController.getByCaseId);
router.post("/escalate", feedbackController.escalate);

module.exports = router;
