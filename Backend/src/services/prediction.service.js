const aiService = require("./ai.service");

const runPrediction = async (file, options = {}) => {
  return aiService.forwardPrediction(file, options);
};

module.exports = { runPrediction };
