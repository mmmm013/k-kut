import {
  paymentRolloutStatus,
  type PaymentRolloutStatus,
} from "./paymentRolloutStatus.ts";

const CLIENT_REFERENCE_LIMIT = 200;
const H2_CLIENT_REFERENCE_PREFIX = "H2_";

type CreateCheckoutPendingOrderAuthorityInput = {
  inventoryId: string;
  personalNote: string;
  bfProfile: string;
  originDomain: string;
  publicProductName: string;
  stripeSecretKey: string | undefined;
};

type CreatePendingH2OrderInput = {
  inventoryId: string;
  personalNote: string;
  bfProfile: string;
  originDomain: string;
  publicProductName: string;
};

type CreatePendingH2OrderFn = (
  input: CreatePendingH2OrderInput,
) => Promise<string>;

type CreateCheckoutPendingOrderAuthorityDependencies = {
  createPendingH2Order?: CreatePendingH2OrderFn;
  paymentRolloutStatus?: typeof paymentRolloutStatus;
};

type CheckoutPendingOrderAuthorityFailure = {
  ok: false;
  reason: string;
  rollout: PaymentRolloutStatus;
  errorMessage?: string;
};

type CheckoutPendingOrderAuthoritySuccess = {
  ok: true;
  clientReference: string;
  stripeSecretKey: string;
  rollout: PaymentRolloutStatus;
};

export type CheckoutPendingOrderAuthorityResult =
  | CheckoutPendingOrderAuthorityFailure
  | CheckoutPendingOrderAuthoritySuccess;

export function isLiveStripeSecretKey(value: string) {
  return /^(?:sk|rk)_live_[A-Za-z0-9]+$/u.test(value);
}

async function defaultCreatePendingH2Order(input: CreatePendingH2OrderInput) {
  const { createPendingH2Order } = await import("./h2PendingOrder.ts");
  return createPendingH2Order(input);
}

export async function createCheckoutPendingOrderAuthority(
  input: CreateCheckoutPendingOrderAuthorityInput,
  dependencies: CreateCheckoutPendingOrderAuthorityDependencies = {},
): Promise<CheckoutPendingOrderAuthorityResult> {
  const rollout = (dependencies.paymentRolloutStatus || paymentRolloutStatus)();
  if (!rollout.enabled) {
    return {
      ok: false,
      reason: rollout.reason || "payment-rollout-disabled",
      rollout,
    };
  }

  const stripeSecretKey = String(input.stripeSecretKey || "").trim();
  if (!isLiveStripeSecretKey(stripeSecretKey)) {
    return {
      ok: false,
      reason: "stripe-secret-key-invalid",
      rollout,
    };
  }

  let token: string;
  try {
    token = await (dependencies.createPendingH2Order || defaultCreatePendingH2Order)({
      inventoryId: input.inventoryId,
      personalNote: input.personalNote,
      bfProfile: input.bfProfile,
      originDomain: input.originDomain,
      publicProductName: input.publicProductName,
    });
  } catch (reason) {
    return {
      ok: false,
      reason: "pending-order-unavailable",
      rollout,
      errorMessage:
        reason instanceof Error ? reason.message : "unidentified_error",
    };
  }

  const clientReference = `${H2_CLIENT_REFERENCE_PREFIX}${token}`;
  if (
    clientReference.length > CLIENT_REFERENCE_LIMIT ||
    !/^[A-Za-z0-9_-]+$/.test(clientReference)
  ) {
    return {
      ok: false,
      reason: "pending-order-reference-invalid",
      rollout,
    };
  }

  return {
    ok: true,
    clientReference,
    stripeSecretKey,
    rollout,
  };
}
