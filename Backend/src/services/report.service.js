const caseService = require("./case.service");

const getByCaseId = (caseId) => {
  const record = caseService.getById(caseId);
  if (!record) {
    const err = new Error(`Case '${caseId}' not found.`);
    err.statusCode = 404;
    throw err;
  }
  return {
    case_id: record.case_id,
    file_name: record.file_name,
    created_at: record.created_at,
    prediction: record.prediction,
  };
};

module.exports = { getByCaseId };
