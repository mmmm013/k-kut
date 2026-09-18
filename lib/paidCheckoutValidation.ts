import { validFreeWeekendSession } from "./weekendPricing";
type PaidSelection = {
  id: string;
  created?: number;
  status?: string | null;
  payment_status: string;
  amount_total: number | null;
  currency: string | null;
  metadata: Record<string, string> | null;
};
type ApprovedSelection = {
  public_option_id: string;
  kk_id_or_delivery_object_id: string;
  product_family: "HUG" | "TUG" | "BUG";
  inventory_family: "KK" | "SK" | "MK";
  price_cents: number;
  payment_allowed: boolean;
};
const prices = { HUG: 799, TUG: 499, BUG: 199 };
const families = { HUG: "KK", TUG: "SK", BUG: "MK" };
export function validatePaidCheckout(session: PaidSelection, option: ApprovedSelection | null) {
  const free = validFreeWeekendSession(session);
  if (session.payment_status !== "paid" && !free) return "payment_not_paid";
  if (!option || !option.payment_allowed) return "selection_unavailable";
  const metadata = session.metadata || {};
  if (metadata.public_option_id !== option.public_option_id ||
      metadata.selected_hug_id !== option.kk_id_or_delivery_object_id ||
      metadata.product_family !== option.product_family ||
      metadata.inventory_family !== option.inventory_family) return "selection_mismatch";
  if (option.inventory_family !== families[option.product_family] ||
      option.price_cents !== prices[option.product_family] ||
      session.amount_total !== (free ? 0 : option.price_cents) ||
      session.currency?.toLowerCase() !== "usd" ||
      metadata.locked_price_cents !== String(option.price_cents)) return "payment_amount_mismatch";
  return null;
}
