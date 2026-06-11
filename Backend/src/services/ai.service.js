const { predictImage } = require("../integrations/aiClient");

const forwardPrediction = async (file, options = {}) => {
  return predictImage(file, options);
};

module.exports = { forwardPrediction };
