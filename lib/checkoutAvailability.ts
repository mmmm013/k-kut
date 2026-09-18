import { paymentRolloutStatus } from "./paymentRolloutStatus";

// Explicit application environment works on Render and other hosts. Vercel's
// environment remains a backwards-compatible default for existing deployments.
export function checkoutProductionEnvironment() {
  const environment = process.env.K_KUT_DEPLOYMENT_ENV ?? process.env.VERCEL_ENV;
  return environment === "production";
}

export function checkoutAvailability() {
  const rollout = paymentRolloutStatus();
  return {
    rollout,
    enabled: checkoutProductionEnvironment() && rollout.enabled &&
      Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
  };
}
