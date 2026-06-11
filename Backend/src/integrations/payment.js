/** Payment integration placeholder — wire Stripe when subscriptions are enabled. */
const createCheckoutSession = async () => {
  throw new Error("Payment provider not configured.");
};

module.exports = { createCheckoutSession };
