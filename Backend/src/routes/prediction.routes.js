const express = require("express");
const predictionController = require("../controllers/prediction.controller");
const { singleFileUpload } = require("../middleware/upload.middleware");

const router = express.Router();

router.post("/predict", singleFileUpload, predictionController.predict);

module.exports = router;
