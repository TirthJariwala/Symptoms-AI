const express = require("express");
const caseController = require("../controllers/case.controller");

const router = express.Router();

router.get("/", caseController.list);
router.get("/:id", caseController.getById);

module.exports = router;
