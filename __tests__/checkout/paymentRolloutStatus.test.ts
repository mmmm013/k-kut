import assert from "node:assert/strict";
import test from "node:test";
import { paymentRolloutStatus } from "../../lib/paymentRolloutStatus.ts";

test("blocks day 1 and day 2, then enables on day 3", () => {
  process.env.K_KUT_PAYMENT_LINKS_FORCE_DISABLE = "";
  process.env.K_KUT_PAYMENT_LINKS_START_DATE = "2026-09-01";

  const day1 = paymentRolloutStatus(new Date("2026-09-01T12:00:00.000Z"));
  assert.equal(day1.enabled, false);
  assert.equal(day1.reason, "payment-rollout-day-1-2");
  assert.equal(day1.currentRolloutDay, 1);

  const day2 = paymentRolloutStatus(new Date("2026-09-02T12:00:00.000Z"));
  assert.equal(day2.enabled, false);
  assert.equal(day2.reason, "payment-rollout-day-1-2");
  assert.equal(day2.currentRolloutDay, 2);

  const day3 = paymentRolloutStatus(new Date("2026-09-03T12:00:00.000Z"));
  assert.equal(day3.enabled, true);
  assert.equal(day3.reason, undefined);
  assert.equal(day3.currentRolloutDay, 3);
});

test("reports force-disabled rollout state", () => {
  process.env.K_KUT_PAYMENT_LINKS_FORCE_DISABLE = "1";
  process.env.K_KUT_PAYMENT_LINKS_START_DATE = "2026-09-01";

  const status = paymentRolloutStatus(new Date("2026-09-03T12:00:00.000Z"));
  assert.equal(status.enabled, false);
  assert.equal(status.reason, "payment-rollout-force-disabled");
  assert.equal(status.forceDisabled, true);
  assert.equal(status.currentRolloutDay, null);
});

test("reports missing, invalid, and future rollout start dates", () => {
  process.env.K_KUT_PAYMENT_LINKS_FORCE_DISABLE = "";
  delete process.env.K_KUT_PAYMENT_LINKS_START_DATE;

  const missing = paymentRolloutStatus(new Date("2026-09-03T12:00:00.000Z"));
  assert.equal(missing.enabled, false);
  assert.equal(missing.reason, "payment-rollout-start-date-missing");

  process.env.K_KUT_PAYMENT_LINKS_START_DATE = "invalid-date";
  const invalid = paymentRolloutStatus(new Date("2026-09-03T12:00:00.000Z"));
  assert.equal(invalid.enabled, false);
  assert.equal(invalid.reason, "payment-rollout-start-date-invalid");

  process.env.K_KUT_PAYMENT_LINKS_START_DATE = "2026-09-05";
  const future = paymentRolloutStatus(new Date("2026-09-03T12:00:00.000Z"));
  assert.equal(future.enabled, false);
  assert.equal(future.reason, "payment-rollout-not-started");
  assert.equal(future.elapsedDays, -2);
});
