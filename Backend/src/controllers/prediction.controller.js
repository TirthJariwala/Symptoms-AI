const predictionService = require("../services/prediction.service");
const caseService = require("../services/case.service");
const { validateUploadedFile } = require("../utils/validators");
const logger = require("../utils/logger");

const { getUserId } = require("../utils/jwt");

const predict = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({
        detail: "Authentication required. Log in to obtain a Bearer token before predicting.",
      });
    }

    const validation = validateUploadedFile(req.file);
    if (!validation.valid) {
      return res.status(400).json({ detail: validation.message });
    }

    const options = {
      authorization: req.headers.authorization,
      cnn_architecture: req.body.cnn_architecture,
      patient_age: req.body.patient_age,
      patient_sex: req.body.patient_sex,
    };

    const result = await predictionService.runPrediction(req.file, options);

    caseService.saveFromPrediction(getUserId(req), result, {
      file_name: req.file.originalname,
    });

    return res.status(200).json(result);
  } catch (err) {
    logger.error("Prediction controller error", { message: err.message });
    next(err);
  }
};

module.exports = { predict };
