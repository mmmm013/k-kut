const PAYMENT_LINKS_START_DATE_KEY = "K_KUT_PAYMENT_LINKS_START_DATE";
const PAYMENT_LINKS_FORCE_DISABLE_KEY = "K_KUT_PAYMENT_LINKS_FORCE_DISABLE";
const MS_IN_DAY = 24 * 60 * 60 * 1000;

export type PaymentRolloutStatus = {
  enabled: boolean;
  reason?: string;
  rolloutStartDate: string | null;
  currentRolloutDay: number | null;
  elapsedDays: number | null;
  forceDisabled: boolean;
};

export function paymentRolloutBuyerNotice(status: PaymentRolloutStatus) {
  if (status.enabled) return null;
  switch (status.reason) {
    case "payment-rollout-day-1-2":
      return "Preview is open. Checkout opens on day 3 of the controlled rollout.";
    case "payment-rollout-not-started":
      return "Preview is open. Checkout opens when the controlled rollout begins.";
    case "payment-rollout-force-disabled":
      return "Preview is open. Checkout is temporarily paused.";
    default:
      return "Preview is open. Checkout is not available yet.";
  }
}

function parseUtcDateOnly(value: string) {
  const normalized = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(normalized)) return null;
  const date = new Date(`${normalized}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function paymentRolloutStatus(now = new Date()): PaymentRolloutStatus {
  const forceDisabled =
    String(process.env[PAYMENT_LINKS_FORCE_DISABLE_KEY] || "").trim() === "1";
  const startValue = String(process.env[PAYMENT_LINKS_START_DATE_KEY] || "").trim();

  if (forceDisabled) {
    return {
      enabled: false,
      reason: "payment-rollout-force-disabled",
      rolloutStartDate: startValue || null,
      currentRolloutDay: null,
      elapsedDays: null,
      forceDisabled: true,
    };
  }

  if (!startValue) {
    return {
      enabled: false,
      reason: "payment-rollout-start-date-missing",
      rolloutStartDate: null,
      currentRolloutDay: null,
      elapsedDays: null,
      forceDisabled: false,
    };
  }

  const rolloutStart = parseUtcDateOnly(startValue);
  if (!rolloutStart) {
    return {
      enabled: false,
      reason: "payment-rollout-start-date-invalid",
      rolloutStartDate: startValue,
      currentRolloutDay: null,
      elapsedDays: null,
      forceDisabled: false,
    };
  }

  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const startUtc = Date.UTC(
    rolloutStart.getUTCFullYear(),
    rolloutStart.getUTCMonth(),
    rolloutStart.getUTCDate(),
  );
  const elapsedDays = Math.floor((nowUtc - startUtc) / MS_IN_DAY);
  const currentRolloutDay = elapsedDays >= 0 ? elapsedDays + 1 : null;

  if (elapsedDays < 0) {
    return {
      enabled: false,
      reason: "payment-rollout-not-started",
      rolloutStartDate: startValue,
      currentRolloutDay,
      elapsedDays,
      forceDisabled: false,
    };
  }

  if (elapsedDays < 2) {
    return {
      enabled: false,
      reason: "payment-rollout-day-1-2",
      rolloutStartDate: startValue,
      currentRolloutDay,
      elapsedDays,
      forceDisabled: false,
    };
  }

  return {
    enabled: true,
    rolloutStartDate: startValue,
    currentRolloutDay,
    elapsedDays,
    forceDisabled: false,
  };
}
