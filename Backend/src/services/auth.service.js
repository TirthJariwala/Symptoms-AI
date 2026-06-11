const {
  authRegister,
  authLogin,
  authRefresh,
  authMe,
} = require("../integrations/aiClient");

const register = (body) => authRegister(body);
const login = (body) => authLogin(body);
const refresh = (body, authorization) => authRefresh(body, authorization);
const me = (authorization) => authMe(authorization);

module.exports = { register, login, refresh, me };
