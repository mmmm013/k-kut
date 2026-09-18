// Owner-authorized promotion. America/Chicago is UTC-05:00 on these dates.
export const FREE_WEEKEND_START = "2026-09-18T00:00:00-05:00";
export const FREE_WEEKEND_END = "2026-09-21T00:00:13-05:00";
export const FREE_WEEKEND_ID = "free-weekend-2026-09-18";
export function weekendPricing(regularPriceCents: number, now = new Date()) {
  const free = now.getTime() >= Date.parse(FREE_WEEKEND_START) &&
    now.getTime() < Date.parse(FREE_WEEKEND_END);
  return { free, amountCents: free ? 0 : regularPriceCents,
    promotionId: free ? FREE_WEEKEND_ID : "regular" };
}
export function validFreeWeekendSession(session: {
  created?: number; status?: string | null; payment_status: string;
  amount_total: number | null; metadata: Record<string, string> | null;
}) {
  return session.status === "complete" && session.payment_status === "no_payment_required" &&
    session.amount_total === 0 && session.metadata?.promotion_id === FREE_WEEKEND_ID &&
    typeof session.created === "number" &&
    weekendPricing(1, new Date(session.created * 1000)).free;
}
