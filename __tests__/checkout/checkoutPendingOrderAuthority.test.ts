import assert from "node:assert/strict";
import test from "node:test";
import { createCheckoutPendingOrderAuthority } from "../../lib/checkoutPendingOrderAuthority.ts";

const BASE_INPUT = {
  inventoryId: "ii-approved-123",
  personalNote: "You matter",
  bfProfile: "k-kut",
  originDomain: "k-kut.com",
  publicProductName: "HUG",
  stripeSecretKey: "sk_live_1234567890",
};

test("short-circuits before pending-order creation when rollout is disabled", async () => {
  let createCalls = 0;

  const result = await createCheckoutPendingOrderAuthority(BASE_INPUT, {
    paymentRolloutStatus: () => ({
      enabled: false,
      reason: "payment-rollout-day-1-2",
      rolloutStartDate: "2026-09-01",
      currentRolloutDay: 1,
      elapsedDays: 0,
      forceDisabled: false,
    }),
    createPendingH2Order: async () => {
      createCalls += 1;
      return "a".repeat(32);
    },
  });

  assert.equal(result.ok, false);
  assert.equal(result.reason, "payment-rollout-day-1-2");
  assert.equal(createCalls, 0);
});

test("short-circuits before pending-order creation when stripe key is invalid", async () => {
  let createCalls = 0;

  const result = await createCheckoutPendingOrderAuthority(
    { ...BASE_INPUT, stripeSecretKey: "sk_test_bad" },
    {
      paymentRolloutStatus: () => ({
        enabled: true,
        rolloutStartDate: "2026-09-01",
        currentRolloutDay: 3,
        elapsedDays: 2,
        forceDisabled: false,
      }),
      createPendingH2Order: async () => {
        createCalls += 1;
        return "a".repeat(32);
      },
    },
  );

  assert.equal(result.ok, false);
  assert.equal(result.reason, "stripe-secret-key-invalid");
  assert.equal(createCalls, 0);
});

test("creates pending-order client reference only after rollout and stripe checks pass", async () => {
  let createCalls = 0;

  const result = await createCheckoutPendingOrderAuthority(BASE_INPUT, {
    paymentRolloutStatus: () => ({
      enabled: true,
      rolloutStartDate: "2026-09-01",
      currentRolloutDay: 3,
      elapsedDays: 2,
      forceDisabled: false,
    }),
    createPendingH2Order: async (input) => {
      createCalls += 1;
      assert.equal(input.inventoryId, BASE_INPUT.inventoryId);
      assert.equal(input.publicProductName, BASE_INPUT.publicProductName);
      return "a".repeat(32);
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.clientReference, `H2_${"a".repeat(32)}`);
  assert.equal(result.stripeSecretKey, BASE_INPUT.stripeSecretKey);
  assert.equal(createCalls, 1);
});
