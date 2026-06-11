const express = require("express");
const reportController = require("../controllers/report.controller");

const router = express.Router();

router.get("/:caseId/text", reportController.downloadText);
router.get("/:caseId/html", reportController.downloadHtml);
router.get("/:caseId", reportController.generate);

module.exports = router;
