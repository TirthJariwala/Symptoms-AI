const authService = require("../services/auth.service");
const { sendProxyResult } = require("../utils/proxyResponse");
const logger = require("../utils/logger");

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return sendProxyResult(res, result);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return sendProxyResult(res, result);
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const result = await authService.refresh(req.body, req.headers.authorization);
    return sendProxyResult(res, result);
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const result = await authService.me(req.headers.authorization);
    return sendProxyResult(res, result);
  } catch (err) {
    next(err);
  }
};

const logout = async (_req, res) => {
  logger.info("Client logout");
  return res.status(200).json({ message: "Logged out successfully." });
};

module.exports = { register, login, refresh, me, logout };
