const subscriptionService = require("../services/subscription.service");

const getPlans = async (_req, res, next) => {
  try {
    const plans = await subscriptionService.getPlans();
    return res.status(200).json(plans);
  } catch (err) {
    next(err);
  }
};

const getCurrent = async (_req, res, next) => {
  try {
    const current = await subscriptionService.getCurrent();
    return res.status(200).json(current);
  } catch (err) {
    next(err);
  }
};

module.exports = { getPlans, getCurrent };
