const caseService = require("../services/case.service");

const { getUserId, decodeJwtPayload } = require("../utils/jwt");

const list = async (req, res, next) => {
  try {
    const payload = decodeJwtPayload(req.headers.authorization);
    const isAdmin = payload?.role === "admin";
    const userId = isAdmin ? null : getUserId(req);
    const cases = caseService.list(userId);
    return res.status(200).json({ data: cases, total: cases.length });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const record = caseService.getById(req.params.id);
    if (!record) {
      return res.status(404).json({ detail: `Case '${req.params.id}' not found.` });
    }
    return res.status(200).json(record);
  } catch (err) {
    next(err);
  }
};

module.exports = { list, getById };
