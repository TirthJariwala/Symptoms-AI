const getPlans = async () => ({
  plans: [
    { id: "free", name: "Clinical Trial", price: 0, features: ["50 predictions/month"] },
    { id: "pro", name: "Hospital Pro", price: 299, features: ["Unlimited predictions", "RL feedback"] },
  ],
});

const getCurrent = async () => ({
  plan_id: "free",
  status: "active",
  message: "Subscription billing is not connected to the AI service.",
});

module.exports = { getPlans, getCurrent };
