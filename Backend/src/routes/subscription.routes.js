const express = require("express");
const subscriptionController = require("../controllers/subscription.controller");

const router = express.Router();

router.get("/plans", subscriptionController.getPlans);
router.get("/current", subscriptionController.getCurrent);

module.exports = router;
