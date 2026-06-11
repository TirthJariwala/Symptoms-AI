const caseStore = require("./case.store");

const saveFromPrediction = (userId, prediction, meta = {}) => {
  const record = {
    case_id: prediction.case_id,
    user_id: userId || null,
    file_name: meta.file_name || null,
    created_at: prediction.timestamp || new Date().toISOString(),
    prediction,
  };
  return caseStore.addCase(record);
};

const list = (userId) => caseStore.listCases(userId);

const getById = (caseId) => caseStore.getCase(caseId);

module.exports = { saveFromPrediction, list, getById };
