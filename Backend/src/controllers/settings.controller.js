const settingsService = require("../services/settings.service");
const { decodeJwtPayload } = require("../utils/jwt");

const getAuthPayload = (req) => decodeJwtPayload(req.headers.authorization);

const getMySettings = (req, res) => {
  const payload = getAuthPayload(req);
  if (!payload?.sub) {
    return res.status(401).json({ detail: "Authentication required." });
  }
  const settings = settingsService.getUserSettings(payload.sub);
  return res.status(200).json(settings);
};

const updateMySettings = (req, res) => {
  const payload = getAuthPayload(req);
  if (!payload?.sub) {
    return res.status(401).json({ detail: "Authentication required." });
  }
  const settings = settingsService.updateUserSettings(payload.sub, req.body || {});
  return res.status(200).json(settings);
};

const getGlobalSettings = (_req, res) => {
  const settings = settingsService.getGlobalSettings();
  return res.status(200).json(settings);
};

const updateGlobalSettings = (req, res) => {
  const settings = settingsService.updateGlobalSettings(req.body || {});
  return res.status(200).json(settings);
};

module.exports = {
  getMySettings,
  updateMySettings,
  getGlobalSettings,
  updateGlobalSettings,
};

