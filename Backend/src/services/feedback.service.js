const { submitFeedback } = require("../integrations/aiClient");

const create = (body, authorization) => submitFeedback(body, authorization);

module.exports = { create };
