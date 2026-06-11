const express = require("express");
const adminController = require("../controllers/admin.controller");
const { requireAdmin } = require("../middleware/admin.middleware");

const router = express.Router();

router.use(requireAdmin);
router.get("/overview", adminController.overview);

module.exports = router;
