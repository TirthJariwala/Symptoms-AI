const axios = require("axios");
const FormData = require("form-data");
const env = require("../config/env");
const { UPLOAD_FIELD_NAME, AI_PATHS } = require("../config/constants");
const logger = require("../utils/logger");

const aiClient = axios.create({
  baseURL: env.AI_SERVICE_URL,
  timeout: 120000,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

const buildAuthHeaders = (authorization) => {
  const headers = {};
  if (authorization) headers.Authorization = authorization;
  return headers;
};

/**
 * Generic JSON proxy to AI service — returns response body unchanged.
 */
const forwardJson = async (method, path, { data, authorization, params } = {}) => {
  const response = await aiClient.request({
    method,
    url: path,
    data,
    params,
    headers: buildAuthHeaders(authorization),
  });
  return { status: response.status, data: response.data };
};

/**
 * Forward multipart prediction request to AI service.
 */
const predictImage = async (file, options = {}) => {
  const form = new FormData();
  form.append(UPLOAD_FIELD_NAME, file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  if (options.cnn_architecture) {
    form.append("cnn_architecture", options.cnn_architecture);
  }
  if (options.patient_age != null) {
    form.append("patient_age", String(options.patient_age));
  }
  if (options.patient_sex) {
    form.append("patient_sex", options.patient_sex);
  }

  const headers = { ...form.getHeaders(), ...buildAuthHeaders(options.authorization) };

  logger.info("Forwarding prediction request to AI service", { path: env.AI_PREDICT_PATH });

  const response = await aiClient.post(env.AI_PREDICT_PATH, form, { headers });
  return response.data;
};

const healthCheck = () => forwardJson("GET", AI_PATHS.health);
const authRegister = (body) => forwardJson("POST", AI_PATHS.auth.register, { data: body });
const authLogin = (body) => forwardJson("POST", AI_PATHS.auth.login, { data: body });
const authRefresh = (body, authorization) =>
  forwardJson("POST", AI_PATHS.auth.refresh, { data: body, authorization });
const authMe = (authorization) => forwardJson("GET", AI_PATHS.auth.me, { authorization });
const submitFeedback = (body, authorization) =>
  forwardJson("POST", AI_PATHS.feedback, { data: body, authorization });

module.exports = {
  aiClient,
  forwardJson,
  predictImage,
  healthCheck,
  authRegister,
  authLogin,
  authRefresh,
  authMe,
  submitFeedback,
};
