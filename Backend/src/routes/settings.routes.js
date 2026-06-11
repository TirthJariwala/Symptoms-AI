const express = require("express");
const settingsController = require("../controllers/settings.controller");
const { requireAdmin } = require("../middleware/admin.middleware");

const router = express.Router();

router.get("/me", settingsController.getMySettings);
router.put("/me", settingsController.updateMySettings);

router.get("/global", requireAdmin, settingsController.getGlobalSettings);
router.put("/global", requireAdmin, settingsController.updateGlobalSettings);

module.exports = router;

